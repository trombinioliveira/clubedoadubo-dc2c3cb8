import React from 'react';
import { Button } from '@/components/ui/button';
import { CycleVisual } from './CycleVisual';
import { Card, CardContent } from '@/components/ui/card';
import { LeafIcon, CompostIcon, FertilizerIcon, MoneyIcon } from './icons/CycleIcons';
import { ArrowRight, CheckCircle, Leaf, Recycle, TrendingUp, Users } from 'lucide-react';
import { PricingSection } from './PricingSection';
interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Recycle className="w-4 h-4" />
              Economia Circular Urbana
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
              Transforme resíduo em{' '}
              <span className="text-primary">valor</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              O Clube do Adubo transforma resíduo orgânico em adubo natural, e o adubo em valor — de forma rastreável, colaborativa e transparente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onGetStarted} variant="hero" size="xl">
                Participar do Ciclo
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl">
                Ver como funciona
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cycle visualization */}
      <section className="py-12 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              O Ciclo Completo
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Acompanhe cada etapa: do resíduo ao pagamento, tudo de forma transparente
            </p>
          </div>
          <CycleVisual />
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Como funciona?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Ative PROs',
                description: 'Cada PRO representa 100g de resíduo orgânico que será processado',
                icon: LeafIcon,
              },
              {
                step: '2',
                title: 'Acompanhe o processo',
                description: 'O resíduo é transformado em adubo através de compostagem',
                icon: CompostIcon,
              },
              {
                step: '3',
                title: 'Adubo é vendido',
                description: 'Quando o adubo é comercializado, você avança na fila',
                icon: FertilizerIcon,
              },
              {
                step: '4',
                title: 'Receba o valor',
                description: 'Seu PRO é pago seguindo a ordem justa da fila FIFO',
                icon: MoneyIcon,
              },
            ].map((item, index) => (
              <Card key={index} className="group hover:shadow-elevated transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl earth-gradient flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                    <item.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key points */}
      <section className="py-12 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Por que participar?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Leaf, title: 'Impacto Real', description: 'Seu resíduo vira adubo de verdade' },
                { icon: TrendingUp, title: 'Fila Justa', description: 'Ordem FIFO global e transparente' },
                { icon: Users, title: 'Onda de Impacto', description: 'Amplie seu alcance com indicações' },
                { icon: CheckCircle, title: '100% Rastreável', description: 'Acompanhe cada etapa do ciclo' },
                { icon: Recycle, title: 'Ciclo Contínuo', description: 'O valor retorna e o ciclo se repete' },
                { icon: MoneyIcon, title: 'Reconhecimento', description: 'R$ 2,00 por PRO quando vendido' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-primary-foreground/10 rounded-xl">
                  <item.icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm opacity-90">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection onGetStarted={onGetStarted} />

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Pronto para participar do ciclo?
            </h2>
            <p className="text-muted-foreground mb-8">
              Comece agora e acompanhe seu impacto ambiental de forma transparente
            </p>
            <Button onClick={onGetStarted} variant="hero" size="xl">
              Ativar meus PROs
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg earth-gradient flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Clube do Adubo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Clube do Adubo. Economia Circular Urbana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
