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
  Heart,
  ShoppingBag,
  HelpCircle,
  Mail
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
              Participe de um ciclo que transforma resíduo em{' '}
              <span className="text-primary">adubo, ajuda o meio ambiente e gera valor</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
              O Clube do Adubo conecta pessoas a um ciclo urbano simples e transparente.
              Resíduo vira adubo, o impacto é real — e quando o ciclo se fecha, o valor é distribuído com regras claras.
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
                🚯 O problema do resíduo orgânico urbano
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Todos os dias, toneladas de restos de comida são descartadas nas cidades.
                Em vez de voltar para o solo, esse material vai para aterros, onde vira poluição, desperdício e custo.
                Isso afeta o meio ambiente, a cidade e o bolso de todo mundo.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: Trash2, title: 'Aterros lotados', description: 'Grande parte do lixo urbano é orgânico e poderia ser reaproveitada', color: 'text-destructive' },
                { icon: Wind, title: 'Emissão de gases poluentes', description: 'Resíduo orgânico mal descartado gera gases que agravam a crise climática', color: 'text-muted-foreground' },
                { icon: Sprout, title: 'Nutrientes desperdiçados', description: 'O que poderia virar adubo e regenerar o solo é tratado como lixo', color: 'text-primary' },
                { icon: DollarSign, title: 'Custo ambiental e financeiro', description: 'A cidade paga para enterrar valor — e a conta volta em impostos e impacto', color: 'text-secondary' },
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
              ⏰ Isso não é um problema do futuro. <span className="text-destructive">É um problema de agora, urbano e diário.</span> E só muda quando o ciclo é repensado.
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
                🌱 A Solução
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                Economia circular real
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                O resíduo vira adubo de verdade, dentro da cidade, fechando o ciclo sem atalhos.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: Recycle, title: 'Ciclo fechado e contínuo', description: 'O resíduo entra, é transformado, o adubo é vendido e quem participou recebe o valor gerado' },
                { icon: Globe, title: 'Impacto mensurável', description: 'Nada é estimativa — dados reais e rastreáveis' },
                { icon: Eye, title: 'Rastreabilidade total', description: 'Do resíduo ao adubo e ao retorno que cai na sua conta' },
                { icon: Users, title: 'Participação coletiva', description: 'Pessoas, feiras e parceiros no mesmo sistema' },
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
              🔄 O ciclo do Clube do Adubo
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
              Acompanhe cada etapa do ciclo — do resíduo ao valor, com transparência total.<br className="hidden sm:inline" />
              Nada acontece escondido. O ciclo é claro, contínuo e pode ser acompanhado passo a passo.
            </p>
          </div>
          
          <CycleVisual />
          
          <p className="text-center text-primary mt-6 sm:mt-8 text-sm sm:text-base lg:text-lg font-semibold px-2">
            🔁 O ciclo se repete. Um sistema contínuo, urbano e sustentável — onde impacto ambiental e retorno caminham juntos.
          </p>
        </div>
      </section>

      {/* 5️⃣ COMO FUNCIONA - PASSO A PASSO - Mobile optimized */}
      <section id="como-funciona" className="py-12 sm:py-16 md:py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              ✅ Simples, transparente e rastreável
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Entenda cada etapa do ciclo
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
                🧭 Uma fila de pagamento. Muitas ondas de impacto.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                Duas coisas acontecem ao mesmo tempo, mas não se misturam.
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
                      <h3 className="font-bold text-foreground text-base sm:text-lg">💰 Fila FIFO (Pagamento)</h3>
                      <p className="text-sm text-muted-foreground">(é aqui que você recebe)</p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">
                    Ordem justa, fila única e global, totalmente transparente. Nada muda a ordem da fila.
                  </p>
                  <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Ordem justa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Fila única e global</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Totalmente transparente</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Nada muda a ordem</span>
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
                      <h3 className="font-bold text-foreground text-base sm:text-lg">🌊 Ondas de Impacto (Engajamento)</h3>
                      <p className="text-sm text-muted-foreground">Geram mais impacto ambiental. Nunca alteram a fila de pagamento.</p>
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

            <p className="text-center mt-4 sm:mt-6 text-sm sm:text-base text-muted-foreground px-2">
              Suas ondas de impacto fazem o ciclo acontecer mais vezes. Isso não muda a ordem da fila, mas faz a fila andar mais rápido.
            </p>
            <p className="text-center mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-foreground px-2">
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
              🌱 Por que fazer parte do Clube do Adubo?
            </h2>
            <p className="text-center text-primary-foreground/80 mb-8 sm:mb-12 max-w-xl mx-auto text-sm sm:text-base px-2">
              Aqui você não apenas consome. Você participa do ciclo.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                { icon: Globe, title: 'Impacto ambiental real', description: 'Seu resíduo vira adubo de verdade' },
                { icon: Recycle, title: 'Economia circular urbana', description: 'Ciclo local e contínuo' },
                { icon: Eye, title: 'Transparência total', description: 'Acompanhe cada etapa' },
                { icon: Target, title: 'Sonhos conectados ao ciclo', description: 'Quando o ciclo acontece mais vezes, o caminho até seus sonhos fica mais curto' },
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
                📘 Aprenda mais sobre o ciclo
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

      {/* 9️⃣ CONFIANÇA E AÇÃO - Mobile optimized */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                ✅ Escolha como participar — com clareza total
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                Tudo funciona dentro do ciclo.<br />
                Sem atalhos. Sem promessas vazias.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Link to="/planos" className="group">
                <Card className="h-full border-2 border-primary/30 hover:border-primary hover:shadow-elevated transition-all duration-300 bg-card">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl earth-gradient flex items-center justify-center group-hover:shadow-glow transition-all">
                      <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Planos</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Ative PROs, adubos e assinaturas para entrar no ciclo
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/transparencia" className="group">
                <Card className="h-full border-2 border-blue-500/30 hover:border-blue-500 hover:shadow-elevated transition-all duration-300 bg-card">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-blue-500 flex items-center justify-center group-hover:shadow-lg transition-all">
                      <Eye className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Transparência</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Acompanhe dados reais do resíduo, do ciclo e da fila FIFO
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/faq" className="group">
                <Card className="h-full border-2 border-accent/30 hover:border-accent hover:shadow-elevated transition-all duration-300 bg-card">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl gold-gradient flex items-center justify-center group-hover:shadow-lg transition-all">
                      <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-accent-foreground" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">FAQ</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Entenda PROs, regras do sistema e o funcionamento do ciclo
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/contato" className="group">
                <Card className="h-full border-2 border-purple-500/30 hover:border-purple-500 hover:shadow-elevated transition-all duration-300 bg-card">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-purple-500 flex items-center justify-center group-hover:shadow-lg transition-all">
                      <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Contato</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Fale com o Clube do Adubo. Pessoas reais.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🔟 CTA FINAL - Mobile optimized */}
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
              Ela só precisa funcionar — e funcionar de verdade.
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

      {/* 1️⃣1️⃣ FOOTER - Mobile optimized with microcopy */}
      <footer className="py-8 sm:py-12 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-8 sm:gap-10">
            {/* Top row - Logo and main links with microcopy */}
            <div className="flex flex-col gap-8 md:flex-row md:justify-between md:items-start">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="Clube do Adubo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                <div>
                  <span className="font-bold text-foreground block text-sm sm:text-base">Clube do Adubo</span>
                  <span className="text-xs text-muted-foreground">Economia Circular Urbana</span>
                </div>
              </div>
              
              {/* Links with microcopy */}
              <nav className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <Link to="/planos" className="group text-center sm:text-left">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base block mb-0.5">
                    Planos
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Veja como participar do ciclo
                  </span>
                </Link>
                <Link to="/transparencia" className="group text-center sm:text-left">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base block mb-0.5">
                    Transparência
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Acompanhe o resíduo, o ciclo e os dados
                  </span>
                </Link>
                <Link to="/faq" className="group text-center sm:text-left">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base block mb-0.5">
                    FAQ
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Tire dúvidas sobre PRO, fila e impacto
                  </span>
                </Link>
                <Link to="/contato" className="group text-center sm:text-left">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base block mb-0.5">
                    Contato
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Fale com a gente, pessoas reais
                  </span>
                </Link>
              </nav>
            </div>

            {/* Bottom row */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-xs sm:text-sm text-muted-foreground">
                © {new Date().getFullYear()} Clube do Adubo — Economia Circular Urbana
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Transparência não é um detalhe. Ela sustenta o ciclo.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
