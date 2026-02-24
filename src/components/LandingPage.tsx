import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sprout, Recycle, DollarSign, BarChart3, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <>
      {/* SEÇÃO 1 — HERO */}
      <section className="relative overflow-hidden py-16 sm:py-20 md:py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-4 sm:top-20 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 sm:mb-6 leading-tight">
              🌱 Transforme restos de comida em adubo — e receba por isso.
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-primary mb-8">
              Simples assim.
            </p>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8 sm:mb-10 text-left max-w-xl mx-auto shadow-sm">
              <p className="text-base sm:text-lg font-medium text-foreground mb-4">
                Você participa de um sistema que:
              </p>
              <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Recycle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Processa resíduo orgânico real</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sprout className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Vira adubo de verdade</span>
                </li>
                <li className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>E distribui o valor gerado de forma transparente</span>
                </li>
              </ul>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground mb-6">
              👉 Clique, participe e acompanhe tudo.
            </p>

            <Link to="/comprar">
              <Button variant="hero" size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-6">
                <Sprout className="w-5 h-5" />
                Quero Participar do Ciclo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 — COMO FUNCIONA */}
      <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8 sm:mb-12">
              Como funciona?
            </h2>

            <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10">
              {[
                { num: '1', text: 'Você ativa uma unidade de processamento (PRO).' },
                { num: '2', text: 'O resíduo vira adubo real.' },
                { num: '3', text: 'Quando o adubo é vendido, o valor é distribuído para quem está na vez.' },
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

      {/* SEÇÃO 3 — O QUE É UM PRO */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-8">
              O que é um PRO?
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8">
              PRO é apenas uma unidade de <span className="font-semibold text-foreground">100g de resíduo orgânico real</span>.
            </p>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8 max-w-md mx-auto shadow-sm">
              <p className="text-sm sm:text-base font-medium text-foreground mb-4">Cada PRO representa:</p>
              <ul className="space-y-3 text-sm sm:text-base text-muted-foreground text-left">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Resíduo processado</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Adubo produzido</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Participação no ciclo</span>
                </li>
              </ul>
            </div>

            <p className="text-base sm:text-lg font-semibold text-primary">
              Simples. Nada mais que isso.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 — O QUE VOCÊ GANHA */}
      <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-8 sm:mb-10">
              O que você ganha?
            </h2>

            <div className="space-y-5 sm:space-y-6 max-w-md mx-auto">
              {[
                { icon: Sprout, text: 'Participa de impacto ambiental real' },
                { icon: DollarSign, text: 'Recebe quando chega sua vez na fila' },
                { icon: BarChart3, text: 'Pode acompanhar tudo publicamente' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-foreground font-medium text-left">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5 — FILA */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-8">
              Como funciona o pagamento?
            </h2>

            <div className="space-y-4 text-base sm:text-lg md:text-xl text-muted-foreground mb-8">
              <p>Existe uma <span className="font-semibold text-foreground">fila única</span>.</p>
              <p>Quem entra primeiro, <span className="font-semibold text-foreground">recebe primeiro</span>.</p>
              <p><span className="font-semibold text-foreground">Nada muda</span> essa ordem.</p>
              <p>Quanto mais adubo for vendido, mais rápido a fila anda.</p>
            </div>

            <p className="text-lg sm:text-xl font-semibold text-primary">
              Simples assim.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6 — SEGURANÇA */}
      <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-8 sm:mb-10">
              É seguro?
            </h2>

            <div className="space-y-4 max-w-md mx-auto">
              {[
                'Só existe valor se existir resíduo real',
                'Só há pagamento se houver venda real de adubo',
                'Dados públicos e rastreáveis',
                'Regras claras',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-left">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                  <p className="text-sm sm:text-base md:text-lg text-foreground font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7 — CHAMADA FINAL */}
      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6">
              Quer participar?
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground mb-3">
              Não precisa entender tudo agora.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10">
              Basta entrar no ciclo e acompanhar.
            </p>

            <Link to="/comprar">
              <Button variant="hero" size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-6">
                <Sprout className="w-5 h-5" />
                Entrar no Ciclo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
