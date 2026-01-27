import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Scale, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CollectionPoint {
  id: string;
  name: string;
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
  collection_point?: CollectionPoint;
  user_profile?: { full_name: string };
  staff_profile?: { full_name: string };
}

export function WeighingsManagement() {
  const { user } = useAuth();
  const [weighings, setWeighings] = useState<Weighing[]>([]);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; user_id: string; full_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
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

    setWeighings(weighingsData as Weighing[] || []);
    setCollectionPoints(pointsData || []);
    setProfiles(profilesData || []);
    setIsLoading(false);
  };

  const createWeighing = async () => {
    if (!formData.collection_point_id || !formData.user_id || !formData.weight_grams) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const { error } = await supabase
      .from('weighings')
      .insert({
        collection_point_id: formData.collection_point_id,
        user_id: formData.user_id,
        weight_grams: formData.weight_grams,
        weighed_by: user?.id,
        notes: formData.notes || null
      });

    if (error) {
      toast.error('Erro ao registrar pesagem');
      console.error(error);
      return;
    }

    toast.success('Pesagem registrada com sucesso!');
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
                  = {(formData.weight_grams / 100).toFixed(0)} PROs (100g cada)
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
                Registrar Pesagem
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ponto de Coleta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>PROs</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weighings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Nenhuma pesagem registrada
                    </TableCell>
                  </TableRow>
                ) : (
                  weighings.map((weighing) => (
                    <TableRow key={weighing.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{format(new Date(weighing.weighed_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                          <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                          <span>{format(new Date(weighing.weighed_at), "HH:mm", { locale: ptBR })}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getPointName(weighing.collection_point_id)}</TableCell>
                      <TableCell>{getProfileName(weighing.user_id)}</TableCell>
                      <TableCell>{weighing.weight_grams}g</TableCell>
                      <TableCell className="font-medium text-primary">
                        {Math.floor(weighing.weight_grams / 100)} PROs
                      </TableCell>
                      <TableCell>{getProfileName(weighing.weighed_by)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {weighing.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
