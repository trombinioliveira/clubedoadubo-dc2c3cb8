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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, MapPin, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  is_active: boolean;
  created_at: string;
}

export function CollectionPointsManagement() {
  const { user } = useAuth();
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<CollectionPoint | null>(null);
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
    
    const { data, error } = await supabase
      .from('collection_points')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar pontos de coleta');
      console.error(error);
    } else {
      setPoints(data as CollectionPoint[] || []);
    }
    
    setIsLoading(false);
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

  const openEditDialog = (point: CollectionPoint) => {
    setEditingPoint(point);
    setFormData({
      name: point.name,
      address: point.address,
      city: point.city,
      state: point.state
    });
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
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Cidade/Estado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Nenhum ponto de coleta cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  points.map((point) => (
                    <TableRow key={point.id}>
                      <TableCell className="font-medium">{point.name}</TableCell>
                      <TableCell>{point.address}</TableCell>
                      <TableCell>{point.city}/{point.state}</TableCell>
                      <TableCell>
                        <Badge variant={point.is_active ? 'default' : 'secondary'}>
                          {point.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(point.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
                        </div>
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
