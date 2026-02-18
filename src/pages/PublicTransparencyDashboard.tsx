import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  RefreshCw, Leaf, Package, TrendingUp, DollarSign, MapPin, Clock,
  ArrowRight, Ban, Search, ChevronLeft, ChevronRight, Shield,
  Recycle, BarChart3, ListOrdered, AlertCircle, Loader2, X
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpTooltip } from '@/components/shared/HelpTooltip';

import {
  fetchPublicKPIs, fetchPublicFifo, fetchPublicSales,
  fetchPublicCollectionPoints, fetchSiteSettingsPublic, fetchMonthlyReport,
  type PublicFifoEntry, type PublicSaleEntry, type PublicCollectionPoint
} from '@/lib/publicTransparency';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtKg(grams: number) {
  const kg = grams / 1000;
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toFixed(1)} kg`;
}
function fmtBRL(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}
function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}
function fmtDateShort(iso: string) {
  return format(new Date(iso), 'dd/MM/yyyy', { locale: ptBR });
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Aguardando',      color: 'bg-amber-500/15 text-amber-700 border-amber-400/30' },
  processing: { label: 'Processando',    color: 'bg-blue-500/15 text-blue-700 border-blue-400/30' },
  ready:      { label: 'Produzido',       color: 'bg-primary/15 text-primary border-primary/30' },
  sold:       { label: 'Vendido',         color: 'bg-emerald-500/15 text-emerald-700 border-emerald-400/30' },
  paid:       { label: 'Pago',            color: 'bg-green-600/15 text-green-700 border-green-500/30' },
};

const maskCode = (code: string) =>
  code.length > 4 ? `...${code.slice(-4)}` : code;

// ─── Sub-components ─────────────────────────────────────────────────────────

function ModuleDisabled({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm justify-center">
      <AlertCircle className="w-4 h-4" />
      <span>{label} desativado temporariamente.</span>
    </div>
  );
}

function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}><CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-16" />
        </CardContent></Card>
      ))}
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub, tooltip }: {
  icon: React.ElementType; label: string; value: string; sub?: string; tooltip?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          {tooltip && <HelpTooltip content={tooltip} />}
        </div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function PipelineStep({ icon: Icon, title, value, sub, active }: {
  icon: React.ElementType; title: string; value: string; sub?: string; active?: boolean;
}) {
  return (
    <div className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${active ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
      <div className="w-10 h-10 rounded-xl bg-primary/10 mx-auto mb-2 flex items-center justify-center">
        <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const FIFO_PAGE_SIZE = 50;

export default function PublicTransparencyDashboard() {
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [fifoPage, setFifoPage] = useState(0);
  const [fifoSearch, setFifoSearch] = useState('');
  const [limitTo200, setLimitTo200] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey(k => k + 1);
    setUpdatedAt(new Date());
  }, []);

  // ─ Site settings ─
  const { data: settings } = useQuery({
    queryKey: ['public-transparency-settings', refreshKey],
    queryFn: fetchSiteSettingsPublic,
  });

  // ─ KPIs ─
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery({
    queryKey: ['public-kpis', refreshKey],
    queryFn: fetchPublicKPIs,
    enabled: settings?.public_kpis_enabled !== false,
    staleTime: 60_000,
  });

  // ─ FIFO ─
  const { data: fifoData, isLoading: fifoLoading } = useQuery({
    queryKey: ['public-fifo', fifoPage, fifoSearch, limitTo200, refreshKey],
    queryFn: () => fetchPublicFifo(fifoPage, FIFO_PAGE_SIZE, fifoSearch, limitTo200),
    enabled: settings?.public_fifo_enabled !== false,
    staleTime: 30_000,
  });

  // ─ Sales ─
  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['public-sales', refreshKey],
    queryFn: () => fetchPublicSales(8),
    enabled: settings?.public_sales_enabled !== false,
    staleTime: 60_000,
  });

  // ─ Collection Points ─
  const { data: points = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['public-collection-points', refreshKey],
    queryFn: fetchPublicCollectionPoints,
    enabled: settings?.public_collection_points_enabled !== false,
    staleTime: 120_000,
  });

  // ─ Monthly report ─
  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['public-monthly', refreshKey],
    queryFn: fetchMonthlyReport,
    staleTime: 120_000,
  });

  const totalFifoPages = fifoData ? Math.ceil(Math.min(fifoData.count, limitTo200 ? 200 : 5000) / FIFO_PAGE_SIZE) : 1;

  if (settings?.public_transparency_enabled === false) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Painel temporariamente indisponível</h1>
        <p className="text-muted-foreground">O painel público está desativado temporariamente pelos administradores.</p>
        <Link to="/transparencia"><Button variant="outline">Ver Transparência</Button></Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Painel Público | Transparência - Clube do Adubo</title>
        <meta name="description" content="Dados reais do ciclo do resíduo ao pagamento, com fila FIFO pública e métricas de impacto do Clube do Adubo." />
        <link rel="canonical" href="https://clubedoadubo.lovable.app/painel-publico" />
        <meta property="og:title" content="Painel Público de Transparência | Clube do Adubo" />
        <meta property="og:description" content="Dados reais do ciclo do resíduo ao pagamento, com fila FIFO pública." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ── HERO ── */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-primary/8 via-primary/4 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-5">
            <Shield className="w-4 h-4" />
            Auditável em tempo real
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Painel Público de Transparência
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-6">
            Dados reais do ciclo, do resíduo ao pagamento.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['Sem atalhos', 'Fila FIFO', 'Venda real', 'Dados diretos do banco'].map(chip => (
              <span key={chip} className="px-3 py-1 bg-background border rounded-full text-xs text-muted-foreground font-medium">
                ♻️ {chip}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/economia-circular">
              <Button variant="outline" size="sm">
                Entender o ciclo <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="gap-2 text-muted-foreground"
            >
              <RefreshCw className="w-3 h-3" />
              Atualizar dados
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Atualizado em: {format(updatedAt, "HH:mm 'de' dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16 space-y-12">

        {/* ── KPIs ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Indicadores do Ciclo
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Dados extraídos diretamente do banco do Clube do Adubo</p>
            </div>
          </div>

          {settings?.public_kpis_enabled === false ? (
            <ModuleDisabled label="Módulo de KPIs" />
          ) : kpisLoading ? (
            <KPISkeleton />
          ) : kpisError ? (
            <div className="text-center text-destructive py-8 text-sm">Erro ao carregar indicadores.</div>
          ) : kpis ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <KPICard
                icon={Leaf}
                label="Resíduo coletado"
                value={fmtKg(kpis.weightCollectedGrams)}
                sub={`${kpis.totalWeighings} pesagens`}
                tooltip="Total de resíduo orgânico coletado nos pontos de coleta, em kg."
              />
              <KPICard
                icon={Package}
                label="PROs emitidos"
                value={kpis.totalPros.toLocaleString('pt-BR')}
                sub="1 PRO = 100 g de resíduo"
                tooltip="Total de unidades de participação ambiental (PROs) emitidas no sistema."
              />
              <KPICard
                icon={ListOrdered}
                label="PROs na fila"
                value={kpis.pendingPros.toLocaleString('pt-BR')}
                sub="aguardando pagamento"
                tooltip="PROs ainda não pagos — aguardando venda real de adubo para avançar."
              />
              <KPICard
                icon={TrendingUp}
                label="PROs pagos"
                value={kpis.paidPros.toLocaleString('pt-BR')}
                sub={fmtBRL(kpis.totalDistributed) + ' distribuídos'}
                tooltip="PROs que já receberam R$ 2,00 via venda real de adubo."
              />
              <KPICard
                icon={Recycle}
                label="Adubo produzido"
                value={fmtKg(kpis.weightDoneGrams)}
                sub={`${kpis.batchesDone} lote(s) concluído(s)`}
                tooltip="Estimativa de adubo produzido com base no peso dos lotes finalizados."
              />
              <KPICard
                icon={DollarSign}
                label="Vendas registradas"
                value={fmtBRL(kpis.totalSalesAmount)}
                sub={`${kpis.totalSales} entrada(s)`}
                tooltip="Total de receitas de venda de adubo registradas no sistema."
              />
              <KPICard
                icon={MapPin}
                label="Pontos de coleta ativos"
                value={kpis.activeCollectionPoints.toLocaleString('pt-BR')}
                tooltip="Locais ativos onde o resíduo pode ser entregue."
              />
              <KPICard
                icon={Clock}
                label="Última venda"
                value={kpis.lastSale ? fmtBRL(kpis.lastSale.amount) : '—'}
                sub={kpis.lastSale ? fmtDateShort(kpis.lastSale.received_at) : 'Nenhuma ainda'}
                tooltip="Valor e data da última venda de adubo registrada."
              />
            </div>
          ) : null}
        </section>

        {/* ── PIPELINE ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Recycle className="w-5 h-5 text-primary" /> Pipeline do Ciclo
          </h2>
          {kpisLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : kpis ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <PipelineStep icon={Leaf} title="Coleta" value={fmtKg(kpis.weightCollectedGrams)} sub={`${kpis.totalWeighings} pesagens`} active />
              <PipelineStep icon={Package} title="PROs emitidos" value={kpis.totalPros.toLocaleString('pt-BR')} sub="unidades" active />
              <PipelineStep icon={Loader2} title="Em processamento" value={kpis.batchesProcessing.toString()} sub={fmtKg(kpis.weightProcessingGrams)} active={kpis.batchesProcessing > 0} />
              <PipelineStep icon={Recycle} title="Produzido" value={fmtKg(kpis.weightDoneGrams)} sub={`${kpis.batchesDone} lote(s)`} active={kpis.batchesDone > 0} />
              <PipelineStep icon={DollarSign} title="Vendas" value={fmtBRL(kpis.totalSalesAmount)} sub={`${kpis.totalSales} entrada(s)`} active={kpis.totalSales > 0} />
              <PipelineStep icon={TrendingUp} title="Pagamentos" value={fmtBRL(kpis.totalDistributed)} sub={`${kpis.paidPros} PROs pagos`} active={kpis.paidPros > 0} />
            </div>
          ) : null}

          <div className="mt-4 p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span>
              Fonte: Vendas registradas via checkout (Nexano) e processamento físico real.{' '}
              Sem venda real, não há pagamento. Sem pagamento, não há avanço.
            </span>
          </div>
        </section>

        {/* ── FIFO QUEUE ── */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-primary" /> Fila FIFO Pública
                <HelpTooltip content="A fila FIFO é única, global e imutável. O PRO que entrou primeiro sai primeiro. Nenhum dinheiro pode alterar a posição." />
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Sem dados pessoais — apenas posição e código do PRO</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch id="limit200" checked={limitTo200} onCheckedChange={(v) => { setLimitTo200(v); setFifoPage(0); }} />
                <Label htmlFor="limit200" className="text-xs">Últimos 200</Label>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar código PRO…"
                  className="pl-8 h-9 text-sm w-44"
                  value={fifoSearch}
                  onChange={(e) => { setFifoSearch(e.target.value); setFifoPage(0); }}
                />
                {fifoSearch && (
                  <button onClick={() => setFifoSearch('')} className="absolute right-2 top-2.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {settings?.public_fifo_enabled === false ? (
            <ModuleDisabled label="Fila FIFO pública" />
          ) : fifoLoading ? (
            <Card><CardContent className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Posição</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Código PRO</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Entrada na fila</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Pago em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fifoData?.data.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                        {fifoSearch ? 'Nenhum PRO encontrado com esse código.' : 'A fila ainda está vazia.'}
                      </td></tr>
                    ) : fifoData?.data.map((row: PublicFifoEntry) => {
                      const st = STATUS_LABELS[row.status] ?? { label: row.status, color: 'bg-muted text-muted-foreground' };
                      return (
                        <tr key={row.queue_id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-primary">#{row.position}</td>
                          <td className="px-4 py-3 font-mono text-xs">{maskCode(row.pro_code)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDateShort(row.created_at)}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{row.paid_at ? fmtDateShort(row.paid_at) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
              {/* Pagination */}
              {totalFifoPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Página {fifoPage + 1} de {totalFifoPages} • {fifoData?.count?.toLocaleString('pt-BR')} entradas
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setFifoPage(p => Math.max(0, p - 1))} disabled={fifoPage === 0}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setFifoPage(p => Math.min(totalFifoPages - 1, p + 1))} disabled={fifoPage >= totalFifoPages - 1}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </section>

        {/* ── SALES ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" /> Vendas e Distribuição
            <HelpTooltip content="Cada venda de adubo real move o ciclo: R$ 2,00 ao PRO da vez + R$ 1,00 para avançar a fila." />
          </h2>

          {settings?.public_sales_enabled === false ? (
            <ModuleDisabled label="Módulo de vendas" />
          ) : salesLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
          ) : sales.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">
              Ainda não há vendas registradas no sistema.
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {sales.map((sale: PublicSaleEntry) => (
                <Card key={sale.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{fmtBRL(sale.amount)}</p>
                        <p className="text-xs text-muted-foreground">{fmtDate(sale.received_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {sale.description && (
                        <span className="text-xs text-muted-foreground">{sale.description}</span>
                      )}
                      {sale.is_distributed && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                          ✓ Distribuída
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <div className="px-4 pb-3">
                    <p className="text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1 border-l-2 border-primary/40">
                      💡 Esta venda avança a fila e paga quem está na vez.
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── COLLECTION POINTS ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Pontos de Coleta Ativos
          </h2>

          {settings?.public_collection_points_enabled === false ? (
            <ModuleDisabled label="Módulo de pontos de coleta" />
          ) : pointsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : points.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">
              Nenhum ponto de coleta ativo no momento.
            </CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {points.map((pt: PublicCollectionPoint) => (
                <Card key={pt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm leading-tight">{pt.name}</p>
                        <p className="text-xs text-muted-foreground">{pt.city}, {pt.state}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    {pt.address && <p className="text-xs text-muted-foreground">{pt.address}</p>}
                    {pt.opening_hours && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {pt.opening_hours}
                      </p>
                    )}
                    {pt.description && <p className="text-xs text-muted-foreground">{pt.description}</p>}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {pt.whatsapp && (
                        <a href={`https://wa.me/${pt.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="h-7 text-xs">WhatsApp</Button>
                        </a>
                      )}
                      {pt.has_public_page && pt.slug && (
                        <Link to={`/ponto/${pt.slug}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">Ver página <ArrowRight className="w-3 h-3 ml-1" /></Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── MONTHLY REPORT ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Resumo do Mês Atual
            </h2>
            <Button variant="outline" size="sm" disabled className="text-xs gap-1">
              Baixar PDF <span className="text-muted-foreground">(em breve)</span>
            </Button>
          </div>
          {monthlyLoading ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : monthly ? (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      {['Vendas (R$)', 'Kg Coletados', 'Kg Processados', 'PROs Emitidos', 'PROs Pagos'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-4 font-semibold">{fmtBRL(monthly.salesAmount)}</td>
                      <td className="px-4 py-4">{monthly.kgCollected.toFixed(1)} kg</td>
                      <td className="px-4 py-4">{monthly.kgProcessed.toFixed(1)} kg</td>
                      <td className="px-4 py-4 font-mono">{monthly.prosEmitted.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-4 font-mono">{monthly.prosPaid.toLocaleString('pt-BR')}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : null}
        </section>

        {/* ── O QUE NÃO EXISTE AQUI ── */}
        <section>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Ban className="w-5 h-5" /> O que não existe aqui
              </CardTitle>
              <CardDescription>
                Afirmações que nenhum participante pode fazer sobre o Clube do Adubo:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'Sem promessa de rentabilidade',
                  'Sem prazo garantido para pagamento',
                  'Sem aceleração paga da fila',
                  'Sem hierarquia que altera a ordem',
                  'Sem dinheiro gerado por entrada de novas pessoas',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <X className="w-4 h-4 text-destructive flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-destructive/20">
                <p className="text-sm font-semibold text-foreground text-center">
                  "O valor só existe quando há venda real de adubo."
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </>
  );
}
