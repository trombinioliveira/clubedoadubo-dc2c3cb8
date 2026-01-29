import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  Droplets, 
  Recycle, 
  TreeDeciduous, 
  Sprout, 
  TreePine,
  Gift,
  Star,
  ArrowRight,
  Check
} from 'lucide-react';

interface PricingSectionProps {
  onGetStarted: () => void;
}

export const PricingSection = ({ onGetStarted }: PricingSectionProps) => {
  return (
    <section className="py-16 md:py-24 bg-muted/30" id="planos">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Leaf className="w-4 h-4 mr-2" />
            Nossos Planos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha como participar do ciclo
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compre avulso ou assine para impacto contínuo. Cada PRO representa 100g de resíduo transformado.
          </p>
        </div>

        {/* Compra Avulsa */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl earth-gradient flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Compra Avulsa</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Adubos */}
            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Adubo Granulado</CardTitle>
                </div>
                <CardDescription>Fertilizante sólido para hortas e jardins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-foreground">R$ 15</span>
                  <span className="text-muted-foreground">/ 0,5 kg</span>
                </div>
                <Button onClick={onGetStarted} className="w-full" variant="outline">
                  Comprar
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Adubo Líquido</CardTitle>
                </div>
                <CardDescription>Concentrado para aplicação foliar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-foreground">R$ 10</span>
                  <span className="text-muted-foreground">/ 500 ml</span>
                </div>
                <Button onClick={onGetStarted} className="w-full" variant="outline">
                  Comprar
                </Button>
              </CardContent>
            </Card>

            {/* PRO Avulso */}
            <Card className="border-primary/50 hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Recycle className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">PRO Avulso</CardTitle>
                  <Badge variant="secondary" className="ml-auto">Popular</Badge>
                </div>
                <CardDescription>Processamento de Resíduo Orgânico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-foreground">R$ 1</span>
                  <span className="text-muted-foreground">/ PRO (100g)</span>
                </div>
                <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Compra livre (qualquer quantidade)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Ativação individual e rastreável
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Participa da fila FIFO global
                  </li>
                </ul>
                <Button onClick={onGetStarted} className="w-full">
                  Ativar PROs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assinaturas */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl warmth-gradient flex items-center justify-center">
              <Recycle className="w-5 h-5 text-secondary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Assinaturas</h3>
            <Badge className="bg-accent text-accent-foreground">Impacto Recorrente</Badge>
          </div>

          {/* Assinatura de PROs */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              Assinatura de PROs
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Semente', pros: 10, price: 10, icon: Sprout },
                { name: 'Muda', pros: 25, price: 25, icon: Leaf },
                { name: 'Árvore', pros: 50, price: 50, icon: TreeDeciduous },
                { name: 'Livre', pros: null, price: null, icon: Star },
              ].map((plan) => (
                <Card key={plan.name} className="hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <plan.icon className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">Plano {plan.name}</span>
                    </div>
                    {plan.price ? (
                      <>
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-2xl font-bold text-foreground">R$ {plan.price}</span>
                          <span className="text-muted-foreground text-sm">/mês</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.pros} PROs mensais</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-semibold text-foreground mb-2">Você escolhe</p>
                        <p className="text-sm text-muted-foreground">Valor definido por você</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Assinatura de Adubos */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              Assinatura de Adubos
              <span className="text-sm font-normal text-muted-foreground">— Entrega recorrente em casa</span>
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:shadow-elevated transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Granulado Mensal</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-foreground">R$ 15</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  <p className="text-sm text-muted-foreground">0,5 kg de adubo granulado</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elevated transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Líquido Mensal</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-foreground">R$ 10</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  <p className="text-sm text-muted-foreground">500 ml de adubo líquido</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elevated transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-foreground">Combo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Combine granulado + líquido</p>
                  <p className="text-xs text-muted-foreground">Personalize sua entrega mensal</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Planos Combinados - Destaque */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
              <Recycle className="w-5 h-5 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Fechar o Ciclo</h3>
            <Badge className="bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              Recomendado
            </Badge>
          </div>
          
          <p className="text-muted-foreground mb-8 max-w-2xl">
            O modelo-chave do Clube do Adubo: adubo + PROs no mesmo plano. Participe do ciclo completo.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                name: 'Semente', 
                pros: 10, 
                adubos: 1, 
                price: 25, 
                icon: Sprout,
                color: 'border-primary/30'
              },
              { 
                name: 'Muda', 
                pros: 25, 
                adubos: 2, 
                price: 50, 
                icon: TreeDeciduous,
                color: 'border-primary',
                featured: true
              },
              { 
                name: 'Árvore', 
                pros: 50, 
                adubos: 3, 
                price: 90, 
                icon: TreePine,
                color: 'border-primary/30'
              },
            ].map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden hover:shadow-elevated transition-all duration-300 ${plan.color} ${plan.featured ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.featured && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Mais Popular
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${plan.featured ? 'earth-gradient' : 'bg-muted'} flex items-center justify-center`}>
                      <plan.icon className={`w-6 h-6 ${plan.featured ? 'text-primary-foreground' : 'text-primary'}`} />
                    </div>
                    <div>
                      <CardTitle>Fechar o Ciclo – {plan.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-foreground">R$ {plan.price}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="font-medium">{plan.pros} PROs</span>
                      <span className="text-muted-foreground text-sm">por mês</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="font-medium">{plan.adubos} adubo{plan.adubos > 1 ? 's' : ''}</span>
                      <span className="text-muted-foreground text-sm">(granulado ou líquido)</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-5 h-5 text-primary" />
                      <span>Participação na fila FIFO</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-5 h-5 text-primary" />
                      <span>Rastreabilidade completa</span>
                    </li>
                  </ul>

                  <Button 
                    onClick={onGetStarted} 
                    className="w-full" 
                    variant={plan.featured ? 'default' : 'outline'}
                  >
                    Assinar agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Kits */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Gift className="w-5 h-5 text-secondary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Kits</h3>
            <Badge variant="outline">Compra Única</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Kit Iniciante</CardTitle>
                    <CardDescription>Perfeito para começar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    2× Adubo Granulado (0,5 kg cada)
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    1× Adubo Líquido (500 ml)
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    10 PROs inclusos
                  </li>
                </ul>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">R$ 50</span>
                  </div>
                  <Button onClick={onGetStarted} variant="outline">
                    Comprar Kit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-elevated transition-all duration-300 border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl earth-gradient flex items-center justify-center">
                    <TreePine className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Kit Jardim Completo</CardTitle>
                    <CardDescription>Para quem quer ir além</CardDescription>
                  </div>
                  <Badge className="ml-auto bg-accent text-accent-foreground">Melhor Valor</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    5× Adubo Granulado (0,5 kg cada)
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    3× Adubo Líquido (500 ml cada)
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    30 PROs inclusos
                  </li>
                </ul>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">R$ 130</span>
                  </div>
                  <Button onClick={onGetStarted}>
                    Comprar Kit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
