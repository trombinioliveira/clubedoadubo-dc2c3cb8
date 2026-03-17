import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ListOrdered, Search, ChevronLeft, ChevronRight, Shield, ArrowRight,
  X, AlertCircle, ArrowLeft, MapPin, Factory, Wheat, Package, CircleDollarSign
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { fetchPublicFifo, fetchCycleStagesDetail, type PublicFifoEntry, type CycleStageCounts, type CycleStageDetail } from '@/lib/publicTransparency';
import { useIsMobile } from '@/hooks/use-mobile';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDateShort(iso: string) {
  return format(new Date(iso), 'dd/MM/yyyy', { locale: ptBR });
}

function pluralize(n: number, singular: string, plural: string) {
  return n === 1 ? singular : plural;
}

function fmtKg(grams: number) {
  const kg = grams / 1000;
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toFixed(1)} kg`;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Aguardando',   color: 'bg-amber-500/15 text-amber-700 border-amber-400/30' },
  processing: { label: 'Processando', color: 'bg-blue-500/15 text-blue-700 border-blue-400/30' },
  ready:      { label: 'Produzido',    color: 'bg-primary/15 text-primary border-primary/30' },
  sold:       { label: 'Vendido',      color: 'bg-emerald-500/15 text-emerald-700 border-emerald-400/30' },
  paid:       { label: 'Concluído',    color: 'bg-green-600/15 text-green-700 border-green-500/30' },
};

const STAGE_TO_STATUS: Record<keyof CycleStageCounts, string> = {
  coleta: 'pending',
  processamento: 'processing',
  producao: 'ready',
  venda: 'sold',
  pago: 'paid',
};

const FIFO_PAGE_SIZE = 50;

// ─── Cycle Stages ───────────────────────────────────────────────────────────

// Physical stages show weight in kg (1 unit = 100g, confirmed by pros.weight_grams default = 100)
// Economic stages (venda, pago) show only count
const CYCLE_STAGES: {
  key: keyof CycleStageCounts;
  icon: typeof MapPin;
  label: string;
  emoji: string;
  description: string;
  showKg: boolean;
}[] = [
  { key: 'coleta',        icon: MapPin,            label: 'Coleta',         emoji: '📍', description: 'Resíduo coletado',  showKg: true },
  { key: 'processamento', icon: Factory,           label: 'Processamento',  emoji: '🏭', description: 'Em compostagem',    showKg: true },
  { key: 'producao',      icon: Wheat,             label: 'Produção',       emoji: '🌾', description: 'Adubo produzido',   showKg: true },
  { key: 'venda',         icon: Package,           label: 'Venda',          emoji: '📦', description: 'Adubo vendido',     showKg: false },
  { key: 'pago',          icon: CircleDollarSign,  label: 'Concluído',      emoji: '💰', description: 'Ciclo completo',    showKg: false },
];

function CycleStagesBlock({
  detail,
  isLoading,
  activeStage,
  onStageClick,
}: {
  detail?: CycleStageDetail;
  isLoading: boolean;
  activeStage: keyof CycleStageCounts | null;
  onStageClick: (stage: keyof CycleStageCounts | null) => void;
}) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!detail) return null;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-5">
        <h2 className="font-bold text-foreground text-sm mb-1">Etapas do ciclo agora</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Veja em que fase as participações estão neste momento. Clique em uma etapa para filtrar a lista abaixo.
        </p>

        <div className={`grid gap-3 ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
          {CYCLE_STAGES.map((stage) => {
            const count = detail.counts[stage.key];
            const isActive = activeStage === stage.key;
            const samples = detail.samples[stage.key];
            // 1 unit = 100g (pros.weight_grams default)
            const weightGrams = count * 100;

            return (
              <button
                key={stage.key}
                onClick={() => onStageClick(isActive ? null : stage.key)}
                className={`relative flex flex-col items-center text-center p-3 rounded-lg border transition-all cursor-pointer
                  ${isActive
                    ? 'bg-primary/10 border-primary/40 ring-2 ring-primary/20'
                    : 'bg-muted/40 border-border/50 hover:border-primary/30'
                  }`}
              >
                <span className="text-xl mb-1.5">{stage.emoji}</span>
                <span className="text-[11px] font-semibold text-foreground leading-tight mb-1">{stage.label}</span>
                <span className="text-lg font-bold text-primary">{count.toLocaleString('pt-BR')}</span>
                {stage.showKg && count > 0 && (
                  <span className="text-[10px] text-muted-foreground font-medium">{fmtKg(weightGrams)}</span>
                )}
                <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{stage.description}</span>

                {samples.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30 space-y-0.5 w-full">
                    {samples.map((code) => (
                      <span key={code} className="block text-[9px] font-mono text-muted-foreground/70 truncate">
                        {code}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] text-muted-foreground">
            {detail.total.toLocaleString('pt-BR')} {pluralize(detail.total, 'participação', 'participações')} no ciclo
            {' · '}Etapas físicas exibem peso equivalente (1 participação = 100 g)
          </p>
          {activeStage && (
            <button
              onClick={() => onStageClick(null)}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 flex-shrink-0 ml-3"
            >
              <X className="w-3 h-3" /> Limpar filtro
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PublicFilaPage() {
  const isMobile = useIsMobile();
  const [fifoPage, setFifoPage] = useState(0);
  const [fifoSearch, setFifoSearch] = useState('');
  const [activeStage, setActiveStage] = useState<keyof CycleStageCounts | null>(null);

  const { data: stageDetail, isLoading: stagesLoading } = useQuery({
    queryKey: ['public-cycle-stages-detail'],
    queryFn: fetchCycleStagesDetail,
    staleTime: 60_000,
  });

  // Derive summary KPIs from stages (same source of truth)
  const summaryKpis = useMemo(() => {
    if (!stageDetail) return null;
    const c = stageDetail.counts;
    return {
      total: stageDetail.total,
      aguardando: c.coleta + c.processamento + c.producao + c.venda,
      concluidos: c.pago,
    };
  }, [stageDetail]);

  // Build status filter from active stage
  const statusFilter = activeStage ? STAGE_TO_STATUS[activeStage] : undefined;

  const { data: fifoData, isLoading: fifoLoading, error: fifoError } = useQuery({
    queryKey: ['public-fifo-page', fifoPage, fifoSearch, statusFilter],
    queryFn: () => fetchPublicFifo(fifoPage, FIFO_PAGE_SIZE, fifoSearch, false, statusFilter),
    staleTime: 30_000,
  });

  const totalFifoPages = fifoData ? Math.ceil(fifoData.count / FIFO_PAGE_SIZE) : 1;

  function handleStageClick(stage: keyof CycleStageCounts | null) {
    setActiveStage(stage);
    setFifoPage(0);
  }

  return (
    <>
      <Helmet>
        <title>Fila Pública do Ciclo | Clube do Adubo</title>
        <meta name="description" content="Consulte a fila pública do ciclo do Clube do Adubo. A ordem é visível, pública e não pode ser alterada." />
        <link rel="canonical" href="https://clubedoadubo.com.br/painel-publico/fila" />
      </Helmet>

      {/* ═══ BLOCO 1 — Abertura ═══ */}
      <section className="py-10 md:py-16 bg-gradient-to-b from-primary/8 to-transparent">
        <div className="container mx-auto px-4">
          <Link to="/painel-publico" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Painel Público
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-5">
              <ListOrdered className="w-4 h-4" />
              Fila pública
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Fila pública do ciclo
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Qualquer pessoa pode consultar a ordem do ciclo. A fila avança conforme vendas reais de adubo acontecem.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16 space-y-8">

        {/* ═══ BLOCO 2 — Como ler a fila ═══ */}
        <Card>
          <CardContent className="p-5">
            <h2 className="font-bold text-foreground text-sm mb-3">Como funciona a fila</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <p>• Cada participação no ciclo ganha uma posição na fila.</p>
                <p>• Quem entrou primeiro, recebe primeiro — sem exceções.</p>
              </div>
              <div className="space-y-2">
                <p>• A fila avança quando uma venda real de adubo é confirmada.</p>
                <p>• Ninguém pode pagar para mudar de posição.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══ BLOCO 3 — Resumo rápido (derivado da mesma fonte) ═══ */}
        {summaryKpis && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl md:text-2xl font-bold text-foreground">{summaryKpis.total.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground mt-1">no ciclo</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl md:text-2xl font-bold text-foreground">{summaryKpis.aguardando.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground mt-1">em andamento</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl md:text-2xl font-bold text-primary">{summaryKpis.concluidos.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground mt-1">{pluralize(summaryKpis.concluidos, 'concluído', 'concluídos')}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══ BLOCO 4 — Etapas do Ciclo (quadros visuais com filtro) ═══ */}
        <CycleStagesBlock
          detail={stageDetail}
          isLoading={stagesLoading}
          activeStage={activeStage}
          onStageClick={handleStageClick}
        />

        {/* ═══ BLOCO 5 — Busca + filtro ativo ═══ */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Buscar por código (ex: 00001580 ou 1580)…"
              className="pl-9 h-10"
              value={fifoSearch}
              onChange={(e) => { setFifoSearch(e.target.value); setFifoPage(0); }}
            />
            {fifoSearch && (
              <button onClick={() => setFifoSearch('')} className="absolute right-3 top-3">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          {activeStage && (
            <Badge variant="outline" className="text-xs gap-1 px-3 py-1.5 border-primary/30 text-primary">
              Filtro: {CYCLE_STAGES.find(s => s.key === activeStage)?.label}
              <button onClick={() => handleStageClick(null)}><X className="w-3 h-3" /></button>
            </Badge>
          )}
        </div>

        {/* ═══ BLOCO 6 — Lista / Tabela ═══ */}
        <section>
          {fifoLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : fifoError ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">Erro ao carregar a fila</p>
                <p className="text-sm text-muted-foreground">Não foi possível acessar os dados neste momento. Tente novamente em alguns instantes.</p>
              </CardContent>
            </Card>
          ) : fifoData?.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ListOrdered className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">
                  {fifoSearch || activeStage ? 'Nenhum resultado encontrado' : 'A fila ainda está vazia'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {fifoSearch
                    ? 'Nenhuma participação encontrada com esse código. Verifique e tente novamente.'
                    : activeStage
                      ? `Não há participações na etapa "${CYCLE_STAGES.find(s => s.key === activeStage)?.label}" neste momento.`
                      : 'Quando novas participações entrarem no ciclo, elas aparecerão aqui.'}
                </p>
              </CardContent>
            </Card>
          ) : isMobile ? (
            /* Mobile: Cards */
            <div className="space-y-2">
              {fifoData?.data.map((row: PublicFifoEntry) => {
                const st = STATUS_LABELS[row.status] ?? { label: row.status, color: 'bg-muted text-muted-foreground' };
                return (
                  <Card key={row.queue_id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-primary text-lg">#{row.position}</span>
                        <Badge variant="outline" className={`text-xs ${st.color}`}>{st.label}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono">{row.pro_code}</span>
                        <span>{fmtDateShort(row.created_at)}</span>
                      </div>
                      {row.paid_at && (
                        <p className="text-xs text-primary mt-1">Concluído em {fmtDateShort(row.paid_at)}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Desktop: Table */
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Posição</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Código</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Entrada</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Concluído em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fifoData?.data.map((row: PublicFifoEntry) => {
                      const st = STATUS_LABELS[row.status] ?? { label: row.status, color: 'bg-muted text-muted-foreground' };
                      return (
                        <tr key={row.queue_id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-primary">#{row.position}</td>
                          <td className="px-4 py-3 font-mono text-xs">{row.pro_code}</td>
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
            </Card>
          )}

          {/* Pagination */}
          {totalFifoPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">
                Página {fifoPage + 1} de {totalFifoPages} • {fifoData?.count?.toLocaleString('pt-BR')} {pluralize(fifoData?.count ?? 0, 'posição', 'posições')}
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
        </section>

        {/* ═══ BLOCO 7 — Reforço de confiança ═══ */}
        <div className="flex items-start gap-2 p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
          <span>
            A ordem da fila é pública e não pode ser alterada. Os códigos exibidos são identificadores do sistema — nenhum dado pessoal é exposto. O ciclo avança conforme vendas reais de adubo são confirmadas.
          </span>
        </div>

        {/* ═══ BLOCO 8 — Próximos passos ═══ */}
        <section className="text-center py-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/painel-publico">
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar ao Painel Público
                </Button>
              </Link>
              <Link to="/transparencia">
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                  <Shield className="w-3.5 h-3.5" />
                  Entender como funciona
                </Button>
              </Link>
              <Link to="/planos">
                <Button size="sm" className="gap-2 w-full sm:w-auto">
                  Participar do ciclo <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}