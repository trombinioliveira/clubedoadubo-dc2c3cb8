import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, Eye, BarChart3, ShieldCheck, Recycle, ArrowRight, Leaf, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <>
      {/* ═══ A1) HERO ═══ */}
      <section className="relative overflow-hidden py-16 sm:py-20 md:py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-4 sm:top-20 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 sm:mb-6 leading-tight">
              A cidade produz resíduo.<br />
              A gente transforma em vida.<br />
              <span className="text-primary">Participe do ciclo. Construa sua jornada. Realize sonhos.</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Você acompanha com dados públicos e rastreáveis.
            </p>

            {/* A2) PONTE */}
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 mb-8 text-left sm:text-center max-w-2xl mx-auto">
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                R$ 1 coloca você dentro do ciclo com 1 PRO. 100g de resíduo orgânico viram adubo — e você acompanha cada etapa publicamente.
              </p>
              <p className="text-sm sm:text-base text-foreground leading-relaxed mt-2">
                Quando a venda de 100g de adubo é registrada, o valor da venda é distribuído aos participantes pela regra pública do Clube.
              </p>
            </div>

            {/* A3) CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/planos">
                <Button variant="hero" size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-6">
                  <Sprout className="w-5 h-5" />
                  Quero participar todo mês
                </Button>
              </Link>
              <Link to="/planos#pro-avulso">
                <Button variant="outline" size="lg" className="text-sm sm:text-base px-6 py-4">
                  Testar com R$ 1
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ J) POR QUE CRIAMOS ═══ */}
      <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6">
              Por que criamos o Clube do Adubo?
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
              Toneladas de resíduo orgânico são descartadas todos os dias nas cidades.
              Ao mesmo tempo, existe demanda real por adubo orgânico.
              Criamos um sistema que conecta essas duas pontas: transforma resíduo em adubo, registra a venda e distribui o valor aos participantes.
              Sem promessas mágicas. Só transparência.
            </p>

            <p className="text-sm text-foreground font-medium italic mb-6">
              Transparência não é um detalhe. Ela sustenta o ciclo.
            </p>

            <Link to="/transparencia" className="text-sm text-primary hover:underline">
              Entenda o projeto →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ G) COMO FUNCIONA O CICLO ═══ */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10">
              Como funciona o ciclo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                'Resíduo orgânico é coletado e processado. Vira adubo real.',
                'Você entra no ciclo ativando PROs (cada PRO registra 100g).',
                'O adubo é vendido. O valor só existe quando a venda é registrada.',
                'Esse valor é distribuído pela regra pública do Clube (fila) — e você acompanha tudo no painel, incluindo o que foi destinado à sua participação.',
              ].map((text, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full earth-gradient text-primary-foreground text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm sm:text-base text-foreground pt-0.5">{text}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Sem atalhos. Tudo rastreável.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ H) SONHOS E JORNADA ═══ */}
      <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4">
              Sonhos viram jornada.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
              Dentro do Clube, você cria sonhos e acompanha sua evolução no ciclo.
              Cada PRO registra 100g de resíduo orgânico entrando no ciclo — de forma pública e rastreável.
            </p>

            <ul className="text-sm sm:text-base text-foreground space-y-2 mb-6 max-w-md mx-auto text-left">
              <li className="flex items-start gap-2">
                <Sprout className="w-4 h-4 text-primary mt-1 shrink-0" />
                Crie seus sonhos e metas dentro do Clube
              </li>
              <li className="flex items-start gap-2">
                <Sprout className="w-4 h-4 text-primary mt-1 shrink-0" />
                Acompanhe seu progresso com clareza e transparência
              </li>
              <li className="flex items-start gap-2">
                <Sprout className="w-4 h-4 text-primary mt-1 shrink-0" />
                Veja o ciclo acontecer no painel público, etapa por etapa
              </li>
            </ul>

            <p className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
              Quando há venda registrada, o valor é distribuído pela regra pública do Clube — e isso alimenta sua jornada: você acompanha e avança nos seus sonhos e metas.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/auth">
                <Button variant="hero" size="lg">
                  Criar minha jornada
                </Button>
              </Link>
              <Link to="/auth" className="text-sm text-primary hover:underline">
                Já tenho conta → Entrar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ D) SISTEMA JÁ ATIVO E AUDITÁVEL ═══ */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              Sistema já ativo e auditável
            </h2>
            <p className="text-muted-foreground text-center mb-8 sm:mb-10 text-sm sm:text-base">
              Veja dados reais do ciclo: fila pública, eventos registrados e vendas rastreáveis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: BarChart3, title: 'Fila única e pública', text: 'Todos os PROs seguem uma ordem cronológica verificável.' },
                { icon: Eye, title: 'Painel de transparência', text: 'Eventos do sistema ficam registrados e podem ser acompanhados.' },
                { icon: Recycle, title: 'Resíduo orgânico processado', text: 'O ciclo começa com resíduo real sendo transformado em adubo.' },
                { icon: ShieldCheck, title: 'Venda real e pagamento seguro', text: 'O sistema registra vendas e processa pagamentos via Mercado Pago.' },
              ].map((item, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center space-y-2">
              <Link to="/transparencia">
                <Button variant="hero" size="lg">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver painel público
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">Dados reais, abertos a todos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ E) METAS PÚBLICAS POR FASE ═══ */}
      <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10">
              Metas públicas do ciclo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-5 text-center">
                  <Recycle className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Resíduo orgânico desviado do descarte</h3>
                  <p className="text-sm text-muted-foreground">Fase 1: 1 tonelada • Próxima: 2 toneladas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <Leaf className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Adubo orgânico produzido</h3>
                  <p className="text-sm text-muted-foreground">Fase 1: 1 tonelada • Próxima: 2 toneladas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Carbono evitado (estimativa)</h3>
                  <p className="text-sm text-muted-foreground">Meta final (100 toneladas): 49 toneladas de CO₂ equivalente evitadas</p>
                  <Link to="/transparencia#como-calculamos" className="text-xs text-primary hover:underline mt-2 inline-block">
                    Como calculamos →
                  </Link>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-sm text-muted-foreground italic">
              Metas públicas. Dados públicos. Abertos a todos.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ I) FAQ CURTO ═══ */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Dúvidas rápidas
            </h2>

            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="q1" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">O que é PRO?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  PRO é o registro da sua participação no ciclo. 1 PRO = 100g de resíduo orgânico entrando no Processamento de Resíduo Orgânico.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">Isso é investimento?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Não. O Clube do Adubo é um sistema de economia circular com transparência pública. Você participa do ciclo e acompanha tudo no painel.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">Como funciona a distribuição do valor?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  O valor só existe quando há venda registrada do adubo. Quando isso acontece, o valor é distribuído pela regra pública do Clube (fila), e você acompanha no painel.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">Onde eu vejo os dados?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  No painel público: metas, eventos registrados, metodologia e transparência do ciclo. Tudo aberto para qualquer pessoa auditar.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="text-center mt-6">
              <Link to="/faq" className="text-sm text-primary hover:underline">
                Ver FAQ completo →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
