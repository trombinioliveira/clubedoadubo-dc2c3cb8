import React from 'react';
import { Button } from '@/components/ui/button';
import { CycleVisual } from './CycleVisual';
import { Card, CardContent } from '@/components/ui/card';
import { LeafIcon, CompostIcon, FertilizerIcon, MoneyIcon } from './icons/CycleIcons';
import { 
  ArrowRight, 
  Recycle, 
  Users, 
  ListOrdered, 
  Waves, 
  Trash2, 
  Wind, 
  Sprout, 
  DollarSign,
  Eye,
  Target,
  BookOpen,
  CircleDot,
  MessageCircle,
  CheckCircle2,
  Globe,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/logo.webp';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const scrollToCycle = () => {
    const cycleSection = document.getElementById('como-funciona');
    cycleSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* 1️⃣ HERO SECTION - Mobile optimized */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-4 sm:top-20 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <Recycle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Economia Circular Urbana
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-foreground mb-4 sm:mb-6 leading-tight px-2">
              Transforme resíduo orgânico em{' '}
              <span className="text-primary">adubo, impacto real e valor contínuo</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
              O Clube do Adubo conecta pessoas a um ciclo urbano simples e transparente:
              resíduo vira adubo, adubo gera valor — e tudo pode ser acompanhado.
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center px-4 sm:px-0">
              <Button onClick={onGetStarted} variant="hero" size="lg" className="w-full sm:w-auto text-base">
                <Sprout className="w-5 h-5" />
                Quero participar
              </Button>
              <Button variant="outline" size="lg" onClick={scrollToCycle} className="w-full sm:w-auto text-base">
                <BookOpen className="w-5 h-5" />
                Entender como funciona
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ O PROBLEMA - Mobile optimized */}
      <section className="py-12 sm:py-16 md:py-24 bg-destructive/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                O problema do resíduo orgânico urbano
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Todos os dias, toneladas de resíduos orgânicos vão para aterros.
                Isso gera gases, desperdiça nutrientes e custa caro — para a cidade e para o planeta.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: Trash2, title: 'Aterros lotados', color: 'text-destructive' },
                { icon: Wind, title: 'Emissão de gases poluentes', color: 'text-muted-foreground' },
                { icon: Sprout, title: 'Nutrientes desperdiçados', color: 'text-primary' },
                { icon: DollarSign, title: 'Custo ambiental e financeiro', color: 'text-secondary' },
              ].map((item, index) => (
                <Card key={index} className="bg-background/50 border-destructive/20">
                  <CardContent className="p-3 sm:p-5 text-center">
                    <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 ${item.color}`} />
                    <p className="font-medium text-foreground text-xs sm:text-sm md:text-base">{item.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center mt-6 sm:mt-8 text-sm sm:text-base lg:text-lg font-semibold text-foreground px-2">
              Isso não é um problema do futuro. <span className="text-destructive">É de agora. E é urbano.</span>
            </p>
          </div>
        </div>
      </section>

      {/* 3️⃣ A SOLUÇÃO - Mobile optimized */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                A Solução
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                Economia Circular Urbana
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                O Clube do Adubo transforma resíduos orgânicos urbanos em adubo natural de alta qualidade, 
                fechando o ciclo de forma local, transparente e contínua.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: Recycle, title: 'Economia circular real', description: 'Ciclo fechado e contínuo' },
                { icon: Globe, title: 'Impacto mensurável', description: 'Dados reais e rastreáveis' },
                { icon: Eye, title: 'Rastreabilidade total', description: 'Do resíduo ao adubo' },
                { icon: Users, title: 'Participação coletiva', description: 'Comunidade engajada' },
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-elevated transition-all duration-300 group">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1 text-xs sm:text-sm md:text-base">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ O CICLO COMPLETO - Mobile optimized */}
      <section id="ciclo-visual" className="py-12 sm:py-16 md:py-24 bg-card scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              O Ciclo do Clube do Adubo
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
              Acompanhe cada etapa do ciclo:<br className="hidden sm:inline" />
              do resíduo ao valor, com total transparência.
            </p>
          </div>
          
          <CycleVisual />
          
          <p className="text-center text-primary mt-6 sm:mt-8 text-sm sm:text-base lg:text-lg font-semibold px-2">
            O valor só existe quando o ciclo acontece.
          </p>
        </div>
      </section>

      {/* 5️⃣ COMO FUNCIONA - PASSO A PASSO - Mobile optimized */}
      <section id="como-funciona" className="py-12 sm:py-16 md:py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Simples, transparente e rastreável
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Entenda cada etapa do processo
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Ative PROs',
                description: 'Cada PRO representa 100 g de resíduo orgânico real, que será processado.',
                icon: LeafIcon,
              },
              {
                step: '2',
                title: 'O resíduo vira adubo',
                description: 'Processamento biológico por compostagem urbana controlada.',
                icon: CompostIcon,
              },
              {
                step: '3',
                title: 'Venda do adubo',
                description: 'Produto real, com demanda real.',
                icon: FertilizerIcon,
              },
              {
                step: '4',
                title: 'O valor é distribuído',
                description: 'De forma justa, seguindo regras claras e públicas.',
                icon: MoneyIcon,
              },
            ].map((item, index) => (
              <Card key={index} className="group hover:shadow-elevated transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 earth-gradient" />
                <CardContent className="p-3 sm:p-4 md:p-6 text-center pt-5 sm:pt-6 md:pt-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-xl sm:rounded-2xl earth-gradient flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-foreground" />
                  </div>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-2 sm:mb-3 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-bold text-muted-foreground">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">{item.title}</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 md:mt-10 max-w-2xl mx-auto px-2">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <CircleDot className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground text-sm sm:text-base mb-1">Nota importante:</p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Nada acontece sem resíduo orgânico real.<br />
                      O ciclo só existe quando há processamento de resíduo de verdade.<br />
                      Nada é acelerado artificialmente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6️⃣ FILA FIFO x ONDAS DE IMPACTO - Mobile optimized */}
      <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                Uma fila de pagamento. Muitas ondas de impacto.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                Dois conceitos, duas funções. Clareza total.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-2 border-primary/40 hover:shadow-elevated transition-shadow bg-card">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl earth-gradient flex items-center justify-center shadow-glow flex-shrink-0">
                      <ListOrdered className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base sm:text-lg">Fila FIFO (Pagamento)</h3>
                      <p className="text-xl sm:text-2xl font-extrabold text-primary">= Dinheiro</p>
                    </div>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Ordem justa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Global</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Transparente</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Nunca muda</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/40 hover:shadow-elevated transition-shadow bg-card">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                      <Waves className="w-6 h-6 sm:w-7 sm:h-7 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base sm:text-lg">Ondas de Impacto (Engajamento)</h3>
                      <p className="text-xl sm:text-2xl font-extrabold text-accent">= Impacto</p>
                    </div>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                    <li className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>Indicações</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>Engajamento</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>Alcance ambiental</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>Nunca alteram a fila</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <p className="text-center mt-6 sm:mt-8 text-lg sm:text-xl font-bold text-foreground px-2">
              Fila é dinheiro. <span className="text-accent">Ondas são impacto.</span>
            </p>
          </div>
        </div>
      </section>

      {/* 7️⃣ POR QUE PARTICIPAR - Mobile optimized */}
      <section className="py-12 sm:py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4 px-2">
              Por que fazer parte do Clube do Adubo?
            </h2>
            <p className="text-center text-primary-foreground/80 mb-8 sm:mb-12 max-w-xl mx-auto text-sm sm:text-base px-2">
              Aqui você não apenas consome. Você participa do ciclo.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                { icon: Sprout, title: 'Impacto ambiental real', description: 'Seu resíduo vira adubo de verdade' },
                { icon: Recycle, title: 'Economia circular urbana', description: 'Ciclo local e contínuo' },
                { icon: Eye, title: 'Transparência total', description: 'Acompanhe cada etapa' },
                { icon: Target, title: 'Sonhos conectados ao ciclo', description: 'Metas que evoluem junto com o impacto' },
                { icon: Users, title: 'Participação coletiva', description: 'Comunidade engajada' },
                { icon: Heart, title: 'Ciclo contínuo', description: 'O valor retorna e se repete' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-primary-foreground/10 rounded-xl hover:bg-primary-foreground/15 transition-colors">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-0.5 sm:mb-1 text-sm sm:text-base">{item.title}</h3>
                    <p className="text-xs sm:text-sm opacity-90">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8️⃣ APRENDER - Mobile optimized */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 rounded-full text-accent text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Educação
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                Aprender sobre economia circular
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                'O problema do resíduo orgânico urbano',
                'Processamento orgânico e fechamento de ciclo',
                'Como o Clube do Adubo funciona',
                'Sustentabilidade e vida financeira',
                'Impacto ambiental nas cidades',
              ].map((title, index) => (
                <Card key={index} className="hover:shadow-elevated transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-3 sm:p-4 md:p-5 flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors flex-shrink-0">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    </div>
                    <p className="font-medium text-foreground text-sm sm:text-base">{title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-6 sm:mt-8">
              <Link to="/faq">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <BookOpen className="w-4 h-4" />
                  Acessar conteúdos educativos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9️⃣ CTA FINAL - Mobile optimized */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Pronto para participar do ciclo?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-2 sm:mb-4 px-2">
              Sustentabilidade não precisa ser complicada.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-foreground font-semibold mb-8 sm:mb-10 px-2">
              Ela só precisa funcionar.
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center px-4 sm:px-0">
              <Button onClick={onGetStarted} variant="hero" size="lg" className="w-full sm:w-auto">
                <Sprout className="w-5 h-5" />
                Criar minha conta
              </Button>
              <Button variant="outline" size="lg" onClick={scrollToCycle} className="w-full sm:w-auto">
                <BookOpen className="w-5 h-5" />
                Entender melhor
              </Button>
              <Link to="/contato" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full">
                  <MessageCircle className="w-5 h-5" />
                  Falar com o Clube
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🔟 FOOTER - Mobile optimized */}
      <footer className="py-8 sm:py-10 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Top row */}
            <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="Clube do Adubo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                <div>
                  <span className="font-bold text-foreground block text-sm sm:text-base">Clube do Adubo</span>
                  <span className="text-xs text-muted-foreground">Economia Circular Urbana</span>
                </div>
              </div>
              
              {/* Links */}
              <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
                <Link to="/planos" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Planos
                </Link>
                <Link to="/transparencia" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Transparência
                </Link>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  FAQ
                </Link>
                <Link to="/contato" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Contato
                </Link>
              </nav>
            </div>

            {/* Bottom row */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-xs sm:text-sm text-muted-foreground">
                © {new Date().getFullYear()} Clube do Adubo — Economia Circular Urbana
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
