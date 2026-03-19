import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Wallet, Edit, CheckCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExportCSVButton } from '@/components/shared/ExportCSVButton';
import { exportToCSV } from '@/lib/exportCSV';

interface FinancialEntry {
  id: string;
  amount: number;
  description: string | null;
  is_distributed: boolean;
  distributed_at: string | null;
  pros_paid: number;
  received_at: string;
  created_at: string;
  status: string;
  product_key: string | null;
}

export function FinancialManagement() {
  const { user, isAdmin } = useAuth();
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    amount: 0,
    description: '',
    received_at: new Date().toISOString().slice(0, 16),
  });

  const confirmedEntries = entries.filter(e => e.status === 'confirmed' && Number(e.amount) > 0);
  const totalReceived = confirmedEntries.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPaid = entries.filter(e => e.is_distributed).reduce((sum, e) => sum + (e.pros_paid || 0) * 2, 0);
  const soldProsCount = entries.reduce((sum, e) => sum + (e.pros_paid || 0), 0);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('financial_entries')
      .select('*')
      .order('received_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar'); console.error(error); }
    else setEntries((data || []) as FinancialEntry[]);
    setIsLoading(false);
  };

  const createEntry = async () => {
    if (newEntry.amount <= 0) { toast.error('Valor deve ser maior que zero'); return; }
    const { error } = await supabase.from('financial_entries').insert({
      amount: newEntry.amount,
      description: newEntry.description || null,
      received_at: new Date(newEntry.received_at).toISOString(),
      created_by: user?.id,
    });
    if (error) { toast.error('Erro ao registrar'); return; }
    toast.success('Entrada registrada!');
    setIsAddOpen(false);
    setNewEntry({ amount: 0, description: '', received_at: new Date().toISOString().slice(0, 16) });
    fetchEntries();
  };

  const updateEntry = async () => {
    if (!editingEntry) return;
    const { error } = await supabase.from('financial_entries').update({
      amount: newEntry.amount,
      description: newEntry.description || null,
      received_at: new Date(newEntry.received_at).toISOString(),
    }).eq('id', editingEntry.id);
    if (error) { toast.error('Erro ao atualizar'); return; }
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
      received_at: new Date(entry.received_at).toISOString().slice(0, 16),
    });
    setIsEditOpen(true);
  };

  if (!isAdmin) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">Acesso restrito a administradores</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5" /> Financeiro</CardTitle>
        <div className="flex items-center gap-2">
          <ExportCSVButton
            onExport={async () => {
              const data = entries.map(e => ({
                id: e.id, valor: Number(e.amount).toFixed(2), descricao: e.description || '',
                status: e.status, distribuido: e.is_distributed ? 'sim' : 'não',
                pros_pagos: e.pros_paid, data: format(new Date(e.received_at), 'dd/MM/yyyy HH:mm'),
              }));
              return exportToCSV(data, 'financeiro', 'financial_entries');
            }}
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="earth-gradient"><Plus className="w-4 h-4 mr-2" /> Registrar Entrada</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar Entrada Financeira</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Valor Líquido (R$)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0,00"
                    value={newEntry.amount || ''} onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Data e Hora</Label>
                  <Input type="datetime-local" value={newEntry.received_at} onChange={(e) => setNewEntry({ ...newEntry, received_at: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Textarea placeholder="Ex: Venda de adubo granulado" value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} />
                </div>
                <Button onClick={createEntry} className="w-full">Registrar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Help text */}
        <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            <strong>Financeiro</strong> — Registra e exibe todas as entradas financeiras do sistema (vendas de adubo, compras avulsas,
            pagamentos de assinatura). As distribuições de pagamento aos participantes seguem exclusivamente o fluxo oficial
            do motor FIFO (<code>process_sale_distribution</code>). Não existe botão de distribuição manual — toda distribuição
            é automaticamente gerada a partir de vendas confirmadas.
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Receita Confirmada</p>
              <p className="text-xl font-bold text-emerald-600">R$ {totalReceived.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Pago via FIFO</p>
              <p className="text-xl font-bold text-primary">R$ {totalPaid.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{soldProsCount} PROs pagos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Entradas Registradas</p>
              <p className="text-xl font-bold">{entries.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Orientation */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            As distribuições do ciclo seguem apenas o fluxo oficial do sistema. Consulte a aba "Dist. por Venda" para ver o detalhamento.
          </AlertDescription>
        </Alert>

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
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma entrada registrada
                    </TableCell>
                  </TableRow>
                ) : entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(entry.received_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.description || '—'}
                      {entry.pros_paid > 0 && <Badge variant="outline" className="ml-2 text-[10px]">{entry.pros_paid} PROs</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{entry.product_key || '—'}</TableCell>
                    <TableCell>
                      <span className={Number(entry.amount) >= 0 ? 'text-emerald-600 font-semibold' : 'text-orange-600 font-semibold'}>
                        {Number(entry.amount) >= 0 ? '+' : ''}R$ {Number(entry.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {entry.is_distributed ? (
                        <Badge className="bg-emerald-500 text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />Distribuído</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">{entry.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!entry.is_distributed && Number(entry.amount) > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => openEdit(entry)}><Edit className="w-4 h-4" /></Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) { setEditingEntry(null); setNewEntry({ amount: 0, description: '', received_at: new Date().toISOString().slice(0, 16) }); }
        }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar Entrada</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" min="0" step="0.01" value={newEntry.amount || ''} onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Data e Hora</Label>
                <Input type="datetime-local" value={newEntry.received_at} onChange={(e) => setNewEntry({ ...newEntry, received_at: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} />
              </div>
              <Button onClick={updateEntry} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
