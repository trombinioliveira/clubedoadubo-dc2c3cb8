import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type BatchType = 'composting' | 'vermicomposting';
type BatchStatus = 'processing' | 'ready' | 'partial_sold' | 'sold';

interface Batch {
  id: string;
  code: string;
  batch_type: BatchType;
  status: BatchStatus;
  total_weight_grams: number;
  start_date: string;
  ready_date: string | null;
  created_at: string;
}

export function BatchesManagement() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    code: '',
    batch_type: 'composting' as BatchType,
    total_weight_grams: 0
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar lotes');
      console.error(error);
    } else {
      setBatches(data as Batch[] || []);
    }
    
    setIsLoading(false);
  };

  const createBatch = async () => {
    if (!newBatch.code) {
      toast.error('Código do lote é obrigatório');
      return;
    }

    const { error } = await supabase
      .from('batches')
      .insert({
        code: newBatch.code,
        batch_type: newBatch.batch_type,
        total_weight_grams: newBatch.total_weight_grams,
        created_by: user?.id
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('Já existe um lote com este código');
      } else {
        toast.error('Erro ao criar lote');
      }
      return;
    }

    toast.success('Lote criado com sucesso!');
    setIsAddOpen(false);
    setNewBatch({ code: '', batch_type: 'composting', total_weight_grams: 0 });
    fetchBatches();
  };

  const updateBatchStatus = async (batchId: string, newStatus: BatchStatus) => {
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'ready') {
      updates.ready_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('batches')
      .update(updates)
      .eq('id', batchId);

    if (error) {
      toast.error('Erro ao atualizar status');
      return;
    }

    toast.success('Status atualizado!');
    fetchBatches();
  };

  const getStatusBadge = (status: BatchStatus) => {
    const configs = {
      processing: { label: 'Processando', variant: 'default' as const },
      ready: { label: 'Pronto', variant: 'secondary' as const },
      partial_sold: { label: 'Parcialmente Vendido', variant: 'outline' as const },
      sold: { label: 'Vendido', variant: 'destructive' as const }
    };
    const config = configs[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: BatchType) => {
    return type === 'composting' ? 'Compostagem' : 'Vermicompostagem';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Lotes</CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="earth-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Novo Lote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Lote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Código do Lote</Label>
                <Input
                  placeholder="LOTE-2024-001"
                  value={newBatch.code}
                  onChange={(e) => setNewBatch({ ...newBatch, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={newBatch.batch_type} 
                  onValueChange={(v) => setNewBatch({ ...newBatch, batch_type: v as BatchType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="composting">Compostagem</SelectItem>
                    <SelectItem value="vermicomposting">Vermicompostagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Peso Total (gramas)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={newBatch.total_weight_grams || ''}
                  onChange={(e) => setNewBatch({ ...newBatch, total_weight_grams: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Button onClick={createBatch} className="w-full">
                Criar Lote
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
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Peso Total</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Pronto</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Nenhum lote cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono font-medium">{batch.code}</TableCell>
                      <TableCell>{getTypeLabel(batch.batch_type)}</TableCell>
                      <TableCell>{getStatusBadge(batch.status)}</TableCell>
                      <TableCell>{(batch.total_weight_grams / 1000).toFixed(1)} kg</TableCell>
                      <TableCell>
                        {format(new Date(batch.start_date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {batch.ready_date 
                          ? format(new Date(batch.ready_date), "dd/MM/yyyy", { locale: ptBR })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={batch.status}
                          onValueChange={(v) => updateBatchStatus(batch.id, v as BatchStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="processing">Processando</SelectItem>
                            <SelectItem value="ready">Pronto</SelectItem>
                            <SelectItem value="partial_sold">Parc. Vendido</SelectItem>
                            <SelectItem value="sold">Vendido</SelectItem>
                          </SelectContent>
                        </Select>
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
