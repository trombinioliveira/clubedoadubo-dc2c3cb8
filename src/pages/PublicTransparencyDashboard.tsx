import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  RefreshCw, Leaf, TrendingUp, DollarSign, MapPin, Clock,
  ArrowRight, Ban, Shield, Recycle, ListOrdered, AlertCircle,
  X, Receipt, Sprout, ExternalLink
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  fetchPublicKPIs, fetchPublicSales,
  fetchPublicCollectionPoints, fetchSiteSettingsPublic,
  type PublicSaleEntry, type PublicCollectionPoint,
  type PublicDistributionEntry, fetchPublicDistributions,
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

function ModuleDisabled({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm justify-center">
      <AlertCircle className="w-4 h-4" />
      <span>{label} indisponível temporariamente.</span>
    </div>
  );
}

function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}><CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-16" />
        </CardContent></Card>
      ))}
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string; sub?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PublicTransparencyDashboard() {
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey(k => k + 1);
    setUpdatedAt(new Date());
  }, []);

  const { data: settings } = useQuery({
    queryKey: ['public-transparency-settings', refreshKey],
    queryFn: fetchSiteSettingsPublic,
  });

  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery({
    queryKey: ['public-kpis', refreshKey],
    queryFn: fetchPublicKPIs,
    enabled: settings?.public_kpis_enabled !== false,
    staleTime: 60_000,
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['public-sales', refreshKey],
    queryFn: () => fetchPublicSales(6),
    enabled: settings?.public_sales_enabled !== false,
    staleTime: 60_000,
  });

  const { data: points = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['public-collection-points', refreshKey],
    queryFn: fetchPublicCollectionPoints,
    enabled: settings?.public_collection_points_enabled !== false,
    staleTime: 120_000,
  });

  const { data: distributions = [], isLoading: distributionsLoading } = useQuery({
    queryKey: ['public-distributions', refreshKey],
    queryFn: () => fetchPublicDistributions(6),
    staleTime: 60_000,
  });

  if (settings?.public_transparency_enabled === false) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Painel temporariamente indisponível</h1>
        <p className="text-muted-foreground">O painel público está indisponível no momento.</p>
        <Link to="/transparencia"><Button variant="outline">Entender como funciona</Button></Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Painel Público — Acompanhe o Ciclo | Clube do Adubo</title>
        <meta name="description" content="Acompanhe o ciclo do Clube do Adubo em tempo real: resíduos transformados, adubo produzido, fila pública e vendas reais." />
        <link rel="canonical" href="https://clubedoadubo.com.br/painel-publico" />
        <meta property="og:title" content="Painel Público — Acompanhe o Ciclo | Clube do Adubo" />
        <meta property="og:description" content="Dados reais do ciclo de economia circular, abertos para qualquer pessoa." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ═══ CAMADA 1 — LEITURA RÁPIDA ═══ */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-primary/8 via-primary/4 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-5">
            <Recycle className="w-4 h-4" />
            Acompanhamento público
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            O ciclo está acontecendo
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-3">
            Aqui qualquer pessoa pode ver dados reais do sistema. Resíduos coletados, adubo produzido, vendas e pagamentos — tudo visível.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            A operação viva acontece em <strong className="text-foreground">Cambury</strong>, no litoral norte de São Paulo.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Link to="/transparencia">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Shield className="w-3 h-3" />
                Entender como funciona
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="gap-2 text-muted-foreground text-xs"
            >
              <RefreshCw className="w-3 h-3" />
              Atualizar dados
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Atualizado em: {format(updatedAt, "HH:mm 'de' dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16 space-y-12">

        {/* ═══ KPIs — Indicadores Essenciais ═══ */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" /> Onde o ciclo está agora
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Números reais extraídos do sistema em tempo real.
          </p>

          {settings?.public_kpis_enabled === false ? (
            <ModuleDisabled label="Indicadores" />
          ) : kpisLoading ? (
            <KPISkeleton />
          ) : kpisError ? (
            <div className="text-center text-destructive py-8 text-sm">Não foi possível carregar os indicadores. Tente novamente.</div>
          ) : kpis ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <KPICard
                icon={Leaf}
                label="Resíduos transformados"
                value={fmtKg(kpis.weightCollectedGrams)}
                sub={`${kpis.totalWeighings} coletas realizadas`}
              />
              <KPICard
                icon={Sprout}
                label="Adubo devolvido ao ciclo"
                value={fmtKg(kpis.weightDoneGrams)}
                sub={`${kpis.batchesDone} lote${kpis.batchesDone !== 1 ? 's' : ''} pronto${kpis.batchesDone !== 1 ? 's' : ''}`}
              />
              <KPICard
                icon={ListOrdered}
                label="Participações aguardando"
                value={kpis.pendingPros.toLocaleString('pt-BR')}
                sub="na fila do ciclo"
              />
              <KPICard
                icon={TrendingUp}
                label="Participações concluídas"
                value={kpis.paidPros.toLocaleString('pt-BR')}
                sub={fmtBRL(kpis.totalDistributed) + ' devolvidos'}
              />
              <KPICard
                icon={MapPin}
                label="Pontos ativos"
                value={kpis.activeCollectionPoints.toLocaleString('pt-BR')}
                sub="recebendo resíduos"
              />
            </div>
          ) : null}
        </section>

        {/* ═══ CAMADA 2 — CONTEXTO TERRITORIAL ═══ */}
        <section>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">Operação viva em Cambury</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    O ciclo do Clube do Adubo está ativo em Cambury, São Sebastião — litoral norte de São Paulo.
                    Os dados acima refletem a operação real nesse território. A estrutura foi pensada para crescer e alcançar novos pontos e regiões.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ FILA — Preview ═══ */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-primary" />
                    Fila pública do ciclo
                  </CardTitle>
                  <CardDescription className="mt-1">
                    A ordem do ciclo é pública. Qualquer pessoa pode consultar a fila e verificar as posições.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {kpis && (
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-muted/40 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{kpis.pendingPros.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-muted-foreground">aguardando na fila</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{kpis.paidPros.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-muted-foreground">já concluídos</p>
                  </div>
                </div>
              )}
              <Link to="/painel-publico/fila">
                <Button className="w-full gap-2">
                  <ListOrdered className="w-4 h-4" />
                  Consultar fila completa
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* ═══ CAMADA 3 — DADOS DETALHADOS ═══ */}

        {/* Vendas */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" /> Últimas vendas de adubo
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Cada venda avança a fila e paga quem está na vez.
          </p>

          {settings?.public_sales_enabled === false ? (
            <ModuleDisabled label="Vendas" />
          ) : salesLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
          ) : sales.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">
              Ainda não há vendas registradas.
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {sales.map((sale: PublicSaleEntry) => (
                <Card key={sale.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{fmtBRL(sale.amount)}</p>
                          <p className="text-xs text-muted-foreground">{fmtDate(sale.received_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {sale.description && (
                          <span className="text-xs text-muted-foreground">{sale.description}</span>
                        )}
                        {sale.is_distributed && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                            ✓ Distribuída
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Distribuições */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" /> Como cada venda foi dividida
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            A cada venda confirmada, o sistema divide automaticamente: parte para quem está na fila, parte para a operação.
          </p>

          {distributionsLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
          ) : distributions.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">
              Nenhuma distribuição registrada ainda.
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {distributions.map((dist: PublicDistributionEntry) => (
                <Card key={dist.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{fmtBRL(Number(dist.gross_amount))}</p>
                        <p className="text-xs text-muted-foreground">
                          {dist.sale_received_at ? fmtDate(dist.sale_received_at) : fmtDate(dist.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {dist.pros_paid_count} participação{dist.pros_paid_count !== 1 ? 'ões' : ''} paga{dist.pros_paid_count !== 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                        {fmtBRL(Number(dist.amount_to_fifo))} para a fila
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                        {fmtBRL(Number(dist.amount_to_operations))} para operação
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Pontos de Coleta */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Pontos de coleta ativos
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Locais onde o resíduo orgânico é recebido para iniciar o ciclo.
          </p>

          {settings?.public_collection_points_enabled === false ? (
            <ModuleDisabled label="Pontos de coleta" />
          ) : pointsLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : points.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">
              Nenhum ponto de coleta ativo no momento.
            </CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {points.map((pt: PublicCollectionPoint) => (
                <Card key={pt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{pt.name}</p>
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
                    {pt.has_public_page && pt.slug && (
                      <Link to={`/ponto/${pt.slug}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs mt-1 px-2">Ver página do ponto <ArrowRight className="w-3 h-3 ml-1" /></Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* O que não existe aqui */}
        <section>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive text-base">
                <Ban className="w-5 h-5" /> O que não existe aqui
              </CardTitle>
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
            </CardContent>
          </Card>
        </section>

        {/* CTA Final — Positivo */}
        <section className="text-center py-8">
          <div className="max-w-lg mx-auto">
            <Recycle className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              O ciclo está vivo. Você pode participar.
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Conheça os planos, entenda melhor como funciona, ou consulte a fila pública do ciclo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/planos">
                <Button className="gap-2">
                  Conhecer os planos <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/transparencia">
                <Button variant="outline" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Entender como funciona
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
