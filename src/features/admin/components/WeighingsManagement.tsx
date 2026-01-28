import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Plus, Scale, Calendar, Clock, ChevronDown, ChevronRight, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CollectionPoint {
  id: string;
  name: string;
}

interface PRO {
  id: string;
  code: string;
  status: string;
  fifo_position: number;
  created_at: string;
}

interface Weighing {
  id: string;
  collection_point_id: string;
  user_id: string;
  weight_grams: number;
  weighed_by: string;
  weighed_at: string;
  notes: string | null;
  created_at: string;
  pros?: PRO[];
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    processing: 'Em processamento',
    ready: 'Virou adubo',
    sold: 'Adubo vendido',
    paid: 'Pagamento liberado',
  };
  return labels[status] || status;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    processing: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    ready: 'bg-green-500/20 text-green-700 border-green-500/30',
    sold: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    paid: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
};

export function WeighingsManagement() {
  const { user } = useAuth();
  const [weighings, setWeighings] = useState<Weighing[]>([]);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; user_id: string; full_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedWeighings, setExpandedWeighings] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    collection_point_id: '',
    user_id: '',
    weight_grams: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch weighings
    const { data: weighingsData, error: weighingsError } = await supabase
      .from('weighings')
      .select('*')
      .order('weighed_at', { ascending: false });

    if (weighingsError) {
      toast.error('Erro ao carregar pesagens');
      console.error(weighingsError);
    }

    // Fetch collection points
    const { data: pointsData } = await supabase
      .from('collection_points')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    // Fetch profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, user_id, full_name')
      .order('full_name');

    // Fetch PROs for each weighing (by collection_point_id and user_id match on created_at)
    const weighingsWithPros: Weighing[] = [];
    
    if (weighingsData) {
      for (const weighing of weighingsData) {
        // Fetch PROs created for this user at this collection point around the weighing time
        const { data: prosData } = await supabase
          .from('pros')
          .select('id, code, status, fifo_position, created_at')
          .eq('user_id', weighing.user_id)
          .eq('collection_point_id', weighing.collection_point_id)
          .gte('created_at', new Date(new Date(weighing.weighed_at).getTime() - 60000).toISOString())
          .lte('created_at', new Date(new Date(weighing.weighed_at).getTime() + 60000).toISOString())
          .order('fifo_position', { ascending: true });

        weighingsWithPros.push({
          ...weighing,
          pros: prosData || []
        });
      }
    }

    setWeighings(weighingsWithPros);
    setCollectionPoints(pointsData || []);
    setProfiles(profilesData || []);
    setIsLoading(false);
  };

  const createWeighing = async () => {
    if (!formData.collection_point_id || !formData.user_id || !formData.weight_grams) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const proCount = Math.floor(formData.weight_grams / 100);
    if (proCount < 1) {
      toast.error('Peso mínimo de 100g para gerar 1 PRO');
      return;
    }

    // Create the weighing
    const { data: weighingData, error: weighingError } = await supabase
      .from('weighings')
      .insert({
        collection_point_id: formData.collection_point_id,
        user_id: formData.user_id,
        weight_grams: formData.weight_grams,
        weighed_by: user?.id,
        notes: formData.notes || null
      })
      .select()
      .single();

    if (weighingError) {
      toast.error('Erro ao registrar pesagem');
      console.error(weighingError);
      return;
    }

    // Create PROs for this weighing (100g = 1 PRO)
    const prosToCreate = [];
    for (let i = 0; i < proCount; i++) {
      // Get next FIFO position
      const { data: nextPosData } = await supabase.rpc('get_next_fifo_position');
      const fifoPosition = (nextPosData as number) + i;

      // Generate unique PRO code
      const { data: proCodeData } = await supabase.rpc('generate_pro_code');
      
      prosToCreate.push({
        code: proCodeData as string,
        user_id: formData.user_id,
        collection_point_id: formData.collection_point_id,
        weight_grams: 100,
        fifo_position: fifoPosition,
        status: 'processing' as const
      });
    }

    // Insert all PROs
    const { error: prosError } = await supabase
      .from('pros')
      .insert(prosToCreate);

    if (prosError) {
      toast.error('Erro ao criar PROs');
      console.error(prosError);
      return;
    }

    // Also add to FIFO queue
    const fifoEntries = prosToCreate.map((pro, index) => ({
      pro_id: '', // Will be updated after fetching
      position: pro.fifo_position,
      status: 'processing' as const
    }));

    toast.success(`Pesagem registrada! ${proCount} PRO(s) criado(s) com sucesso!`);
    setIsAddOpen(false);
    setFormData({ collection_point_id: '', user_id: '', weight_grams: 0, notes: '' });
    fetchData();
  };

  const getPointName = (pointId: string) => {
    return collectionPoints.find(p => p.id === pointId)?.name || 'Desconhecido';
  };

  const getProfileName = (userId: string) => {
    return profiles.find(p => p.user_id === userId)?.full_name || 'Desconhecido';
  };

  const toggleExpanded = (weighingId: string) => {
    setExpandedWeighings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weighingId)) {
        newSet.delete(weighingId);
      } else {
        newSet.add(weighingId);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registro de Pesagens</CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="earth-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Nova Pesagem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pesagem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Ponto de Coleta *</Label>
                <Select 
                  value={formData.collection_point_id} 
                  onValueChange={(v) => setFormData({ ...formData, collection_point_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ponto" />
                  </SelectTrigger>
                  <SelectContent>
                    {collectionPoints.map((point) => (
                      <SelectItem key={point.id} value={point.id}>
                        {point.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select 
                  value={formData.user_id} 
                  onValueChange={(v) => setFormData({ ...formData, user_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.user_id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Peso (gramas) *</Label>
                <Input
                  type="number"
                  placeholder="500"
                  value={formData.weight_grams || ''}
                  onChange={(e) => setFormData({ ...formData, weight_grams: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  = {Math.floor(formData.weight_grams / 100)} PRO(s) serão gerados (100g = 1 PRO)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Observações sobre a pesagem..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <Button onClick={createWeighing} className="w-full">
                Registrar Pesagem e Gerar PROs
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {weighings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
                Nenhuma pesagem registrada
              </div>
            ) : (
              weighings.map((weighing) => (
                <Collapsible
                  key={weighing.id}
                  open={expandedWeighings.has(weighing.id)}
                  onOpenChange={() => toggleExpanded(weighing.id)}
                >
                  <div className="border rounded-lg">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {expandedWeighings.has(weighing.id) ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <div className="flex items-center gap-2 font-medium">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {format(new Date(weighing.weighed_at), "dd/MM/yyyy", { locale: ptBR })}
                              <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                              {format(new Date(weighing.weighed_at), "HH:mm", { locale: ptBR })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getPointName(weighing.collection_point_id)} • {getProfileName(weighing.user_id)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{weighing.weight_grams}g</div>
                            <div className="text-sm text-primary flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {weighing.pros?.length || Math.floor(weighing.weight_grams / 100)} PROs
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t p-4 bg-muted/30">
                        <div className="mb-3 text-sm text-muted-foreground">
                          <strong>Registrado por:</strong> {getProfileName(weighing.weighed_by)}
                          {weighing.notes && (
                            <span className="ml-4"><strong>Obs:</strong> {weighing.notes}</span>
                          )}
                        </div>
                        
                        <div className="text-sm font-medium mb-2">PROs Gerados:</div>
                        {weighing.pros && weighing.pros.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {weighing.pros.map((pro) => (
                              <div 
                                key={pro.id} 
                                className="flex items-center justify-between p-2 bg-background border rounded"
                              >
                                <div>
                                  <div className="font-mono text-sm font-medium">{pro.code}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Posição FIFO: #{pro.fifo_position}
                                  </div>
                                </div>
                                <Badge className={getStatusColor(pro.status)}>
                                  {getStatusLabel(pro.status)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground italic">
                            Nenhum PRO registrado ainda (pesagem anterior à funcionalidade)
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
