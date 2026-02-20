import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, TrendingUp, Users, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { ExportCSVButton } from '@/components/shared/ExportCSVButton';
import { exportToCSV } from '@/lib/exportCSV';

interface SaleDistribution {
  id: string;
  financial_entry_id: string;
  gross_amount: number;
  amount_to_fifo: number;
  amount_to_operations: number;
  pros_paid_count: number;
  fifo_positions_advanced: number;
  created_at: string;
  sale_received_at: string | null;
  sale_description: string | null;
}

interface ProPayout {
  id: string;
  pro_id: string;
  amount_paid: number;
  position_at_payment: number;
  paid_at: string;
  pro_code?: string;
}

function fmtBRL(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}
function fmtDate(iso: string) {
  return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function SaleDistributionsManagement() {
  const [selectedDist, setSelectedDist] = useState<SaleDistribution | null>(null);

  const { data: distributions = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-sale-distributions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sale_distributions' as any)
        .select(`
          *,
          financial_entries!financial_entry_id(received_at, description)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        sale_received_at: d.financial_entries?.received_at ?? null,
        sale_description: d.financial_entries?.description ?? null,
      })) as SaleDistribution[];
    },
  });

  const { data: payouts = [], isLoading: payoutsLoading } = useQuery({
    queryKey: ['admin-pro-payouts', selectedDist?.id],
    queryFn: async () => {
      if (!selectedDist) return [];
      const { data, error } = await supabase
        .from('pro_payouts' as any)
        .select(`*, pros!pro_id(code)`)
        .eq('sale_distribution_id', selectedDist.id)
        .order('position_at_payment', { ascending: true });
      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        pro_code: p.pros?.code,
      })) as ProPayout[];
    },
    enabled: !!selectedDist,
  });

  // Totais
  const totalProsPaid = distributions.reduce((s, d) => s + d.pros_paid_count, 0);
  const totalDistributed = distributions.reduce((s, d) => s + Number(d.amount_to_fifo), 0);
  const totalSales = distributions.reduce((s, d) => s + Number(d.gross_amount), 0);

  const handleManualProcess = async (entryId: string) => {
    try {
      const { data, error } = await supabase.rpc('process_sale_distribution' as any, {
        p_financial_entry_id: entryId,
      });
      if (error) throw error;
      const result = data as any;
      if (result?.skipped) {
        toast.info(`Já processado: ${result.reason}`);
      } else {
        toast.success(`Distribuição processada! ${result.pros_paid} PROs pagos.`);
      }
      refetch();
    } catch (err: any) {
      toast.error('Erro ao processar: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total de distribuições</p>
            <p className="text-2xl font-bold text-foreground">{distributions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">PROs pagos via distribuição</p>
            <p className="text-2xl font-bold text-primary">{totalProsPaid.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total distribuído à fila</p>
            <p className="text-2xl font-bold text-emerald-600">{fmtBRL(totalDistributed)}</p>
            <p className="text-xs text-muted-foreground">de {fmtBRL(totalSales)} em vendas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Distribuições por Venda
          </CardTitle>
          <div className="flex items-center gap-2">
            <ExportCSVButton
              onExport={async () => {
                const data = distributions.map(d => ({
                  id: d.id,
                  financial_entry_id: d.financial_entry_id,
                  valor_bruto: Number(d.gross_amount).toFixed(2),
                  para_fifo: Number(d.amount_to_fifo).toFixed(2),
                  para_operacoes: Number(d.amount_to_operations).toFixed(2),
                  pros_pagos: d.pros_paid_count,
                  avanco_fila: d.fifo_positions_advanced,
                  data: d.sale_received_at ? fmtDate(d.sale_received_at) : fmtDate(d.created_at),
                  descricao: d.sale_description || '',
                }));
                return exportToCSV(data, 'distribuicoes', 'sale_distributions');
              }}
            />
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : distributions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma distribuição registrada ainda</p>
              <p className="text-sm mt-1">As distribuições são geradas automaticamente a cada venda confirmada.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Venda Bruta</TableHead>
                    <TableHead className="text-right">Para FIFO</TableHead>
                    <TableHead className="text-right">PROs Pagos</TableHead>
                    <TableHead className="text-right">Avanço na Fila</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributions.map((dist) => (
                    <TableRow key={dist.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {dist.sale_received_at ? fmtDate(dist.sale_received_at) : fmtDate(dist.created_at)}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate text-muted-foreground">
                        {dist.sale_description || '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">
                        {fmtBRL(Number(dist.gross_amount))}
                      </TableCell>
                      <TableCell className="text-right text-primary font-medium">
                        {fmtBRL(Number(dist.amount_to_fifo))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="gap-1">
                          <Users className="w-3 h-3" />
                          {dist.pros_paid_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-primary/15 text-primary gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +{dist.fifo_positions_advanced}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDist(dist)}
                          className="gap-1 text-xs"
                        >
                          <ExternalLink className="w-3 h-3" /> Ver PROs
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={!!selectedDist} onOpenChange={(open) => !open && setSelectedDist(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              PROs Pagos nesta Distribuição
            </DialogTitle>
          </DialogHeader>

          {selectedDist && (
            <div className="space-y-4">
              {/* Resumo da distribuição */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-muted/40 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Valor da venda</p>
                  <p className="font-bold text-emerald-600">{fmtBRL(Number(selectedDist.gross_amount))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Distribuído à fila</p>
                  <p className="font-bold text-primary">{fmtBRL(Number(selectedDist.amount_to_fifo))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">PROs pagos</p>
                  <p className="font-bold">{selectedDist.pros_paid_count}</p>
                </div>
              </div>

              {/* Lista de PROs pagos */}
              {payoutsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : payouts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  Nenhum PRO pago nesta distribuição.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Posição</TableHead>
                        <TableHead>Código PRO</TableHead>
                        <TableHead className="text-right">Valor Pago</TableHead>
                        <TableHead>Data Pagamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>
                            <Badge variant="outline">#{payout.position_at_payment}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payout.pro_code || '—'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">
                            {fmtBRL(Number(payout.amount_paid))}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {fmtDate(payout.paid_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
                <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                Cada PRO recebeu R$ 2,00 conforme regra do ciclo. R$ {fmtBRL(Number(selectedDist.amount_to_operations))} ficaram para operações.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
