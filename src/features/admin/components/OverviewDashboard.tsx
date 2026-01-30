import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, DollarSign, TrendingUp, ArrowRight, Clock, CheckCircle, Truck, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalPros: number;
  totalValue: number;
  pendingPros: number;
  processingPros: number;
  readyPros: number;
  soldPros: number;
  paidPros: number;
  totalDistributions: number;
  totalFinancialReceived: number;
  totalFinancialDistributed: number;
  availableBalance: number;
}

export function OverviewDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Load PRO stats by status
      const { data: prosData, error: prosError } = await supabase
        .from('pros')
        .select('status');

      if (prosError) throw prosError;

      // Load financial entries
      const { data: financialData, error: financialError } = await supabase
        .from('financial_entries')
        .select('amount, is_distributed, pros_paid');

      if (financialError) throw financialError;

      // Load distributions
      const { data: distData, error: distError } = await supabase
        .from('distributions')
        .select('pros_moved');

      if (distError) throw distError;

      // Calculate stats
      const statusCounts = {
        pending: 0,
        processing: 0,
        ready: 0,
        sold: 0,
        paid: 0
      };

      prosData?.forEach(pro => {
        if (pro.status in statusCounts) {
          statusCounts[pro.status as keyof typeof statusCounts]++;
        }
      });

      const totalPros = prosData?.length || 0;
      const totalValue = totalPros; // R$ 1,00 per PRO

      const totalFinancialReceived = financialData?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const totalFinancialDistributed = financialData?.filter(e => e.is_distributed).reduce((sum, e) => sum + (e.pros_paid || 0) * 2, 0) || 0;
      const availableBalance = totalFinancialReceived - totalFinancialDistributed;

      const totalDistributions = distData?.length || 0;

      setStats({
        totalPros,
        totalValue,
        pendingPros: statusCounts.pending,
        processingPros: statusCounts.processing,
        readyPros: statusCounts.ready,
        soldPros: statusCounts.sold,
        paidPros: statusCounts.paid,
        totalDistributions,
        totalFinancialReceived,
        totalFinancialDistributed,
        availableBalance
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Erro ao carregar dados
      </div>
    );
  }

  const stages = [
    { label: 'Coleta', count: stats.pendingPros, color: 'bg-yellow-500', icon: Clock },
    { label: 'Processamento', count: stats.processingPros, color: 'bg-orange-500', icon: Package },
    { label: 'Produção', count: stats.readyPros, color: 'bg-blue-500', icon: CheckCircle },
    { label: 'Venda', count: stats.soldPros, color: 'bg-purple-500', icon: Truck },
    { label: 'Pago', count: stats.paidPros, color: 'bg-green-500', icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de PROs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPros.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              R$ {stats.totalValue.toLocaleString('pt-BR')},00 em valor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalFinancialReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Entradas financeiras registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distribuído</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalFinancialDistributed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              {stats.paidPros} PROs pagos (R$ 2,00/PRO)
            </p>
          </CardContent>
        </Card>

        <Card className={stats.availableBalance >= 0 ? 'border-green-500/20' : 'border-destructive/20'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <DollarSign className={`h-4 w-4 ${stats.availableBalance >= 0 ? 'text-green-500' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.availableBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              R$ {stats.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Para pagamentos futuros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Pipeline de PROs
          </CardTitle>
          <CardDescription>
            Visualização do fluxo de PROs através das etapas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <React.Fragment key={stage.label}>
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className={`w-12 h-12 rounded-full ${stage.color} flex items-center justify-center mb-2`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-center">{stage.label}</span>
                    <Badge variant="secondary" className="mt-1">
                      {stage.count.toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                  {idx < stages.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Processamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-xl font-bold">{stats.pendingPros.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground">PROs em Coleta</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{stats.processingPros.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground">Em Processamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prontos para Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-xl font-bold">{stats.readyPros.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground">PROs em Produção</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">
                  R$ {(stats.readyPros * 2).toLocaleString('pt-BR')},00
                </div>
                <p className="text-xs text-muted-foreground">Potencial de retorno</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-xl font-bold">{stats.soldPros.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground">PROs Vendidos</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-orange-500">
                  R$ {(stats.soldPros * 2).toLocaleString('pt-BR')},00
                </div>
                <p className="text-xs text-muted-foreground">A pagar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
