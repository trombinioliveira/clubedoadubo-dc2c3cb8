import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, Sprout, Recycle, MapPin, ExternalLink } from 'lucide-react';
import economiaCircularFluxograma from '@/assets/economia-circular-fluxograma.png';

const EconomiaCircularPage = () => {
  return (
    <>
      <Helmet>
        <title>O que é economia circular | Clube do Adubo</title>
        <meta
          name="description"
          content="Entenda o que é economia circular, por que o resíduo orgânico importa e como o Clube do Adubo transforma esse problema em solução prática no Litoral Norte de São Paulo."
        />
      </Helmet>

      <div className="min-h-screen bg-background">

        {/* ================================================
            BLOCO 1 — HERO
        ================================================ */}
        <section className="py-16 sm:py-20 md:py-28 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium mb-6">
                <Recycle className="w-4 h-4" />
                Conceito e território
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
                O que é economia circular?
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Um jeito mais inteligente de lidar com o que a cidade descarta — transformando resíduos orgânicos em adubo, valor e impacto real para o solo, as pessoas e o território.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================
            BLOCO 2 — DO DESCARTE AO RETORNO
        ================================================ */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
                Do descarte ao retorno
              </h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                Existe uma diferença fundamental entre jogar fora e devolver ao ciclo.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Linear */}
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-6 sm:p-8">
                    <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-3">Modelo linear</p>
                    <div className="flex items-center gap-3 text-foreground font-medium text-sm sm:text-base mb-4">
                      <span>Extrair</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>Consumir</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>Descartar</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      O material orgânico vai para o lixo, perde seu potencial e se torna problema ambiental. Fim da linha.
                    </p>
                  </CardContent>
                </Card>

                {/* Circular */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-6 sm:p-8">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Modelo circular</p>
                    <div className="flex items-center gap-3 text-foreground font-medium text-sm sm:text-base mb-4">
                      <span>Transformar</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>Reaproveitar</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>Devolver</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      O resíduo orgânico volta ao solo como adubo, gera valor local e alimenta um novo ciclo. Começo de outro.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            BLOCO 3 — POR QUE O RESÍDUO ORGÂNICO IMPORTA
        ================================================ */}
        <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
                Por que o resíduo orgânico importa
              </h2>
              <div className="space-y-5 text-muted-foreground text-base sm:text-lg leading-relaxed">
                <p>
                  Restos de alimentos, cascas, podas de jardim, borra de café — tudo isso faz parte do dia a dia de qualquer casa, restaurante ou comércio. É o tipo de material mais comum no lixo urbano brasileiro.
                </p>
                <p>
                  Quando esse material vai para aterros ou lixões, ele se decompõe sem oxigênio, gera gases de efeito estufa e contamina o solo e a água. O que poderia voltar à terra como nutriente acaba virando problema.
                </p>
                <p>
                  O desperdício não é só ambiental — é econômico. Cada quilo de orgânico descartado sem aproveitamento é uma oportunidade perdida de gerar adubo, devolver vida ao solo e criar valor para a comunidade.
                </p>
                <p className="font-medium text-foreground">
                  Não é detalhe. É um dos maiores desafios urbanos do país — e também uma das soluções mais acessíveis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            BLOCO 4 — DO BRASIL AO NOSSO TERRITÓRIO
        ================================================ */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
                Do Brasil ao nosso território
              </h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                O problema é nacional, mas a resposta pode — e deve — ser local.
              </p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Brasil</h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      O país gera mais de 80 milhões de toneladas de resíduos sólidos por ano. Mais da metade é orgânico. A maior parte vai para aterros sem nenhum reaproveitamento.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">São Paulo</h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      O maior estado do país concentra uma das maiores produções de resíduo orgânico urbano. No litoral, a sazonalidade do turismo intensifica o volume de descarte em épocas específicas do ano.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Litoral Norte de São Paulo</h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      São Sebastião, com praias como Camburi, Juquehy e Boiçucanga, enfrenta um desafio real: o resíduo orgânico local precisa de destino inteligente. É aqui que a economia circular ganha forma concreta.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sprout className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Camburi — onde tudo começa</h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      O Clube do Adubo nasce em Camburi, no Litoral Norte de São Paulo, como uma resposta prática ao problema do resíduo orgânico. Uma operação local, rastreável e conectada ao território.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            BLOCO 5 — COMO O CLUBE DO ADUBO RESPONDE
        ================================================ */}
        <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
                Como o Clube do Adubo responde
              </h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                O resíduo orgânico entra no ciclo e percorre um caminho real até virar adubo natural.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { emoji: '🌿', title: 'Coleta do resíduo', desc: 'O material orgânico é recebido nos pontos de coleta parceiros no território.' },
                  { emoji: '🏭', title: 'Compostagem', desc: 'O resíduo passa por processamento biológico controlado em lotes rastreáveis.' },
                  { emoji: '🌾', title: 'Produção de adubo', desc: 'O composto orgânico vira adubo natural pronto para uso no solo e na agricultura.' },
                  { emoji: '📦', title: 'Venda e retorno', desc: 'O adubo é vendido e o valor gerado retorna ao ciclo, beneficiando quem participa.' },
                ].map((step, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-5 sm:p-6">
                      <span className="text-2xl mb-3 block">{step.emoji}</span>
                      <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
                O Clube do Adubo conecta participação, acompanhamento público e construção de valor local — tudo dentro de um ciclo que pode ser acompanhado abertamente.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================
            BLOCO 6 — O QUE JÁ ESTÁ ACONTECENDO
        ================================================ */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
                O que já está acontecendo
              </h2>

              <div className="space-y-5 text-muted-foreground text-base sm:text-lg leading-relaxed">
                <p>
                  O Clube do Adubo não é só uma ideia. O ciclo já está sendo estruturado e apresentado publicamente com dados reais.
                </p>
                <p>
                  Existe um painel público onde qualquer pessoa pode acompanhar pesagens, vendas, distribuições e o andamento da fila. Existe uma lógica aberta de acompanhamento — e ela funciona.
                </p>
                <p>
                  O resíduo orgânico já é recebido, pesado, processado e acompanhado dentro do sistema. Cada etapa é registrada. Cada participação é rastreável.
                </p>
                <p className="font-medium text-foreground">
                  Não estamos falando de futuro distante. Estamos falando de uma operação viva, que cresce com o território.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            BLOCO 7 — COMO ESSE CICLO PODE SE ESPALHAR
        ================================================ */}
        <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
                Como esse ciclo pode se espalhar
              </h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                O modelo nasceu local, mas foi pensado para crescer com o território.
              </p>

              <div className="space-y-4">
                {[
                  { icon: '🏪', text: 'Mais pontos parceiros recebendo resíduo orgânico ao longo do litoral' },
                  { icon: '🏡', text: 'Coleta domiciliar de resíduos orgânicos e podas em casas e condomínios' },
                  { icon: '🌱', text: 'Adubação residencial e comercial com adubo produzido localmente' },
                  { icon: '🤝', text: 'Fortalecimento de uma economia circular local que gera valor no próprio território' },
                  { icon: '🌊', text: 'Cada pessoa que participa amplia a onda de impacto — do resíduo ao solo, do solo à comunidade' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto italic">
                O objetivo não é crescer rápido. É crescer junto com o território, de forma real e sustentável.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================
            BLOCO 8 — COMO ESSE CICLO FUNCIONA NA PRÁTICA
        ================================================ */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
                Como o ciclo funciona na prática
              </h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                O caminho do resíduo ao retorno, resumido visualmente.
              </p>

              {/* Fluxograma reaproveitado */}
              <div className="mb-8">
                <img
                  src={economiaCircularFluxograma}
                  alt="Fluxograma do ciclo da economia circular do Clube do Adubo — do resíduo orgânico ao adubo natural, da venda ao retorno de valor"
                  className="w-full max-w-3xl mx-auto rounded-xl shadow-elevated"
                  loading="lazy"
                />
              </div>

              {/* Resumo humanizado do fluxo */}
              <div className="max-w-2xl mx-auto">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-medium text-foreground">
                  <span className="bg-primary/10 px-3 py-1.5 rounded-lg">Resíduo orgânico real</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="bg-primary/10 px-3 py-1.5 rounded-lg">Compostagem</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="bg-primary/10 px-3 py-1.5 rounded-lg">Adubo natural</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="bg-primary/10 px-3 py-1.5 rounded-lg">Venda</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="bg-secondary/15 px-3 py-1.5 rounded-lg">Retorno ao ciclo</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            BLOCO 9 — PONTE PARA APROFUNDAMENTO
        ================================================ */}
        <section className="py-12 sm:py-16 md:py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                Aqui você entendeu o contexto
              </h2>
              <p className="text-primary-foreground/80 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                No painel público, você acompanha o ciclo em andamento com dados reais. E, se quiser participar, pode conhecer as formas de entrada no sistema.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/painel-publico#inicio">
                  <Button variant="secondary" size="lg" className="gap-2 w-full sm:w-auto">
                    <Sprout className="w-5 h-5" />
                    Ver o painel público
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/planos#inicio">
                  <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Conhecer os planos
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            BLOCO 10 — REFERÊNCIAS / FONTES CONSULTADAS
        ================================================ */}
        <section className="py-10 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Fontes consultadas
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground/80">
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
                    — Companhia Ambiental do Estado de São Paulo — gestão de resíduos em São Paulo
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    ABRELPE — Panorama dos Resíduos Sólidos no Brasil (relatórios anuais)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Ellen MacArthur Foundation — Referência global em economia circular
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default EconomiaCircularPage;
