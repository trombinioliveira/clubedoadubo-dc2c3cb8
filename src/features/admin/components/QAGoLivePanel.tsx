import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, ExternalLink, CheckCircle2, Database, 
  RefreshCw, Loader2, MapPin, ClipboardList, CreditCard, HeartPulse
} from 'lucide-react';

interface TableCounts {
  pros: number;
  fifo_queue: number;
  financial_entries: number;
  sale_distributions: number;
  pro_payouts: number;
  subscriptions: number;
  subscription_logs: number;
  reset_logs: number;
  commission_levels: number;
  collection_points: number;
  profiles: number;
  pro_credits: number;
  pro_activations: number;
}

interface IntegrityResult {
  prosWithoutFifo: number;
  fifoWithoutPros: number;
}

interface PointAttribution {
  id: string;
  amount: number;
  product_key: string | null;
  status: string;
  created_at: string;
  attribution: any;
}

interface ProCredit {
  id: string;
  user_id: string;
  product_key: string | null;
  quantity_total: number;
  quantity_remaining: number;
  created_at: string;
}

export function QAGoLivePanel() {
  const [envMode, setEnvMode] = useState<string>('loading...');
  const [counts, setCounts] = useState<TableCounts | null>(null);
  const [integrity, setIntegrity] = useState<IntegrityResult | null>(null);
  const [pointPurchases, setPointPurchases] = useState<PointAttribution[]>([]);
  const [pendingCredits, setPendingCredits] = useState<ProCredit[]>([]);
  const [lastEntry, setLastEntry] = useState<any>(null);
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    auth_signup: false,
    auth_email: false,
    auth_login: false,
    auth_reset: false,
    mobile_iphone: false,
    mobile_android: false,
    mobile_ipad: false,
    pay_avulso: false,
    pay_plano: false,
    point_purchase: false,
    point_attribution: false,
    admin_generate: false,
    admin_subscriptions: false,
    admin_notifications: false,
    admin_reset_blocked: false,
    plan_credits: false,
    plan_conversion: false,
    mp_env_production: false,
    mp_token_prod_set: false,
    mp_webhook_prod: false,
    mp_checkout_init_point: false,
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const { data: envData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'env_mode')
      .single();
    setEnvMode((envData?.value as any)?.mode ?? 'unknown');

    const tables = ['pros', 'fifo_queue', 'financial_entries', 'sale_distributions', 'pro_payouts', 'subscriptions', 'subscription_logs', 'reset_logs', 'commission_levels', 'collection_points', 'profiles', 'pro_credits', 'pro_activations'] as const;
    const countsResult: any = {};
    await Promise.all(
      tables.map(async (t) => {
        const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
        countsResult[t] = count ?? 0;
      })
    );
    setCounts(countsResult);

    const { data: lastFe } = await supabase
      .from('financial_entries')
      .select('id, status, product_key, is_distributed, attribution, created_at, amount')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    setLastEntry(lastFe);

    const { data: ptPurchases } = await supabase
      .from('financial_entries')
      .select('id, amount, product_key, status, created_at, attribution')
      .not('attribution', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);
    setPointPurchases((ptPurchases ?? []) as PointAttribution[]);

    // Pending pro_credits
    const { data: credits } = await supabase
      .from('pro_credits')
      .select('id, user_id, product_key, quantity_total, quantity_remaining, created_at')
      .gt('quantity_remaining', 0)
      .order('created_at', { ascending: false })
      .limit(20);
    setPendingCredits((credits ?? []) as ProCredit[]);

    // Health check
    const { data: hcData } = await supabase.rpc('system_health_check');
    setHealthCheck(hcData);

    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const runIntegrity = async () => {
    setLoading(true);
    const { count: totalPros } = await supabase.from('pros').select('*', { count: 'exact', head: true });
    const { count: totalFifo } = await supabase.from('fifo_queue').select('*', { count: 'exact', head: true });

    setIntegrity({
      prosWithoutFifo: Math.max(0, (totalPros ?? 0) - (totalFifo ?? 0)),
      fifoWithoutPros: Math.max(0, (totalFifo ?? 0) - (totalPros ?? 0)),
    });
    setLoading(false);
  };

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const envBadgeVariant = envMode === 'production' ? 'destructive' : 'secondary';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6" />
            QA / Go-Live
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Checklist e verificações pré-produção</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span className="ml-2">Atualizar</span>
        </Button>
      </div>

      {/* A) Pré-checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5" />
            Pré-checks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">env_mode:</span>
            <Badge variant={envBadgeVariant}>{envMode}</Badge>
          </div>

          {counts && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(counts).map(([key, value]) => (
                <div key={key} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className="text-lg font-bold">{value}</p>
                </div>
              ))}
            </div>
          )}

          {lastEntry && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Último financial_entry:</p>
              <div className="text-sm space-y-0.5">
                <p><strong>ID:</strong> {lastEntry.id?.slice(0, 8)}...</p>
                <p><strong>Status:</strong> <Badge variant="outline">{lastEntry.status}</Badge></p>
                <p><strong>Product:</strong> {lastEntry.product_key ?? '—'}</p>
                <p><strong>Distribuído:</strong> {lastEntry.is_distributed ? '✅' : '❌'}</p>
                <p><strong>Valor:</strong> R$ {lastEntry.amount?.toFixed(2)}</p>
                {lastEntry.attribution && (
                  <p><strong>Attribution:</strong> <code className="text-xs bg-muted px-1 rounded">{JSON.stringify(lastEntry.attribution)}</code></p>
                )}
              </div>
            </div>
          )}

          {pointPurchases.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Compras atribuídas a pontos ({pointPurchases.length}):
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pointPurchases.map((p) => (
                  <div key={p.id} className="text-xs p-2 bg-muted/30 rounded flex justify-between items-center">
                    <span>
                      <Badge variant="outline" className="mr-2">{(p.attribution as any)?.slug ?? '?'}</Badge>
                      {p.product_key} — R$ {p.amount?.toFixed(2)}
                    </span>
                    <Badge variant={p.status === 'confirmed' ? 'default' : 'secondary'}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assinaturas / Créditos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5" />
            Assinaturas & Créditos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">pro_credits pendentes (quantity_remaining &gt; 0):</span>
            <Badge variant="secondary">{pendingCredits.length}</Badge>
          </div>
          {pendingCredits.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pendingCredits.map((c) => (
                <div key={c.id} className="text-xs p-2 bg-muted/30 rounded flex justify-between items-center">
                  <span>
                    <Badge variant="outline" className="mr-2">{c.product_key ?? 'manual'}</Badge>
                    {c.quantity_remaining}/{c.quantity_total} restantes
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            A Edge Function <code>convert-pro-credits</code> converte créditos em PROs a cada execução (máx 200).
          </p>
        </CardContent>
      </Card>

      {/* Health Check */}
      {healthCheck && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartPulse className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Sistema</p>
                <Badge variant={healthCheck.system === 'ok' ? 'default' : 'destructive'}>{healthCheck.system}</Badge>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Pool disponível</p>
                <p className="text-lg font-bold">{healthCheck.pool_available ?? 0}</p>
                <Badge variant={healthCheck.pool === 'ok' ? 'default' : 'destructive'}>{healthCheck.pool}</Badge>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">FIFO total</p>
                <p className="text-lg font-bold">{healthCheck.fifo_total ?? 0}</p>
                <Badge variant={healthCheck.fifo === 'ok' ? 'default' : 'destructive'}>{healthCheck.fifo}</Badge>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Créditos pendentes</p>
                <p className="text-lg font-bold">{healthCheck.credits_pending ?? 0}</p>
                <Badge variant={healthCheck.credits === 'ok' ? 'default' : 'secondary'}>{healthCheck.credits}</Badge>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Última distribuição</p>
                <p className="text-xs">{healthCheck.last_distribution ? new Date(healthCheck.last_distribution).toLocaleString('pt-BR') : '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* B) Integrity & Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Verificações de Integridade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={runIntegrity} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
            Verificar integridade
          </Button>

          {integrity && (
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${integrity.prosWithoutFifo === 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                <p className="text-xs text-muted-foreground">PROs sem FIFO</p>
                <p className="text-lg font-bold">{integrity.prosWithoutFifo}</p>
              </div>
              <div className={`p-3 rounded-lg ${integrity.fifoWithoutPros === 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                <p className="text-xs text-muted-foreground">FIFO sem PROs</p>
                <p className="text-lg font-bold">{integrity.fifoWithoutPros}</p>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open('/planos', '_blank')}>
              <ExternalLink className="w-3 h-3 mr-1" /> /planos
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/painel-publico', '_blank')}>
              <ExternalLink className="w-3 h-3 mr-1" /> /painel-publico
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/ponto/mb', '_blank')}>
              <MapPin className="w-3 h-3 mr-1" /> /ponto/mb
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/fifo', '_blank')}>
              <ExternalLink className="w-3 h-3 mr-1" /> /fifo
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/ciclo', '_blank')}>
              <ExternalLink className="w-3 h-3 mr-1" /> /ciclo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* C) Manual Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5" />
            Checklist Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { header: 'Auth', items: [
              { key: 'auth_signup', label: 'Cadastro funcional' },
              { key: 'auth_email', label: 'Email de verificação' },
              { key: 'auth_login', label: 'Login / Logout' },
              { key: 'auth_reset', label: 'Reset de senha' },
            ]},
            { header: 'Mobile', items: [
              { key: 'mobile_iphone', label: 'iPhone' },
              { key: 'mobile_android', label: 'Android' },
              { key: 'mobile_ipad', label: 'iPad / Tablet' },
            ]},
            { header: 'Pagamento', items: [
              { key: 'pay_avulso', label: 'pro_avulso (R$ 1)' },
              { key: 'pay_plano', label: 'plano_muda (R$ 50)' },
            ]},
            { header: 'Planos (Créditos)', items: [
              { key: 'plan_credits', label: 'Plano gera pro_credits corretamente' },
              { key: 'plan_conversion', label: 'convert_pro_credits gera PROs via ativação' },
            ]},
            { header: 'Ponto (QR/Referral)', items: [
              { key: 'point_purchase', label: 'Compra via /ponto/:slug' },
              { key: 'point_attribution', label: 'Attribution salva no financial_entries' },
            ]},
            { header: 'Admin', items: [
              { key: 'admin_generate', label: 'Gerar PROs' },
              { key: 'admin_subscriptions', label: 'Assinaturas visíveis' },
              { key: 'admin_notifications', label: 'Notificações' },
              { key: 'admin_reset_blocked', label: 'Reset bloqueado em production' },
            ]},
          ].map((group) => (
            <div key={group.header}>
              <p className="text-sm font-semibold mb-2">{group.header}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-muted/50">
                    <Checkbox
                      checked={checklist[item.key]}
                      onCheckedChange={() => toggleCheck(item.key)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <Separator />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {Object.values(checklist).filter(Boolean).length} / {Object.keys(checklist).length} itens verificados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
