import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowRight, Recycle, ListOrdered, CheckCircle, ExternalLink, Sprout, Users, Globe, Waves, Leaf } from 'lucide-react';
import { LeafIcon, CompostIcon, FertilizerIcon, MoneyIcon } from '@/components/icons/CycleIcons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { fetchPublicKPIs } from '@/lib/publicTransparency';

function fmtKg(grams: number) {
  const kg = grams / 1000;
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toFixed(1)} kg`;
}

const TransparenciaPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [hash]);

  const { data: kpis } = useQuery({
    queryKey: ['public-kpis-transparencia'],
    queryFn: fetchPublicKPIs,
    staleTime: 120_000,
  });

  return (
    <>
      <Helmet>
        <title>Transparência — Como o Clube do Adubo Funciona</title>
        <meta name="description" content="Entenda como funciona o ciclo do Clube do Adubo: da coleta ao retorno, com fila pública, dados reais e economia circular." />
        <link rel="canonical" href="https://clubedoadubo.com.br/transparencia" />
        <meta property="og:title" content="Transparência — Como o Clube do Adubo Funciona" />
        <meta property="og:description" content="Entenda como funciona o ciclo do Clube do Adubo: da coleta ao retorno." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-primary/8 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Transparência
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como o Clube do Adubo funciona
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-8">
            Sem promessas. Sem atalhos. Apenas economia circular real, com dados abertos e fila pública.
          </p>
          <Link to="/painel-publico#inicio">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Ver dados ao vivo no Painel Público
            </Button>
          </Link>
        </div>
      </section>

      {/* O Ciclo Completo */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">O Ciclo Completo</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              O resíduo orgânico é coletado, transformado em adubo e vendido. Cada venda devolve valor para quem participou, na ordem em que entrou.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: LeafIcon, title: 'Coleta', description: 'O resíduo orgânico é recebido em pontos de coleta reais.' },
                { icon: CompostIcon, title: 'Transformação', description: 'O material passa por compostagem ou vermicompostagem natural.' },
                { icon: FertilizerIcon, title: 'Produção', description: 'O adubo é produzido, embalado e preparado para venda.' },
                { icon: MoneyIcon, title: 'Retorno', description: 'Cada venda de adubo paga quem está na vez na fila.' },
              ].map((step, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-4 md:p-5">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl earth-gradient flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1 text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-6 text-sm">
              O valor só se move quando o ciclo acontece. Sem venda real, não há pagamento.
            </p>
          </div>
        </div>
      </section>

      {/* A Fila — Como funciona */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ListOrdered className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">A Fila do Ciclo</CardTitle>
                <p className="text-muted-foreground text-sm mt-2">
                  Cada participação entra na fila na ordem em que chegou. Quando uma venda acontece, quem está na frente recebe primeiro.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { title: 'Ordem de chegada', text: 'Quem entrou primeiro, recebe primeiro.' },
                    { title: 'Visível para todos', text: 'Qualquer pessoa pode consultar a fila.' },
                    { title: 'Sem exceções', text: 'Ninguém pode alterar a ordem.' },
                  ].map((item) => (
                    <div key={item.title} className="text-center p-4 bg-background rounded-xl">
                      <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h4 className="font-bold mb-1 text-sm">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2">
                  <Link to="/painel-publico/fila">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ListOrdered className="w-3.5 h-3.5" />
                      Consultar a fila pública do ciclo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ramificações e Expansão */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sprout className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                O ciclo pode crescer
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                A economia circular do Clube do Adubo não depende de um único ponto. Ela foi pensada para ganhar novas ramificações — e cada participação ajuda nesse processo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: Globe,
                  title: 'Novos territórios',
                  text: 'Cada novo ponto de coleta fortalece o ciclo e leva a transformação para mais lugares.',
                },
                {
                  icon: Users,
                  title: 'Mais participantes',
                  text: 'Quando mais pessoas entram, o ciclo ganha força, e a economia circular se expande.',
                },
                {
                  icon: Waves,
                  title: 'Sua onda de impacto',
                  text: 'Cada participação gera uma reverberação — no resíduo transformado, no adubo devolvido, nas pessoas alcançadas.',
                },
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="p-5 text-center">
                    <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h4 className="font-bold text-sm mb-2">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center text-muted-foreground mt-6 text-sm max-w-lg mx-auto">
              Hoje, a operação viva acontece em Camburi, no litoral norte de São Paulo. Mas a estrutura foi feita para ir além — levando o ciclo para novas comunidades e regiões.
            </p>
          </div>
        </div>
      </section>

      {/* Impacto ambiental — CO₂e conectado ao ciclo */}
      <section id="como-calculamos" className="py-12 md:py-16 bg-muted/30 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Leaf className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Impacto ambiental do ciclo
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Quando resíduos orgânicos deixam de ir para o lixão e viram adubo, o impacto no clima é real e mensurável.
              </p>
            </div>

            {/* Resumo conectado aos dados reais */}
            {kpis && kpis.weightCollectedGrams > 0 && (
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Com base nos resíduos já processados pelo sistema:</p>
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{fmtKg(kpis.weightCollectedGrams)}</p>
                      <p className="text-xs text-muted-foreground">de resíduos desviados do lixão</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ~{((kpis.weightCollectedGrams / 1000) * 0.49).toFixed(1)} kg
                      </p>
                      <p className="text-xs text-muted-foreground">de CO₂e estimado evitado</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3">
                    Estimativa conservadora: 0,49 t de CO₂e evitado por tonelada de resíduo processado via compostagem.
                  </p>
                </CardContent>
              </Card>
            )}

            <h3 className="font-bold text-foreground text-sm mb-3">Perguntas frequentes sobre o cálculo</h3>

            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="co2e-1" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium">O que é CO₂ equivalente (CO₂e)?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  CO₂e é uma unidade que permite comparar o impacto climático de diferentes gases. O metano (CH₄), por exemplo, aquece 28 vezes mais que o CO₂ em 100 anos. Quando dizemos "CO₂ equivalente evitado", estamos mostrando quanto impacto climático foi prevenido ao desviar resíduos do lixão.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="co2e-2" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium">De onde vêm os parâmetros?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p>Usamos dados do IPCC (Painel Intergovernamental sobre Mudanças Climáticas) e do ProteGEEr (programa do Ministério do Meio Ambiente do Brasil).</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Emissão evitada do lixão: ~490 kg CO₂e/t de resíduo orgânico</li>
                    <li>Emissão do projeto (compostagem): ~71 kg CO₂e/t</li>
                    <li>Saldo líquido estimado: ~0,49 t CO₂e por tonelada processada</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="co2e-3" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium">Isso gera crédito de carbono?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Não atualmente. Estes cálculos são estimativas para transparência. O Clube do Adubo não emite nem negocia créditos de carbono hoje.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="co2e-4" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium">Por que "estimativa"?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Os valores reais variam conforme composição do resíduo, distância de transporte e condições locais. Preferimos ser conservadores e transparentes sobre o que sabemos e o que estimamos.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Frase-âncora */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg md:text-xl font-bold text-foreground leading-relaxed">
              Aqui o resíduo não é descartado.<br />
              <span className="text-primary">Ele é transformado, devolvido ao ciclo e gera valor real.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Navegação e CTAs finais */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Recycle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Aqui você entendeu como funciona</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Agora você pode acompanhar o ciclo ao vivo no Painel Público, ou dar o próximo passo e participar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/painel-publico#inicio">
              <Button variant="secondary" size="lg" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Ver o Painel Público
              </Button>
            </Link>
            <Link to="/planos#inicio">
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary gap-2">
                Participar do ciclo <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default TransparenciaPage;