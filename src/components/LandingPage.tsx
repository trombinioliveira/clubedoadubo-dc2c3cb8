import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sprout, Recycle, BarChart3, ShieldCheck, ArrowRight, Eye, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicKPIs, fetchPublicFifo, fetchPublicSales } from '@/lib/publicTransparency';

interface LandingPageProps {
  onGetStarted: () => void;
}

function fmtBRL(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const { data: kpis } = useQuery({
    queryKey: ['home-kpis'],
    queryFn: fetchPublicKPIs,
    staleTime: 60_000,
  });

  const { data: fifoData } = useQuery({
    queryKey: ['home-fifo'],
    queryFn: () => fetchPublicFifo(0, 5),
    staleTime: 60_000,
  });

  const { data: sales } = useQuery({
    queryKey: ['home-sales'],
    queryFn: () => fetchPublicSales(3),
    staleTime: 60_000,
  });

  return (
    <>
      {/* BLOCO 1 — HERO */}
      <section className="relative overflow-hidden py-16 sm:py-20 md:py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-4 sm:top-20 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 sm:mb-6 leading-tight">
              Resíduos viram adubo.<br />De forma transparente.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10">
              Um sistema urbano auditável onde você participa da transformação.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/planos">
                <Button variant="hero" size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-6">
                  <Sprout className="w-5 h-5" />
                  Participar do ciclo
                </Button>
              </Link>
              <Link to="/planos#pro-avulso">
                <Button variant="ghost" size="lg" className="text-sm px-6 py-4 text-muted-foreground">
                  Começar com R$ 1 →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 2 — SISTEMA ATIVO */}
      <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10">
              Sistema já ativo e auditável
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: BarChart3, text: 'Fila única e pública' },
                { icon: Eye, text: 'Painel de transparência em tempo real' },
                { icon: Recycle, text: 'Processamento real de resíduo orgânico' },
                { icon: ShieldCheck, text: 'Pagamentos via Mercado Pago' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base text-foreground font-medium">{item.text}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground/70 text-center mb-6">
              Ciclo em fase inicial de expansão.
            </p>

            <div className="text-center">
              <Link to="/painel-publico">
                <Button variant="outline" size="lg">
                  <Eye className="w-4 h-4 mr-2" />
                  Auditar o sistema completo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 3 — PREVIEW DO PAINEL PÚBLICO */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Dados reais, abertos a todos
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Fila */}
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Status da fila</p>
                  {kpis ? (
                    <>
                      <p className="text-2xl font-bold text-foreground">{kpis.totalPros} PROs</p>
                      <p className="text-xs text-muted-foreground">{kpis.paidPros} já pagos</p>
                    </>
                  ) : (
                    <div className="h-10 flex items-center"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
                  )}
                </CardContent>
              </Card>

              {/* Última venda */}
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Última venda registrada</p>
                  {kpis?.lastSale ? (
                    <>
                      <p className="text-2xl font-bold text-foreground">{fmtBRL(kpis.lastSale.amount)}</p>
                      <p className="text-xs text-muted-foreground truncate">{kpis.lastSale.description || 'Venda confirmada'}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">—</p>
                  )}
                </CardContent>
              </Card>

              {/* PROs pagos */}
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">PROs pagos recentemente</p>
                  {kpis ? (
                    <>
                      <p className="text-2xl font-bold text-foreground">{kpis.paidPros}</p>
                      <p className="text-xs text-muted-foreground">pagamentos concluídos</p>
                    </>
                  ) : (
                    <div className="h-10 flex items-center"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Link to="/painel-publico">
                <Button variant="hero" size="lg">
                  Ver painel completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 4 — COMO FUNCIONA */}
      <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8 sm:mb-12">
              Como funciona?
            </h2>

            <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10">
              {[
                { num: '1', text: 'Resíduo orgânico é coletado e processado. Vira adubo real.' },
                { num: '2', text: 'Você participa ativando PROs.' },
                { num: '3', text: 'O adubo é vendido. O valor nasce da venda real.' },
                { num: '4', text: 'O valor gerado é distribuído conforme a fila pública.' },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-4 sm:gap-5">
                  <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full earth-gradient text-primary-foreground text-lg sm:text-xl font-bold flex-shrink-0">
                    {item.num}
                  </span>
                  <p className="text-base sm:text-lg md:text-xl text-foreground font-medium pt-1.5 sm:pt-2">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 sm:p-6 text-center space-y-1">
              <p className="text-sm sm:text-base text-foreground font-semibold">Sem promessas mágicas.</p>
              <p className="text-sm sm:text-base text-foreground font-semibold">Sem atalhos.</p>
              <p className="text-sm sm:text-base text-foreground font-semibold">Tudo rastreável.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 5 — POR QUE CRIAMOS O CLUBE */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-8">
              Por que criamos o Clube do Adubo?
            </h2>

            <div className="text-base sm:text-lg text-muted-foreground space-y-4 max-w-2xl mx-auto text-left">
              <p>
                Percebemos que toneladas de resíduo orgânico eram descartadas diariamente nas cidades,
                sem nenhum aproveitamento. Ao mesmo tempo, o adubo orgânico tem demanda crescente.
              </p>
              <p>
                Criamos um sistema transparente que conecta essas duas pontas: transforma resíduo em
                adubo de verdade, vende o produto e distribui o valor gerado de forma justa — por
                ordem cronológica, em uma fila pública auditável.
              </p>
              <p className="text-foreground font-medium">
                Não prometemos retornos. Prometemos transparência.
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/planos">
                <Button variant="hero" size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-6">
                  <Sprout className="w-5 h-5" />
                  Participar do ciclo
                </Button>
              </Link>
              <Link to="/planos#pro-avulso">
                <Button variant="ghost" size="lg" className="text-sm px-6 py-4 text-muted-foreground">
                  Começar com R$ 1 →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
