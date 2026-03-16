import React, { useState } from 'react';
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

import { fetchPublicFifo, fetchPublicKPIs, fetchCycleStagesCounts, type PublicFifoEntry, type CycleStageCounts } from '@/lib/publicTransparency';
import { useIsMobile } from '@/hooks/use-mobile';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDateShort(iso: string) {
  return format(new Date(iso), 'dd/MM/yyyy', { locale: ptBR });
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Aguardando',   color: 'bg-amber-500/15 text-amber-700 border-amber-400/30' },
  processing: { label: 'Processando', color: 'bg-blue-500/15 text-blue-700 border-blue-400/30' },
  ready:      { label: 'Produzido',    color: 'bg-primary/15 text-primary border-primary/30' },
  sold:       { label: 'Vendido',      color: 'bg-emerald-500/15 text-emerald-700 border-emerald-400/30' },
  paid:       { label: 'Concluído',    color: 'bg-green-600/15 text-green-700 border-green-500/30' },
};

const maskCode = (code: string) =>
  code.length > 4 ? `...${code.slice(-4)}` : code;

function pluralize(n: number, singular: string, plural: string) {
  return n === 1 ? singular : plural;
}

const FIFO_PAGE_SIZE = 50;

// ─── Cycle Stages ───────────────────────────────────────────────────────────

const CYCLE_STAGES = [
  { key: 'coleta' as const,        icon: MapPin,            label: 'Coleta',         emoji: '📍', description: 'Resíduo coletado' },
  { key: 'processamento' as const, icon: Factory,           label: 'Processamento',  emoji: '🏭', description: 'Em compostagem' },
  { key: 'producao' as const,      icon: Wheat,             label: 'Produção',       emoji: '🌾', description: 'Adubo produzido' },
  { key: 'venda' as const,         icon: Package,           label: 'Venda',          emoji: '📦', description: 'Adubo vendido' },
  { key: 'pago' as const,          icon: CircleDollarSign,  label: 'Concluído',      emoji: '💰', description: 'Ciclo completo' },
];

function CycleStagesBlock({ counts, isLoading }: { counts?: CycleStageCounts; isLoading: boolean }) {
  const isMobile = useIsMobile();
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="p-5">
        <h2 className="font-bold text-foreground text-sm mb-1">Etapas do ciclo agora</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Veja em que fase as participações estão neste momento.
        </p>

        <div className={`grid gap-2 ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
          {CYCLE_STAGES.map((stage, idx) => {
            const count = counts?.[stage.key] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div
                key={stage.key}
                className="relative flex flex-col items-center text-center p-3 rounded-lg bg-muted/40 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <span className="text-xl mb-1">{stage.emoji}</span>
                <span className="text-[11px] font-semibold text-foreground leading-tight">{stage.label}</span>
                <span className="text-lg font-bold text-primary mt-1">{count.toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-muted-foreground">{stage.description}</span>
                {total > 0 && (
                  <div className="w-full mt-2">
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {total > 0 && (
          <p className="text-[11px] text-muted-foreground mt-3 text-center">
            {total.toLocaleString('pt-BR')} {pluralize(total, 'participação', 'participações')} no ciclo
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PublicFilaPage() {
  const isMobile = useIsMobile();
  const [fifoPage, setFifoPage] = useState(0);
  const [fifoSearch, setFifoSearch] = useState('');

  const { data: kpis } = useQuery({
    queryKey: ['public-kpis-fila'],
    queryFn: fetchPublicKPIs,
    staleTime: 60_000,
  });

  const { data: stageCounts, isLoading: stagesLoading } = useQuery({
    queryKey: ['public-cycle-stages'],
    queryFn: fetchCycleStagesCounts,
    staleTime: 60_000,
  });

  const { data: fifoData, isLoading: fifoLoading, error: fifoError } = useQuery({
    queryKey: ['public-fifo-page', fifoPage, fifoSearch],
    queryFn: () => fetchPublicFifo(fifoPage, FIFO_PAGE_SIZE, fifoSearch, false),
    staleTime: 30_000,
  });

  const totalFifoPages = fifoData ? Math.ceil(fifoData.count / FIFO_PAGE_SIZE) : 1;

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

        {/* ═══ BLOCO 3 — Resumo rápido ═══ */}
        {kpis && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl md:text-2xl font-bold text-foreground">{kpis.totalPros.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground mt-1">total na fila</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl md:text-2xl font-bold text-foreground">{kpis.pendingPros.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground mt-1">{pluralize(kpis.pendingPros, 'aguardando', 'aguardando')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl md:text-2xl font-bold text-primary">{kpis.paidPros.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground mt-1">{pluralize(kpis.paidPros, 'concluído', 'concluídos')}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══ BLOCO 3.5 — Etapas do Ciclo (NOVO) ═══ */}
        <CycleStagesBlock counts={stageCounts} isLoading={stagesLoading} />

        {/* ═══ BLOCO 4 — Busca ═══ */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Buscar por código…"
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

        {/* ═══ BLOCO 5 — Lista / Tabela ═══ */}
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
                  {fifoSearch ? 'Nenhum resultado encontrado' : 'A fila ainda está vazia'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {fifoSearch
                    ? 'Nenhuma participação encontrada com esse código. Verifique e tente novamente.'
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
                        <span className="font-mono">{maskCode(row.pro_code)}</span>
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

        {/* ═══ BLOCO 6 — Reforço de confiança ═══ */}
        <div className="flex items-start gap-2 p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
          <span>
            A ordem da fila é pública e não pode ser alterada. O ciclo avança conforme vendas reais de adubo são confirmadas.
          </span>
        </div>

        {/* ═══ BLOCO 7 — Próximos passos ═══ */}
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
