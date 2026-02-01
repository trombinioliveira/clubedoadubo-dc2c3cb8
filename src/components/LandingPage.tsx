import React from 'react';
import { Button } from '@/components/ui/button';
import { CycleVisual } from './CycleVisual';
import { Card, CardContent } from '@/components/ui/card';
import { LeafIcon, CompostIcon, FertilizerIcon, MoneyIcon } from './icons/CycleIcons';
import { ArrowRight, CheckCircle, Leaf, Recycle, TrendingUp, Users, ListOrdered, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const scrollToCycle = () => {
    const cycleSection = document.getElementById('ciclo-visual');
    cycleSection?.scrollIntoView({ behavior: 'smooth' });
  };

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
              Transforme resíduo orgânico em{' '}
              <span className="text-primary">adubo e impacto real</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              O Clube do Adubo conecta pessoas a um ciclo urbano onde o resíduo vira adubo, 
              o adubo gera valor e tudo é rastreável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onGetStarted} variant="hero" size="xl">
                Quero participar do ciclo
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl" onClick={scrollToCycle}>
                Ver como funciona ↓
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cycle visualization */}
      <section id="ciclo-visual" className="py-12 md:py-20 bg-card scroll-mt-20">
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
          <p className="text-center text-muted-foreground mt-6 text-sm font-medium">
            O valor só se move quando o ciclo acontece.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Como funciona?
            </h2>
            <p className="text-muted-foreground">
              Simples, transparente e rastreável do início ao fim
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Ative seus PROs',
                description: 'Cada PRO representa 100g de resíduo orgânico que você ajuda a processar',
                icon: LeafIcon,
              },
              {
                step: '2',
                title: 'Resíduo vira adubo',
                description: 'O material é compostado e transformado em adubo natural de alta qualidade',
                icon: CompostIcon,
              },
              {
                step: '3',
                title: 'Adubo é vendido',
                description: 'Quando o adubo é comercializado, o valor entra no sistema',
                icon: FertilizerIcon,
              },
              {
                step: '4',
                title: 'Valor distribuído',
                description: 'Você recebe R$ 2,00 por PRO seguindo a ordem justa da fila FIFO',
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

      {/* Fila + Ondas */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Uma fila de pagamento. Muitas ondas de impacto.
              </h2>
              <p className="text-muted-foreground">
                Dois conceitos, duas funções. Clareza total.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/30 hover:shadow-elevated transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ListOrdered className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Fila FIFO</h3>
                      <p className="text-2xl font-bold text-primary">= Dinheiro</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Ordem justa de pagamento. Quem entrou primeiro, recebe primeiro. 
                    Ninguém fura a fila, ninguém paga para acelerar.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/30 hover:shadow-elevated transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Waves className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Ondas de Impacto</h3>
                      <p className="text-2xl font-bold text-accent">= Impacto</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Métricas de engajamento e indicações. Mostram seu impacto ambiental, 
                    mas nunca alteram a ordem de pagamento.
                  </p>
                </CardContent>
              </Card>
            </div>

            <p className="text-center mt-6 text-muted-foreground font-medium">
              Fila é dinheiro. Ondas são impacto.
            </p>
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
                { icon: MoneyIcon, title: 'Reconhecimento', description: 'Distribuição do valor gerado na venda' },
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onGetStarted} variant="hero" size="xl">
                Ativar meus PROs
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Link to="/planos">
                <Button variant="outline" size="xl">
                  Ver planos e assinaturas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6">
            {/* Top row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg earth-gradient flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Clube do Adubo</span>
              </div>
              
              {/* Links */}
              <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <Link to="/planos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Planos
                </Link>
                <Link to="/transparencia" className="text-muted-foreground hover:text-foreground transition-colors">
                  Transparência
                </Link>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
                <Link to="/contato" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </Link>
              </nav>
            </div>

            {/* Bottom row */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Clube do Adubo. Economia Circular Urbana.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
