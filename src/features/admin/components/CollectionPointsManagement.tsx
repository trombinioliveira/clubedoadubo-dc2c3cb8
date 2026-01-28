import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Plus, MapPin, Edit, ChevronDown, ChevronRight, Scale, Calendar, Clock, Package, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PRO {
  id: string;
  code: string;
  status: string;
  fifo_position: number;
}

interface Weighing {
  id: string;
  weight_grams: number;
  weighed_at: string;
  weighed_by: string;
  user_id: string;
  notes: string | null;
  pros?: PRO[];
}

interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  is_active: boolean;
  created_at: string;
  weighings?: Weighing[];
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

export function CollectionPointsManagement() {
  const { user } = useAuth();
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [profiles, setProfiles] = useState<{ user_id: string; full_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<CollectionPoint | null>(null);
  const [expandedPoints, setExpandedPoints] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: 'SP'
  });

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    setIsLoading(true);
    
    // Fetch all data in parallel
    const [pointsResult, profilesResult] = await Promise.all([
      supabase.from('collection_points').select('*').order('name', { ascending: true }),
      supabase.from('profiles').select('user_id, full_name')
    ]);

    if (pointsResult.error) {
      toast.error('Erro ao carregar pontos de coleta');
      console.error(pointsResult.error);
      setIsLoading(false);
      return;
    }

    setProfiles(profilesResult.data || []);

    // For each point, fetch weighings and their PROs
    const pointsWithWeighings: CollectionPoint[] = [];
    
    for (const point of (pointsResult.data || [])) {
      const { data: weighingsData } = await supabase
        .from('weighings')
        .select('id, weight_grams, weighed_at, weighed_by, notes, user_id')
        .eq('collection_point_id', point.id)
        .order('weighed_at', { ascending: false })
        .limit(50);

      const weighingsWithPros: Weighing[] = [];
      
      for (const weighing of (weighingsData || [])) {
        const { data: prosData } = await supabase
          .from('pros')
          .select('id, code, status, fifo_position')
          .eq('collection_point_id', point.id)
          .eq('user_id', weighing.user_id)
          .gte('created_at', new Date(new Date(weighing.weighed_at).getTime() - 60000).toISOString())
          .lte('created_at', new Date(new Date(weighing.weighed_at).getTime() + 60000).toISOString())
          .order('fifo_position', { ascending: true });

        weighingsWithPros.push({
          ...weighing,
          pros: prosData || []
        });
      }

      pointsWithWeighings.push({
        ...point,
        weighings: weighingsWithPros
      });
    }
    
    setPoints(pointsWithWeighings);
    setIsLoading(false);
  };

  const getProfileName = (userId: string) => {
    return profiles.find(p => p.user_id === userId)?.full_name || 'Desconhecido';
  };

  const createPoint = async () => {
    if (!formData.name || !formData.address || !formData.city) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const { error } = await supabase
      .from('collection_points')
      .insert({
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        created_by: user?.id
      });

    if (error) {
      toast.error('Erro ao criar ponto de coleta');
      return;
    }

    toast.success('Ponto de coleta criado com sucesso!');
    setIsAddOpen(false);
    setFormData({ name: '', address: '', city: '', state: 'SP' });
    fetchPoints();
  };

  const updatePoint = async () => {
    if (!editingPoint) return;

    const { error } = await supabase
      .from('collection_points')
      .update({
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state
      })
      .eq('id', editingPoint.id);

    if (error) {
      toast.error('Erro ao atualizar ponto de coleta');
      return;
    }

    toast.success('Ponto de coleta atualizado!');
    setEditingPoint(null);
    setFormData({ name: '', address: '', city: '', state: 'SP' });
    fetchPoints();
  };

  const toggleActive = async (point: CollectionPoint) => {
    const { error } = await supabase
      .from('collection_points')
      .update({ is_active: !point.is_active })
      .eq('id', point.id);

    if (error) {
      toast.error('Erro ao atualizar status');
      return;
    }

    toast.success(point.is_active ? 'Ponto desativado' : 'Ponto ativado');
    fetchPoints();
  };

  const deletePoint = async (pointId: string) => {
    try {
      // First delete all PROs associated with this collection point
      const { error: prosError } = await supabase
        .from('pros')
        .delete()
        .eq('collection_point_id', pointId);

      if (prosError) {
        throw new Error('Erro ao deletar PROs: ' + prosError.message);
      }

      // Then delete all weighings
      const { error: weighingsError } = await supabase
        .from('weighings')
        .delete()
        .eq('collection_point_id', pointId);

      if (weighingsError) {
        throw new Error('Erro ao deletar pesagens: ' + weighingsError.message);
      }

      // Finally delete the collection point
      const { error } = await supabase
        .from('collection_points')
        .delete()
        .eq('id', pointId);

      if (error) {
        throw new Error('Erro ao deletar ponto: ' + error.message);
      }

      toast.success('Ponto de coleta deletado com sucesso!');
      fetchPoints();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar');
      console.error(error);
    }
  };

  const deleteWeighing = async (weighingId: string, pros: PRO[] | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Delete associated PROs first
      if (pros && pros.length > 0) {
        const proIds = pros.map(p => p.id);
        const { error: prosError } = await supabase
          .from('pros')
          .delete()
          .in('id', proIds);

        if (prosError) {
          throw new Error('Erro ao deletar PROs: ' + prosError.message);
        }
      }

      // Delete the weighing
      const { error } = await supabase
        .from('weighings')
        .delete()
        .eq('id', weighingId);

      if (error) {
        throw new Error('Erro ao deletar pesagem: ' + error.message);
      }

      toast.success('Pesagem deletada com sucesso!');
      fetchPoints();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar');
      console.error(error);
    }
  };

  const openEditDialog = (point: CollectionPoint) => {
    setEditingPoint(point);
    setFormData({
      name: point.name,
      address: point.address,
      city: point.city,
      state: point.state
    });
  };

  const toggleExpanded = (pointId: string) => {
    setExpandedPoints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pointId)) {
        newSet.delete(pointId);
      } else {
        newSet.add(pointId);
      }
      return newSet;
    });
  };

  const getTotalPros = (point: CollectionPoint) => {
    return point.weighings?.reduce((acc, w) => acc + (w.pros?.length || 0), 0) || 0;
  };

  const getTotalWeight = (point: CollectionPoint) => {
    return point.weighings?.reduce((acc, w) => acc + w.weight_grams, 0) || 0;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pontos de Coleta</CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="earth-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Novo Ponto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Ponto de Coleta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  placeholder="Mercado Central"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço *</Label>
                <Input
                  placeholder="Rua das Flores, 123"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Input
                    placeholder="São Paulo"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    placeholder="SP"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    maxLength={2}
                  />
                </div>
              </div>
              <Button onClick={createPoint} className="w-full">
                Criar Ponto de Coleta
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
        ) : points.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            Nenhum ponto de coleta cadastrado
          </div>
        ) : (
          <div className="space-y-3">
            {points.map((point) => (
              <Collapsible
                key={point.id}
                open={expandedPoints.has(point.id)}
                onOpenChange={() => toggleExpanded(point.id)}
              >
                <div className="border rounded-lg">
                  <div className="flex items-center justify-between p-4">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-3 cursor-pointer flex-1">
                        {expandedPoints.has(point.id) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{point.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {point.address} • {point.city}/{point.state}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="font-medium">{(getTotalWeight(point) / 1000).toFixed(2)} kg</div>
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {getTotalPros(point)} PROs
                        </div>
                      </div>
                      <Badge variant={point.is_active ? 'default' : 'secondary'}>
                        {point.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Switch
                        checked={point.is_active}
                        onCheckedChange={() => toggleActive(point)}
                      />
                      <Dialog open={editingPoint?.id === point.id} onOpenChange={(open) => {
                        if (!open) {
                          setEditingPoint(null);
                          setFormData({ name: '', address: '', city: '', state: 'SP' });
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(point)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Ponto de Coleta</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Nome</Label>
                              <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Endereço</Label>
                              <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Cidade</Label>
                                <Input
                                  value={formData.city}
                                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Estado</Label>
                                <Input
                                  value={formData.state}
                                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                  maxLength={2}
                                />
                              </div>
                            </div>
                            <Button onClick={updatePoint} className="w-full">
                              Salvar Alterações
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar Ponto de Coleta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso irá deletar o ponto de coleta, todas as pesagens e PROs associados. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deletePoint(point.id)}
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="border-t p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Scale className="w-4 h-4" />
                          Pesagens ({point.weighings?.length || 0})
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          Criado em {format(new Date(point.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      
                      {point.weighings && point.weighings.length > 0 ? (
                        <div className="space-y-3">
                          {point.weighings.map((weighing) => (
                            <div key={weighing.id} className="bg-background border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    {format(new Date(weighing.weighed_at), "dd/MM/yyyy", { locale: ptBR })}
                                    <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                                    {format(new Date(weighing.weighed_at), "HH:mm:ss", { locale: ptBR })}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <span className="font-medium">{(weighing.weight_grams / 1000).toFixed(2)} kg</span>
                                    <span className="text-primary ml-2">
                                      ({weighing.pros?.length || Math.floor(weighing.weight_grams / 100)} PROs)
                                    </span>
                                  </div>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Deletar Pesagem?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Isso irá deletar a pesagem e todos os {weighing.pros?.length || 0} PROs associados.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          onClick={(e) => deleteWeighing(weighing.id, weighing.pros, e)}
                                        >
                                          Deletar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                              
                              <div className="text-xs text-muted-foreground mb-2">
                                Cliente: {getProfileName(weighing.user_id)} • Registrado por: {getProfileName(weighing.weighed_by)}
                                {weighing.notes && <span> • {weighing.notes}</span>}
                              </div>
                              
                              {weighing.pros && weighing.pros.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {weighing.pros.map((pro) => (
                                    <div 
                                      key={pro.id} 
                                      className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs"
                                    >
                                      <span className="font-mono font-medium">{pro.code}</span>
                                      <Badge className={`text-xs ${getStatusColor(pro.status)}`}>
                                        {getStatusLabel(pro.status)}
                                      </Badge>
                                      <span className="text-muted-foreground">#{pro.fifo_position}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma pesagem registrada neste ponto
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
