import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, DollarSign, Wallet, Edit, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExportCSVButton } from '@/components/shared/ExportCSVButton';
import { exportToCSV } from '@/lib/exportCSV';

const PRO_VALUE = 2.00; // R$ 2,00 por PRO

interface FinancialEntry {
  id: string;
  amount: number;
  description: string | null;
  is_distributed: boolean;
  distributed_at: string | null;
  pros_paid: number;
  received_at: string;
  created_at: string;
}

export function FinancialManagement() {
  const { user, isAdmin } = useAuth();
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
  const [soldProsCount, setSoldProsCount] = useState(0);
  const [newEntry, setNewEntry] = useState({
    amount: 0,
    description: '',
    received_at: new Date().toISOString().slice(0, 16)
  });

  // Calculate totals
  const totalReceived = entries.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalDistributed = entries.filter(e => e.is_distributed).reduce((sum, e) => sum + Number(e.amount), 0);
  const availableBalance = totalReceived - totalDistributed;
  const prosCanPay = Math.floor(availableBalance / PRO_VALUE);

  useEffect(() => {
    fetchEntries();
    fetchSoldProsCount();
  }, []);

  const fetchSoldProsCount = async () => {
    const { count } = await supabase
      .from('pros')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sold');
    
    setSoldProsCount(count || 0);
  };

  const fetchEntries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('financial_entries')
      .select('*')
      .order('received_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar entradas financeiras');
      console.error(error);
    } else {
      setEntries(data || []);
    }
    setIsLoading(false);
  };

  const createEntry = async () => {
    if (newEntry.amount <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    const { error } = await supabase
      .from('financial_entries')
      .insert({
        amount: newEntry.amount,
        description: newEntry.description || null,
        received_at: new Date(newEntry.received_at).toISOString(),
        created_by: user?.id
      });

    if (error) {
      toast.error('Erro ao registrar entrada');
      console.error(error);
      return;
    }

    toast.success('Entrada financeira registrada!');
    setIsAddOpen(false);
    setNewEntry({ amount: 0, description: '', received_at: new Date().toISOString().slice(0, 16) });
    fetchEntries();
  };

  const updateEntry = async () => {
    if (!editingEntry) return;

    const { error } = await supabase
      .from('financial_entries')
      .update({
        amount: newEntry.amount,
        description: newEntry.description || null,
        received_at: new Date(newEntry.received_at).toISOString()
      })
      .eq('id', editingEntry.id);

    if (error) {
      toast.error('Erro ao atualizar entrada');
      console.error(error);
      return;
    }

    toast.success('Entrada atualizada!');
    setIsEditOpen(false);
    setEditingEntry(null);
    setNewEntry({ amount: 0, description: '', received_at: new Date().toISOString().slice(0, 16) });
    fetchEntries();
  };

  const openEdit = (entry: FinancialEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      amount: Number(entry.amount),
      description: entry.description || '',
      received_at: new Date(entry.received_at).toISOString().slice(0, 16)
    });
    setIsEditOpen(true);
  };

  const distributePayments = async () => {
    if (soldProsCount === 0) {
      toast.error('Não há PROs em Venda para pagar');
      return;
    }

    const prosToPayCount = Math.min(prosCanPay, soldProsCount);
    const amountNeeded = prosToPayCount * PRO_VALUE;

    if (prosToPayCount === 0) {
      toast.error('Saldo insuficiente para pagar ao menos 1 PRO (mínimo R$ 2,00)');
      return;
    }

    // Get PROs to pay (FIFO order - oldest first)
    const { data: prosToUpdate, error: prosSelectError } = await supabase
      .from('pros')
      .select('id')
      .eq('status', 'sold')
      .order('fifo_position', { ascending: true })
      .limit(prosToPayCount);

    if (prosSelectError || !prosToUpdate) {
      toast.error('Erro ao buscar PROs para pagar');
      console.error(prosSelectError);
      return;
    }

    const proIds = prosToUpdate.map(p => p.id);
    const now = new Date().toISOString();

    // Update PROs status to 'paid'
    const { error: prosUpdateError } = await supabase
      .from('pros')
      .update({ 
        status: 'paid',
        paid_at: now
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
      .update({ 
        status: 'paid',
        paid_at: now
      })
      .in('pro_id', proIds);

    if (fifoError) {
      console.error('Erro ao atualizar fila FIFO:', fifoError);
    }

    // Create a financial entry record marking this distribution
    const { error: finError } = await supabase
      .from('financial_entries')
      .insert({
        amount: -amountNeeded, // Negative to show outflow
        description: `Pagamento de ${prosToPayCount} PROs`,
        is_distributed: true,
        distributed_at: now,
        pros_paid: prosToPayCount,
        received_at: now,
        created_by: user?.id
      });

    if (finError) {
      console.error('Erro ao registrar saída:', finError);
    }

    toast.success(`Distribuição realizada! ${prosToPayCount} PROs pagos (R$ ${amountNeeded.toFixed(2)})`);
    fetchEntries();
    fetchSoldProsCount();
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Acesso restrito a administradores
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Financeiro
        </CardTitle>
        <div className="flex items-center gap-2">
          <ExportCSVButton
            onExport={async () => {
              const data = entries.map(e => ({
                id: e.id,
                valor: Number(e.amount).toFixed(2),
                descricao: e.description || '',
                status: e.is_distributed ? 'distribuido' : 'disponivel',
                pros_pagos: e.pros_paid,
                data: format(new Date(e.received_at), 'dd/MM/yyyy HH:mm'),
              }));
              return exportToCSV(data, 'financeiro', 'financial_entries');
            }}
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="earth-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Entrada
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Entrada Financeira</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Valor Líquido Recebido (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={newEntry.amount || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data e Hora</Label>
                <Input
                  type="datetime-local"
                  value={newEntry.received_at}
                  onChange={(e) => setNewEntry({ ...newEntry, received_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea
                  placeholder="Ex: Venda para cliente X, depósito de Y..."
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                />
              </div>
              <Button onClick={createEntry} className="w-full">
                Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Recebido</p>
              <p className="text-xl font-bold text-emerald-600">
                R$ {totalReceived.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Distribuído</p>
              <p className="text-xl font-bold text-orange-600">
                R$ {Math.abs(totalDistributed).toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Saldo Disponível</p>
              <p className={`text-xl font-bold ${availableBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                R$ {availableBalance.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">PROs Aguardando Pagamento</p>
              <p className="text-xl font-bold">{soldProsCount}</p>
              <p className="text-xs text-muted-foreground">
                = R$ {(soldProsCount * PRO_VALUE).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribute Button */}
        <div className="bg-muted/50 border rounded-lg p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Distribuir Pagamentos
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Cada PRO recebe R$ {PRO_VALUE.toFixed(2)}. Saldo atual permite pagar até {prosCanPay} PROs.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="earth-gradient"
                  disabled={prosCanPay === 0 || soldProsCount === 0}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Distribuir (até {Math.min(prosCanPay, soldProsCount)} PROs)
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Distribuição</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você está prestes a pagar <strong>{Math.min(prosCanPay, soldProsCount)} PROs</strong> no valor total de{' '}
                    <strong>R$ {(Math.min(prosCanPay, soldProsCount) * PRO_VALUE).toFixed(2)}</strong>.
                    <br /><br />
                    Os PROs mais antigos na fila serão pagos primeiro (FIFO).
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={distributePayments}>
                    Confirmar Distribuição
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {prosCanPay < soldProsCount && soldProsCount > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              Saldo insuficiente para pagar todos os PROs em Venda. Faltam R$ {((soldProsCount - prosCanPay) * PRO_VALUE).toFixed(2)}.
            </div>
          )}
        </div>

        {/* Entries Table */}
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
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Nenhuma entrada financeira registrada
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {format(new Date(entry.received_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {entry.description || '-'}
                        {entry.pros_paid > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {entry.pros_paid} PROs
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={Number(entry.amount) >= 0 ? 'text-emerald-600 font-semibold' : 'text-orange-600 font-semibold'}>
                          {Number(entry.amount) >= 0 ? '+' : ''}R$ {Number(entry.amount).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {entry.is_distributed ? (
                          <Badge className="bg-emerald-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Distribuído
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Disponível</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!entry.is_distributed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(entry)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingEntry(null);
            setNewEntry({ amount: 0, description: '', received_at: new Date().toISOString().slice(0, 16) });
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Entrada</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newEntry.amount || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data e Hora</Label>
                <Input
                  type="datetime-local"
                  value={newEntry.received_at}
                  onChange={(e) => setNewEntry({ ...newEntry, received_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                />
              </div>
              <Button onClick={updateEntry} className="w-full">
                Atualizar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
