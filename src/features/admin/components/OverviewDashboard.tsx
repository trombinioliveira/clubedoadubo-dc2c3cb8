import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2, Package, TrendingUp, ArrowRight, Clock, CheckCircle,
  Truck, Wallet, RefreshCw, AlertTriangle, HeartPulse, Bell,
  CreditCard, ExternalLink, Info,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function OverviewDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [envMode, setEnvMode] = useState<string>('...');
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [failedNotifications, setFailedNotifications] = useState(0);
  const [pendingCredits, setPendingCredits] = useState(0);
  const [lastEntries, setLastEntries] = useState<any[]>([]);
  const [lastLedgerEvents, setLastLedgerEvents] = useState<any[]>([]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        envRes,
        healthRes,
        prosRes,
        financialRes,
        notifRes,
        creditsRes,
        entriesRes,
        ledgerRes,
      ] = await Promise.all([
        supabase.from('site_settings').select('value').eq('key', 'env_mode').single(),
        supabase.rpc('system_health_check'),
        supabase.from('pros').select('status'),
        supabase.from('financial_entries').select('amount, is_distributed, status'),
        supabase.from('notification_events').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
        supabase.from('pro_credits').select('quantity_remaining').gt('quantity_remaining', 0),
        supabase.from('financial_entries').select('id, amount, description, status, received_at, product_key').order('received_at', { ascending: false }).limit(5),
        supabase.from('system_ledger').select('id, event_type, amount, created_at, user_id').order('created_at', { ascending: false }).limit(8),
      ]);

      setEnvMode((envRes.data?.value as any)?.mode ?? 'unknown');
      setHealthCheck(healthRes.data);
      setFailedNotifications(notifRes.count ?? 0);
      setPendingCredits(creditsRes.data?.reduce((s: number, c: any) => s + (c.quantity_remaining || 0), 0) ?? 0);
      setLastEntries(entriesRes.data ?? []);
      setLastLedgerEvents(ledgerRes.data ?? []);

      // PRO stats
      const statusCounts = { pending: 0, processing: 0, ready: 0, sold: 0, paid: 0 };
      prosRes.data?.forEach((p: any) => {
        if (p.status in statusCounts) statusCounts[p.status as keyof typeof statusCounts]++;
      });

      const confirmedEntries = financialRes.data?.filter((e: any) => e.status === 'confirmed') ?? [];
      const totalReceived = confirmedEntries.reduce((s: number, e: any) => s + Number(e.amount), 0);
      const paidPros = statusCounts.paid;

      setStats({
        ...statusCounts,
        totalPros: prosRes.data?.length ?? 0,
        totalReceived,
        totalPaidOut: paidPros * 2,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isProduction = envMode === 'production';
  const poolAvailable = healthCheck?.pool_available ?? 0;
  const poolStatus = poolAvailable > 100 ? 'saudável' : poolAvailable > 0 ? 'baixo' : 'vazio';
  const poolColor = poolAvailable > 100 ? 'text-green-600' : poolAvailable > 0 ? 'text-amber-600' : 'text-destructive';

  const stages = [
    { label: 'Coleta', count: stats?.pending ?? 0, icon: Clock },
    { label: 'Processamento', count: stats?.processing ?? 0, icon: Package },
    { label: 'Produção', count: stats?.ready ?? 0, icon: CheckCircle },
    { label: 'Venda', count: stats?.sold ?? 0, icon: Truck },
    { label: 'Pago', count: stats?.paid ?? 0, icon: Wallet },
  ];

  const alerts: { type: 'warning' | 'error'; message: string }[] = [];
  if (poolAvailable === 0) alerts.push({ type: 'error', message: 'Pool global vazio — novos participantes não receberão PROs. Abasteça a fila.' });
  else if (poolAvailable <= 50) alerts.push({ type: 'warning', message: `Pool baixo: apenas ${poolAvailable} participações disponíveis. Considere abastecer.` });
  if (failedNotifications > 0) alerts.push({ type: 'warning', message: `${failedNotifications} notificação(ões) falharam. Verifique a aba Notificações.` });
  if (pendingCredits > 0) alerts.push({ type: 'warning', message: `${pendingCredits} crédito(s) de assinatura pendente(s) de conversão.` });

  return (
    <div className="space-y-6">
      {/* Help text */}
      <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          <strong>Jornada do Admin</strong> — Visão rápida do estado atual do sistema. Mostra o ambiente ativo, saúde operacional,
          alertas pendentes e atalhos para as áreas críticas. Todos os números refletem dados reais do banco.
        </span>
      </div>

      {/* Environment + Health Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={isProduction ? 'border-destructive/30' : 'border-amber-500/30'}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ambiente Ativo</p>
            <Badge variant={isProduction ? 'destructive' : 'secondary'} className="mt-1 text-sm">
              {envMode}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pool Global</p>
            <p className={`text-2xl font-bold ${poolColor}`}>{poolAvailable}</p>
            <p className="text-xs text-muted-foreground">Status: {poolStatus}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Receita Confirmada</p>
            <p className="text-2xl font-bold text-foreground">
              R$ {(stats?.totalReceived ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Pago (FIFO)</p>
            <p className="text-2xl font-bold text-emerald-600">
              R$ {(stats?.totalPaidOut ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">{stats?.paid ?? 0} PROs × R$ 2,00</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <Alert key={i} variant={a.type === 'error' ? 'destructive' : 'default'} className={a.type === 'warning' ? 'border-amber-500/30 bg-amber-50/50' : ''}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{a.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Pipeline Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Pipeline do Ciclo
          </CardTitle>
          <CardDescription>
            Fluxo real de participações por etapa — {(stats?.totalPros ?? 0).toLocaleString('pt-BR')} no total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <React.Fragment key={stage.label}>
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-center">{stage.label}</span>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {stage.count.toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                  {idx < stages.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      {healthCheck && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartPulse className="w-5 h-5" />
              Saúde do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Sistema</p>
                <Badge variant={healthCheck.system === 'ok' ? 'default' : 'destructive'}>{healthCheck.system}</Badge>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">FIFO Total</p>
                <p className="text-lg font-bold">{healthCheck.fifo_total ?? 0}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Créditos Pendentes</p>
                <p className="text-lg font-bold">{healthCheck.credits_pending ?? 0}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Última Distribuição</p>
                <p className="text-xs">{healthCheck.last_distribution ? format(new Date(healthCheck.last_distribution), "dd/MM HH:mm", { locale: ptBR }) : '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Last Financial Entries */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Últimas Entradas Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lastEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma entrada registrada.</p>
            ) : lastEntries.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                <div>
                  <p className="font-medium">{e.description || e.product_key || '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(e.received_at), "dd/MM HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">R$ {Number(e.amount).toFixed(2)}</p>
                  <Badge variant="outline" className="text-[10px]">{e.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Last Ledger Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Últimos Eventos do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lastLedgerEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
            ) : lastLedgerEvents.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                <div>
                  <Badge variant="outline" className="text-[10px]">{e.event_type}</Badge>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(e.created_at), "dd/MM HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {e.amount != null && (
                  <p className="font-mono text-xs">{Number(e.amount).toFixed(2)}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Atalhos Operacionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/planos', label: 'Planos' },
              { href: '/painel-publico', label: 'Painel Público' },
              { href: '/fifo', label: 'Fila FIFO' },
              { href: '/ciclo', label: 'Ciclo' },
            ].map((link) => (
              <Button key={link.href} variant="outline" size="sm" onClick={() => window.open(link.href, '_blank')} className="gap-1">
                <ExternalLink className="w-3 h-3" /> {link.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={loadAll} className="gap-2 text-xs">
          <RefreshCw className="w-3 h-3" /> Atualizar dados
        </Button>
      </div>
    </div>
  );
}
