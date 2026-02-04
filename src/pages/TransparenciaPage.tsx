import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowRight, Recycle, ListOrdered, Users, Ban, CheckCircle } from 'lucide-react';
import { LeafIcon, CompostIcon, FertilizerIcon, MoneyIcon } from '@/components/icons/CycleIcons';

const TransparenciaPage = () => {
  return (
    <>
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              O Ciclo Completo
            </h2>
            <p className="text-muted-foreground">
              Cada etapa é rastreável e transparente
            </p>
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

            <p className="text-center text-muted-foreground mt-6 text-sm">
              O valor só se move quando o ciclo acontece.
            </p>
          </div>
        </div>
      </section>

      {/* A Fila Única */}
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
                  <div className="text-center p-4 bg-background rounded-xl">
                    <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-bold mb-1">Cronológica</h4>
                    <p className="text-sm text-muted-foreground">Quem entra primeiro, recebe primeiro</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-xl">
                    <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-bold mb-1">Transparente</h4>
                    <p className="text-sm text-muted-foreground">Você vê sua posição real</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-xl">
                    <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-bold mb-1">Imutável</h4>
                    <p className="text-sm text-muted-foreground">Ninguém pode furar a fila</p>
                  </div>
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
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Fila ≠ Ondas
              </h2>
              <p className="text-muted-foreground">
                Dois conceitos diferentes, duas funções distintas
              </p>
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
                  <p className="text-sm text-muted-foreground">
                    Ordem de pagamento. Quem chegou primeiro, recebe primeiro.
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Métricas de engajamento. Nunca alteram a ordem da fila.
                  </p>
                </CardContent>
              </Card>
            </div>

            <p className="text-center mt-6 text-muted-foreground font-medium">
              As ondas medem seu impacto, mas nunca mudam a ordem de pagamento.
            </p>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Nosso compromisso
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            O Clube do Adubo existe para transformar resíduo em valor de forma justa, 
            transparente e sustentável. Não fazemos promessas que não podemos cumprir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/faq">
              <Button variant="secondary" size="lg">
                Ver perguntas frequentes
              </Button>
            </Link>
            <Link to="/planos">
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Participar do ciclo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default TransparenciaPage;
