import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type CommissionLevel = Tables<'commission_levels'>;

export function CommissionLevelsEditor() {
  const queryClient = useQueryClient();
  const [editingLevel, setEditingLevel] = useState<CommissionLevel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: levels, isLoading } = useQuery({
    queryKey: ['commission-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_levels')
        .select('*')
        .order('level_number', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (level: Partial<CommissionLevel> & { id: string }) => {
      const { error } = await supabase
        .from('commission_levels')
        .update(level)
        .eq('id', level.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-levels'] });
      toast.success('Nível atualizado');
      setIsDialogOpen(false);
      setEditingLevel(null);
    },
    onError: () => {
      toast.error('Erro ao atualizar nível');
    },
  });

  const createMutation = useMutation({
    mutationFn: async (level: Omit<CommissionLevel, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('commission_levels').insert(level);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-levels'] });
      toast.success('Nível criado');
      setIsDialogOpen(false);
      setEditingLevel(null);
    },
    onError: () => {
      toast.error('Erro ao criar nível');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('commission_levels').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-levels'] });
      toast.success('Nível removido');
    },
    onError: () => {
      toast.error('Erro ao remover nível');
    },
  });

  const toggleActive = async (level: CommissionLevel) => {
    await updateMutation.mutateAsync({
      id: level.id,
      is_active: !level.is_active,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      label: formData.get('label') as string,
      level_number: parseInt(formData.get('level_number') as string),
      min_referrals: parseInt(formData.get('min_referrals') as string),
      max_referrals: formData.get('max_referrals') 
        ? parseInt(formData.get('max_referrals') as string) 
        : null,
      rate_percent: parseFloat(formData.get('rate_percent') as string),
      is_active: true,
    };

    if (editingLevel) {
      updateMutation.mutate({ id: editingLevel.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (level: CommissionLevel) => {
    setEditingLevel(level);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingLevel(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Níveis de Comissão</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Nível
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLevel ? 'Editar Nível' : 'Novo Nível de Comissão'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Nome</Label>
                  <Input
                    id="label"
                    name="label"
                    defaultValue={editingLevel?.label}
                    placeholder="Ex: Iniciante"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level_number">Número do Nível</Label>
                  <Input
                    id="level_number"
                    name="level_number"
                    type="number"
                    min={1}
                    defaultValue={editingLevel?.level_number ?? (levels?.length ?? 0) + 1}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_referrals">Mín. Indicados</Label>
                  <Input
                    id="min_referrals"
                    name="min_referrals"
                    type="number"
                    min={0}
                    defaultValue={editingLevel?.min_referrals ?? 0}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_referrals">Máx. Indicados (vazio = ilimitado)</Label>
                  <Input
                    id="max_referrals"
                    name="max_referrals"
                    type="number"
                    min={0}
                    defaultValue={editingLevel?.max_referrals ?? ''}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate_percent">Taxa de Comissão (%)</Label>
                <Input
                  id="rate_percent"
                  name="rate_percent"
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  defaultValue={editingLevel?.rate_percent ?? 5}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending || createMutation.isPending}>
                  {editingLevel ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nível</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Indicados</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels?.map((level) => (
              <TableRow key={level.id}>
                <TableCell className="font-medium">{level.level_number}</TableCell>
                <TableCell>{level.label}</TableCell>
                <TableCell>
                  {level.min_referrals}
                  {level.max_referrals ? ` - ${level.max_referrals}` : '+'}
                </TableCell>
                <TableCell>{level.rate_percent}%</TableCell>
                <TableCell>
                  <Switch
                    checked={level.is_active}
                    onCheckedChange={() => toggleActive(level)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(level)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(level.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
