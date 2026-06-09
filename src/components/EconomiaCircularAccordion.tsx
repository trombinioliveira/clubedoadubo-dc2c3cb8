import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sprout, Recycle, MapPin, ExternalLink } from 'lucide-react';

const EconomiaCircularAccordion = () => {
  return (
    <div className="p-5 sm:p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-medium mb-3">
          <Recycle className="w-3.5 h-3.5" />
          Conceito e território
        </div>
        <h2 className="text-2xl font-extrabold text-foreground leading-tight">
          O que é economia circular?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Um jeito mais inteligente de lidar com o que a cidade descarta — transformando resíduos
          orgânicos em adubo, valor e impacto real.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {/* 1 — Do descarte ao retorno */}
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-left text-sm font-bold">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">1</span>
              Do descarte ao retorno
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground mb-4">
              Existe uma diferença fundamental entre jogar fora e devolver ao ciclo.
            </p>
            <div className="space-y-3">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">
                    Modelo linear
                  </p>
                  <div className="flex items-center gap-2 text-foreground font-medium text-sm mb-2">
                    <span>Extrair</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span>Consumir</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span>Descartar</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    O material orgânico vai para o lixo, perde seu potencial e se torna problema
                    ambiental. Fim da linha.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                    Modelo circular
                  </p>
                  <div className="flex items-center gap-2 text-foreground font-medium text-sm mb-2">
                    <span>Transformar</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span>Reaproveitar</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span>Devolver</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    O resíduo orgânico volta ao solo como adubo, gera valor local e alimenta um novo
                    ciclo. Começo de outro.
                  </p>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2 — Por que o resíduo orgânico importa */}
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-left text-sm font-bold">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">2</span>
              Por que o resíduo orgânico importa
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Restos de alimentos, cascas, podas de jardim, borra de café — tudo isso faz parte do
                dia a dia de qualquer casa, restaurante ou comércio. É o tipo de material mais comum
                no lixo urbano brasileiro.
              </p>
              <p>
                Quando esse material vai para aterros ou lixões, ele se decompõe sem oxigênio, gera
                gases de efeito estufa e contamina o solo e a água. O que poderia voltar à terra como
                nutriente acaba virando problema.
              </p>
              <p>
                O desperdício não é só ambiental — é econômico. Cada quilo de orgânico descartado sem
                aproveitamento é uma oportunidade perdida de gerar adubo, devolver vida ao solo e
                criar valor para a comunidade.
              </p>
              <p className="font-medium text-foreground">
                Não é detalhe. É um dos maiores desafios urbanos do país — e também uma das soluções
                mais acessíveis.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3 — Do Brasil ao nosso território */}
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-left text-sm font-bold">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">3</span>
              Do Brasil ao nosso território
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-5">
              {[
                {
                  Icon: MapPin,
                  title: 'Brasil',
                  desc: 'O país gera mais de 80 milhões de toneladas de resíduos sólidos por ano. Mais da metade é orgânico. A maior parte vai para aterros sem nenhum reaproveitamento.',
                },
                {
                  Icon: MapPin,
                  title: 'São Paulo',
                  desc: 'O maior estado do país concentra uma das maiores produções de resíduo orgânico urbano. No litoral, a sazonalidade do turismo intensifica o volume de descarte em épocas específicas do ano.',
                },
                {
                  Icon: MapPin,
                  title: 'Litoral Norte de São Paulo',
                  desc: 'São Sebastião, com praias como Camburi, Juquehy e Boiçucanga, enfrenta um desafio real: o resíduo orgânico local precisa de destino inteligente. É aqui que a economia circular ganha forma concreta.',
                },
                {
                  Icon: Sprout,
                  title: 'Camburi — onde tudo começa',
                  desc: 'O Clube do Adubo nasce em Camburi, no Litoral Norte de São Paulo, como uma resposta prática ao problema do resíduo orgânico. Uma operação local, rastreável e conectada ao território.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4 — Como o Clube do Adubo responde */}
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-left text-sm font-bold">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">4</span>
              Como o Clube do Adubo responde
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {[
                { emoji: '🌿', title: 'Coleta do resíduo', desc: 'O material orgânico nos pontos de coleta parceiros no território é coletado pelo Clube do Adubo.' },
                { emoji: '🏭', title: 'Compostagem', desc: 'O resíduo passa por processamento biológico controlado em lotes rastreáveis.' },
                { emoji: '🌾', title: 'Produção de adubo', desc: 'O composto orgânico vira húmus de minhoca: um adubo orgânico de altíssima qualidade, considerado o resultado final da digestão de restos vegetais e animais pelas minhocas pronto para uso no solo e na agricultura.' },
                { emoji: '💲', title: 'Venda e recompensa', desc: 'O adubo é vendido e o valor gerado retorna ao ciclo, beneficiando quem participa.' },
              ].map((step, i, arr) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Card className="w-full border-border/50">
                    <CardContent className="flex items-start gap-3 p-4">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-sm mb-1">
                          <span className="mr-1">{step.emoji}</span>
                          {step.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                  {i < arr.length - 1 && (
                    <ArrowRight className="h-5 w-5 rotate-90 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5 — O que já está acontecendo */}
        <AccordionItem value="item-5">
          <AccordionTrigger className="text-left text-sm font-bold">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">5</span>
              O que já está acontecendo
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                O Clube do Adubo não é só uma ideia. O ciclo já está sendo estruturado e apresentado
                publicamente com dados reais.
              </p>
              <p>
                Existe um painel público onde qualquer pessoa pode acompanhar pesagens, vendas,
                distribuições e o andamento da fila. Existe uma lógica aberta de acompanhamento — e
                ela funciona.
              </p>
              <p>
                O resíduo orgânico já é recebido, pesado, processado e acompanhado dentro do sistema.
                Cada etapa é registrada. Cada participação é rastreável.
              </p>
              <p className="font-medium text-foreground">
                Não estamos falando de futuro distante. Estamos falando de uma operação viva, que
                cresce com o território.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 6 — Como esse ciclo pode se espalhar */}
        <AccordionItem value="item-6">
          <AccordionTrigger className="text-left text-sm font-bold">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">6</span>
              Como esse ciclo pode se espalhar
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {[
                { icon: '🏪', text: 'Mais pontos parceiros recebendo resíduo orgânico ao longo do litoral' },
                { icon: '🏡', text: 'Coleta domiciliar de resíduos orgânicos e podas em casas e condomínios' },
                { icon: '🌱', text: 'Adubação residencial e comercial com adubo produzido localmente' },
                { icon: '🤝', text: 'Fortalecimento de uma economia circular local que gera valor no próprio território' },
                { icon: '🌊', text: 'Cada pessoa que participa amplia a onda de impacto — do resíduo ao solo, do solo à comunidade' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50">
                  <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 7 — Como o ciclo funciona na prática */}
        <AccordionItem value="item-7">
          <AccordionTrigger className="text-left text-sm font-bold">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">7</span>
              Como o ciclo funciona na prática
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-foreground">
              <span className="bg-primary/10 px-3 py-1.5 rounded-lg">Resíduo orgânico real</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="bg-primary/10 px-3 py-1.5 rounded-lg">Compostagem</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="bg-primary/10 px-3 py-1.5 rounded-lg">Adubo natural</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="bg-primary/10 px-3 py-1.5 rounded-lg">Venda</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="bg-secondary/15 px-3 py-1.5 rounded-lg">Retorno ao ciclo</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 8 — Fontes consultadas */}
        <AccordionItem value="item-8">
          <AccordionTrigger className="text-left text-sm font-bold">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">8</span>
              Fontes consultadas
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 text-xs text-muted-foreground/80">
              <li className="flex items-start gap-2">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  <a href="https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12305.htm" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                    Lei nº 12.305/2010
                  </a>{' '}
                  — Política Nacional de Resíduos Sólidos (PNRS)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  <a href="https://www.gov.br/mma/pt-br" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                    Ministério do Meio Ambiente
                  </a>{' '}
                  — Dados sobre resíduos sólidos e economia circular no Brasil
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  <a href="https://cetesb.sp.gov.br/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                    CETESB
                  </a>{' '}
                  — Companhia Ambiental do Estado de São Paulo
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>ABRELPE — Panorama dos Resíduos Sólidos no Brasil (relatórios anuais)</span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>Ellen MacArthur Foundation — Referência global em economia circular</span>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* CTA */}
      <div className="mt-6 rounded-2xl bg-primary p-5 text-center text-primary-foreground">
        <h3 className="text-base font-bold mb-2">Aqui você entendeu o contexto</h3>
        <p className="text-primary-foreground/80 text-sm mb-4 leading-relaxed">
          No painel público, você acompanha o ciclo em andamento com dados reais. E, se quiser
          participar, pode conhecer as formas de entrada no sistema.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/painel-publico#inicio">
            <Button variant="secondary" className="gap-2 w-full">
              <Sprout className="w-4 h-4" />
              Ver o painel público
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/planos#inicio">
            <Button variant="outline" className="gap-2 w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Conhecer os planos
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EconomiaCircularAccordion;
