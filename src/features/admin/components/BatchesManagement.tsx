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
import { ExportCSVButton } from '@/components/shared/ExportCSVButton';
import { exportToCSV } from '@/lib/exportCSV';

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
    solid_weight_kg: 0,
    liquid_weight_kg: 0
  });
  const [processingProsCount, setProcessingProsCount] = useState(0);

  // Calculate total weight
  const totalWeightKg = newBatch.solid_weight_kg + newBatch.liquid_weight_kg;
  const totalWeightGrams = totalWeightKg * 1000;
  const prosToMove = Math.floor(totalWeightGrams / 100);

  useEffect(() => {
    fetchBatches();
    fetchProcessingProsCount();
  }, []);

  const fetchProcessingProsCount = async () => {
    const { count } = await supabase
      .from('pros')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');
    
    setProcessingProsCount(count || 0);
  };

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

    if (totalWeightGrams <= 0) {
      toast.error('É necessário informar pelo menos um peso (sólido ou líquido)');
      return;
    }

    if (prosToMove > processingProsCount) {
      toast.error(`Não há PROs suficientes em processamento. Disponíveis: ${processingProsCount}, Necessários: ${prosToMove}`);
      return;
    }

    // Create the batch first
    const { data: batchData, error: batchError } = await supabase
      .from('batches')
      .insert({
        code: newBatch.code,
        batch_type: newBatch.batch_type,
        total_weight_grams: totalWeightGrams,
        created_by: user?.id
      })
      .select('id')
      .single();

    if (batchError) {
      if (batchError.code === '23505') {
        toast.error('Já existe um lote com este código');
      } else {
        toast.error('Erro ao criar lote');
        console.error(batchError);
      }
      return;
    }

    // Get the PROs to move from 'processing' to 'ready' (FIFO order - smallest position first)
    const { data: prosToUpdate, error: prosSelectError } = await supabase
      .from('pros')
      .select('id')
      .eq('status', 'processing')
      .order('fifo_position', { ascending: true })
      .limit(prosToMove);

    if (prosSelectError || !prosToUpdate) {
      toast.error('Erro ao buscar PROs para atualizar');
      console.error(prosSelectError);
      return;
    }

    const proIds = prosToUpdate.map(p => p.id);
    const now = new Date().toISOString();

    // Update PROs status to 'ready' and link to batch
    const { error: prosUpdateError } = await supabase
      .from('pros')
      .update({ 
        status: 'ready',
        batch_id: batchData.id
      })
      .in('id', proIds);

    if (prosUpdateError) {
      toast.error('Erro ao atualizar status dos PROs');
      console.error(prosUpdateError);
      return;
    }

    // Update FIFO queue status
    const { error: fifoError } = await supabase
      .from('fifo_queue')
      .update({ status: 'ready' })
      .in('pro_id', proIds);

    if (fifoError) {
      console.error('Erro ao atualizar fila FIFO:', fifoError);
    }

    toast.success(`Lote criado com sucesso! ${prosToMove} PROs movidos para Produção.`);
    setIsAddOpen(false);
    setNewBatch({ code: '', batch_type: 'composting', solid_weight_kg: 0, liquid_weight_kg: 0 });
    fetchBatches();
    fetchProcessingProsCount();
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
        <div className="flex items-center gap-2">
          <ExportCSVButton
            onExport={async () => {
              const data = batches.map(b => ({
                id: b.id,
                codigo: b.code,
                tipo: b.batch_type === 'composting' ? 'Compostagem' : 'Vermicompostagem',
                status: b.status,
                peso_kg: (b.total_weight_grams / 1000).toFixed(1),
                data_inicio: format(new Date(b.start_date), 'dd/MM/yyyy'),
                data_pronto: b.ready_date ? format(new Date(b.ready_date), 'dd/MM/yyyy') : '',
              }));
              return exportToCSV(data, 'lotes', 'batches');
            }}
          />
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sólido (Kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newBatch.solid_weight_kg || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, solid_weight_kg: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Líquido (Kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newBatch.liquid_weight_kg || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, liquid_weight_kg: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Peso Total:</span>
                  <span className="font-medium">{totalWeightKg.toFixed(1)} Kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>PROs a mover para Produção:</span>
                  <span className="font-medium">{prosToMove}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>PROs em Processamento disponíveis:</span>
                  <span>{processingProsCount}</span>
                </div>
              </div>

              {prosToMove > processingProsCount && processingProsCount > 0 && (
                <p className="text-sm text-destructive">
                  Não há PROs suficientes em processamento. Reduza o peso ou aguarde mais coletas.
                </p>
              )}

              <Button 
                onClick={createBatch} 
                className="w-full"
                disabled={prosToMove > processingProsCount || prosToMove === 0}
              >
                Criar Lote
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
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
