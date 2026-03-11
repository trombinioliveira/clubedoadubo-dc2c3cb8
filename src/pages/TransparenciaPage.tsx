import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, ArrowRight, Recycle, ListOrdered, Users, Ban, CheckCircle, BarChart3, ExternalLink } from 'lucide-react';
import { LeafIcon, CompostIcon, FertilizerIcon, MoneyIcon } from '@/components/icons/CycleIcons';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicKPIs } from '@/lib/publicTransparency';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function fmtKg(g: number) { const kg = g / 1000; return kg >= 1000 ? `${(kg/1000).toFixed(1)} t` : `${kg.toFixed(1)} kg`; }
function fmtBRL(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v); }

const TransparenciaPage = () => {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['public-kpis-transparencia'],
    queryFn: fetchPublicKPIs,
    staleTime: 120_000,
  });

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

  return (
    <>
      {/* KPIs Reais Block */}
      <section className="py-8 bg-primary/5 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Dados reais do ciclo
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Dados extraídos diretamente do banco do Clube do Adubo</p>
            </div>
            <Link to="/painel-publico">
              <Button size="sm" className="gap-1 text-xs">
                Ver Painel Completo <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          ) : kpis ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Resíduo coletado', value: fmtKg(kpis.weightCollectedGrams) },
                { label: 'PROs emitidos', value: kpis.totalPros.toLocaleString('pt-BR') },
                { label: 'Vendas registradas', value: fmtBRL(kpis.totalSalesAmount) },
                { label: 'Total pago', value: fmtBRL(kpis.totalDistributed) },
              ].map((item) => (
                <Card key={item.label} className="bg-background">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Hero */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Transparência
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como o Clube do Adubo funciona
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Sem promessas. Sem atalhos. Apenas economia circular real.
          </p>
        </div>
      </section>

      {/* Ciclo Visual */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">O Ciclo Completo</h2>
            <p className="text-muted-foreground">Cada etapa é rastreável e transparente</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: LeafIcon, title: 'Coleta', description: '100 g de resíduo orgânico = 1 PRO' },
                { icon: CompostIcon, title: 'Processamento', description: 'Compostagem natural' },
                { icon: FertilizerIcon, title: 'Produção', description: 'Adubo pronto' },
                { icon: MoneyIcon, title: 'Venda do adubo', description: 'R$ 2,00 para o PRO da vez' },
              ].map((step, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl earth-gradient flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-6 text-sm">O valor só se move quando o ciclo acontece.</p>
          </div>
        </div>
      </section>

      {/* Fila Única */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ListOrdered className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">A Fila Única e Global</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { title: 'Cronológica', text: 'Quem entra primeiro, recebe primeiro' },
                    { title: 'Transparente', text: 'Você vê sua posição real' },
                    { title: 'Imutável', text: 'Ninguém pode furar a fila' },
                  ].map((item) => (
                    <div key={item.title} className="text-center p-4 bg-background rounded-xl">
                      <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Ban className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-destructive mb-1">O que NÃO existe aqui</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Não há pagamento para acelerar a fila</li>
                        <li>• Não há hierarquias ou níveis de privilégio</li>
                        <li>• Não há promessas de prazo ou rendimento</li>
                        <li>• Não há ganho baseado na entrada de novos participantes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Fila x Ondas */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Fila ≠ Ondas</h2>
              <p className="text-muted-foreground">Dois conceitos diferentes, duas funções distintas</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/30">
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ListOrdered className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Fila FIFO (Pagamento)</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-3xl font-bold text-primary mb-2">= Dinheiro</p>
                  <p className="text-sm text-muted-foreground">Ordem de pagamento. Quem chegou primeiro, recebe primeiro.</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-accent/30">
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Ondas de Impacto (Engajamento)</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-3xl font-bold text-accent mb-2">= Impacto</p>
                  <p className="text-sm text-muted-foreground">Métricas de engajamento. Nunca alteram a ordem da fila.</p>
                </CardContent>
              </Card>
            </div>
            <p className="text-center mt-6 text-muted-foreground font-medium">
              As ondas medem seu impacto, mas nunca mudam a ordem de pagamento.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ F) COMO CALCULAMOS CO₂e ═══ */}
      <section id="como-calculamos" className="py-12 md:py-16 bg-muted/30 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
              Como calculamos o CO₂e (estimativa)
            </h2>

            <Card className="mb-8">
              <CardContent className="p-5 sm:p-6">
                <h3 className="font-semibold text-foreground mb-3">Leitura por extenso (estimativa)</h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                  <li>Para cada 1 tonelada de resíduo orgânico desviada do lixão e tratada por vermicompostagem, estimamos cerca de 0,49 tonelada de CO₂ equivalente evitada de ser emitida.</li>
                  <li>Na Fase 1 (1 tonelada), a meta estimada é 0,49 tonelada de CO₂ equivalente evitada.</li>
                  <li>Na Fase 2 (2 toneladas), a meta estimada é 0,98 tonelada de CO₂ equivalente evitada.</li>
                  <li>Na meta final (100 toneladas), estimamos 49 toneladas de CO₂ equivalente evitadas.</li>
                </ul>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="co2e-1" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">O que é CO₂ equivalente (CO₂e)?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  CO₂e é uma unidade que permite comparar o impacto climático de diferentes gases de efeito estufa. O metano (CH₄), por exemplo, tem potencial de aquecimento 28 vezes maior que o CO₂ em 100 anos (GWP100). Quando calculamos "CO₂ equivalente evitado", estamos dizendo quanto impacto climático foi prevenido ao desviar resíduos do lixão.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="co2e-2" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">Qual é a linha de base (lixão)?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  A linha de base assume que o resíduo orgânico seria destinado a um lixão a céu aberto, onde se decompõe em condições anaeróbicas e gera metano. Utilizamos o fator de correção de metano (MCF) de 0,4 conforme a metodologia IPCC default para lixões não gerenciados.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="co2e-3" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">Como o projeto reduz emissões (vermicompostagem)?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  A vermicompostagem é um processo aeróbico que evita a geração de metano. Utilizamos como proxy conservador os dados de "compostagem" do programa ProteGEEr, que estima um saldo líquido de aproximadamente 71 kg CO₂e/t de resíduo tratado. A vermicompostagem tende a ter emissões ainda menores, mas preferimos ser conservadores.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="co2e-4" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">Transporte entra no cálculo?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Sim. Incluímos um parâmetro de distância (D km) com fator de emissão por tonelada-km. O valor de D é parametrizável conforme a localidade do ponto de coleta. Quanto menor a distância, menor o impacto do transporte no resultado final.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="co2e-5" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">Quais parâmetros usamos?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Fator de emissão da linha de base (lixão): ~490 kg CO₂e/t de resíduo orgânico</li>
                    <li>Fator de emissão do projeto (compostagem/vermicompostagem): ~71 kg CO₂e/t</li>
                    <li>Saldo líquido estimado: ~419 kg CO₂e/t → arredondamos para 0,49 t CO₂e/t (conservador)</li>
                    <li>GWP100 do CH₄ = 28 (conforme ProteGEEr)</li>
                    <li>MCF do lixão = 0,4 (IPCC default)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="co2e-6" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">Isso serve para crédito de carbono?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Não atualmente. Estes cálculos são estimativas internas para transparência. No futuro, este histórico pode apoiar a estruturação de um projeto com auditoria certificada, mas hoje o Clube do Adubo não emite nem negocia créditos de carbono.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="co2e-7" className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium">Detalhes técnicos e fontes</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>Linha de base: lixão (MCF=0,4) com método IPCC default para CH₄ de resíduos orgânicos.</p>
                  <p>Conversão CH₄ → CO₂e usando GWP100 = 28 (conforme ProteGEEr).</p>
                  <p>Projeto: vermicompostagem estimada de forma conservadora usando proxy de "compostagem" do ProteGEEr (saldo líquido ~71 kg CO₂e/t).</p>
                  <p>Transporte incluído como parâmetro de distância (D km) com fator por t-km; D é parametrizável por ponto de coleta.</p>
                  <p className="italic">Valores variam por cidade/composição do resíduo. Parâmetros serão publicados no painel conforme evolução do projeto.</p>
                  <p className="font-medium">Fontes: IPCC Guidelines for National Greenhouse Gas Inventories (2006, 2019 refinement); Programa ProteGEEr (MMA/Brasil).</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Frase-Âncora */}
      <section className="py-10 md:py-14 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg md:text-xl font-bold text-foreground leading-relaxed">
              Aqui o resíduo não é tratado.<br />
              <span className="text-primary">Ele é processado, transformado e reinserido no ciclo.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Compromisso */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Recycle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Nosso compromisso</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            O Clube do Adubo existe para transformar resíduo em valor de forma justa,
            transparente e sustentável. Não fazemos promessas que não podemos cumprir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/faq">
              <Button variant="secondary" size="lg">Ver perguntas frequentes</Button>
            </Link>
            <Link to="/planos">
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Participar do ciclo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default TransparenciaPage;
