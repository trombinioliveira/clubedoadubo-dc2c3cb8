import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Recycle, Package, Gift, ArrowRight, Check, Droplets, TreeDeciduous, Sprout, TreePine, Star } from 'lucide-react';

interface PricingSectionProps {
  onGetStarted: () => void;
}

type PlanCategory = 'avulsa' | 'assinatura' | 'ciclo' | 'kits';

export const PricingSection = ({ onGetStarted }: PricingSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<PlanCategory>('avulsa');

  const categories: { id: PlanCategory; label: string; icon: React.ElementType }[] = [
    { id: 'avulsa', label: 'Compra Avulsa', icon: Package },
    { id: 'assinatura', label: 'Assinaturas', icon: Recycle },
    { id: 'ciclo', label: 'Fechar o Ciclo', icon: Leaf },
    { id: 'kits', label: 'Kits', icon: Gift },
  ];

  return (
    <section id="planos" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4">
            <Leaf className="w-3 h-3 mr-1" />
            Planos e Produtos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha como participar do ciclo
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            De compras avulsas a assinaturas completas, encontre a melhor forma de transformar resíduo em valor
          </p>
        </div>

        {/* Category Toggle Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveCategory(cat.id)}
              className="gap-2"
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Plan Content */}
        <div className="max-w-5xl mx-auto">
          {activeCategory === 'avulsa' && <AvulsaPlans onGetStarted={onGetStarted} />}
          {activeCategory === 'assinatura' && <AssinaturaPlans onGetStarted={onGetStarted} />}
          {activeCategory === 'ciclo' && <CicloPlans onGetStarted={onGetStarted} />}
          {activeCategory === 'kits' && <KitsPlans onGetStarted={onGetStarted} />}
        </div>
      </div>
    </section>
  );
};

const AvulsaPlans = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="space-y-8">
    {/* Adubos */}
    <div>
      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <span className="text-2xl">🪴</span> Adubos
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:shadow-elevated transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-foreground">Adubo Granulado</h4>
                <p className="text-sm text-muted-foreground">0,5 kg</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">R$ 15</span>
              </div>
            </div>
            <Button onClick={onGetStarted} className="w-full">
              Comprar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-elevated transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-foreground">Adubo Líquido Concentrado</h4>
                <p className="text-sm text-muted-foreground">500 ml</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">R$ 10</span>
              </div>
            </div>
            <Button onClick={onGetStarted} className="w-full">
              Comprar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* PRO */}
    <div>
      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <span className="text-2xl">♻️</span> PRO – Processamento de Resíduo Orgânico
      </h3>
      <Card className="hover:shadow-elevated transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h4 className="font-bold text-foreground">1 PRO (100g de resíduo)</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
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
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary">R$ 1</span>
              <span className="text-muted-foreground">/PRO</span>
            </div>
          </div>
          <Button onClick={onGetStarted} variant="hero" className="w-full">
            Ativar PROs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

const AssinaturaPlans = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const proPlans = [
    { name: 'Semente', pros: 10, price: 10, icon: Sprout, link: 'https://checkout.nexano.com.br/checkout/cmkzlgiv50i611ztcqo23l6nu?offer=ZNI2HOF' },
    { name: 'Muda', pros: 25, price: 25, icon: Leaf, link: 'https://checkout.nexano.com.br/checkout/cmkzlgiv50i611ztcqo23l6nu?offer=RYR5AYT' },
    { name: 'Árvore', pros: 50, price: 50, icon: TreeDeciduous, link: 'https://checkout.nexano.com.br/checkout/cmkzlgiv50i611ztcqo23l6nu?offer=M6SMJ2V' },
    { name: 'Livre', pros: null, price: null, icon: Star, link: null },
  ];

  const aduboPlans = [
    { name: 'Adubo Granulado', description: '0,5 kg mensal', price: 15, icon: Leaf, link: 'https://checkout.nexano.com.br/checkout/cmkzlgiv50i611ztcqo23l6nu?offer=I5X3FYG' },
    { name: 'Adubo Líquido', description: '500 ml mensal', price: 10, icon: Droplets, link: 'https://checkout.nexano.com.br/checkout/cmkzlgiv50i611ztcqo23l6nu?offer=ZB6UOD7' },
    { name: 'Granulado + Líquido', description: 'Ambos os adubos mensais', price: 22, icon: Star, link: 'https://checkout.nexano.com.br/checkout/cmkzlgiv50i611ztcqo23l6nu?offer=SWPRZQA', combo: true },
  ];

  return (
    <div className="space-y-8">
      {/* Assinatura de PROs */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <span className="text-2xl">🌾</span> Assinatura de PROs
        </h3>
        <p className="text-muted-foreground mb-4">Impacto contínuo + participação automática no ciclo</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {proPlans.map((plan) => (
            <Card key={plan.name} className="hover:shadow-elevated transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <plan.icon className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Plano {plan.name}</CardTitle>
                </div>
                <CardDescription>
                  {plan.pros ? `${plan.pros} PROs/mês` : 'Valor escolhido por você'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {plan.price ? (
                    <>
                      <span className="text-2xl font-bold text-primary">R$ {plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </>
                  ) : (
                    <span className="text-lg font-medium text-muted-foreground">Personalizado</span>
                  )}
                </div>
                {plan.link ? (
                  <Button asChild className="w-full">
                    <a href={plan.link} target="_blank" rel="noopener noreferrer">
                      Assinar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                ) : (
                  <Button onClick={onGetStarted} className="w-full">
                    Assinar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Assinatura de Adubos */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <span className="text-2xl">🪴</span> Assinatura de Adubos
        </h3>
        <p className="text-muted-foreground mb-4">Entrega recorrente em casa + impacto local</p>
        <div className="grid md:grid-cols-3 gap-4">
          {aduboPlans.map((plan) => (
            <Card key={plan.name} className={`hover:shadow-elevated transition-shadow ${plan.combo ? 'border-primary/50' : ''}`}>
              <CardHeader className="pb-2">
                {plan.combo && <Badge className="w-fit mb-2">Combo</Badge>}
                <div className="flex items-center gap-2">
                  <plan.icon className={`w-5 h-5 ${plan.combo ? 'text-accent' : 'text-primary'}`} />
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-primary">R$ {plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <Button asChild className="w-full">
                  <a href={plan.link} target="_blank" rel="noopener noreferrer">
                    Assinar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const CicloPlans = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const cicloPlans = [
    {
      name: 'Semente',
      emoji: '🌱',
      pros: 10,
      adubos: 1,
      price: 25,
      icon: Sprout,
      link: 'https://checkout.nexano.com.br/checkout/cmkzlgiv50i611ztcqo23l6nu?offer=ETDZIY8',
    },
    {
      name: 'Muda',
      emoji: '🌿',
      pros: 25,
      adubos: 2,
      price: 50,
      popular: true,
      icon: TreeDeciduous,
      link: 'https://checkout.nexano.com.br/checkout/cmkzlgiv50i611ztcqo23l6nu?offer=GL2VODG',
    },
    {
      name: 'Árvore',
      emoji: '🌳',
      pros: 50,
      adubos: 3,
      price: 90,
      icon: TreePine,
      link: 'https://checkout.nexano.com.br/checkout/cmkzlgiv50i611ztcqo23l6nu?offer=8YH02Y6',
    },
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <Badge variant="default" className="mb-2">
          ⭐ Modelo-chave do Clube do Adubo
        </Badge>
        <h3 className="text-xl font-bold text-foreground">
          Assinatura "Fechar o Ciclo"
        </h3>
        <p className="text-muted-foreground">Adubo + PROs no mesmo plano</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {cicloPlans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative hover:shadow-elevated transition-shadow ${
              plan.popular ? 'border-primary shadow-glow' : ''
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Mais popular
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <div className="text-4xl mb-2">{plan.emoji}</div>
              <CardTitle>Plano {plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <span className="text-4xl font-bold text-primary">R$ {plan.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {plan.pros} PROs/mês
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {plan.adubos} adubo{plan.adubos > 1 ? 's' : ''}/mês
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Combinação flexível
                </li>
              </ul>
              <Button
                asChild
                variant={plan.popular ? 'hero' : 'default'}
                className="w-full"
              >
                <a href={plan.link} target="_blank" rel="noopener noreferrer">
                  Assinar agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const KitsPlans = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <Card className="hover:shadow-elevated transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <CardTitle>Kit Iniciante</CardTitle>
        </div>
        <CardDescription>Perfeito para começar sua jornada sustentável</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            2× Adubo Granulado
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            1× Adubo Líquido
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            10 PROs
          </li>
        </ul>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground line-through">R$ 60,00</span>
          <span className="text-3xl font-bold text-primary">R$ 50</span>
        </div>
        <Button onClick={onGetStarted} className="w-full">
          Comprar Kit
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>

    <Card className="hover:shadow-elevated transition-shadow border-primary/50">
      <CardHeader>
        <Badge className="w-fit mb-2">Mais completo</Badge>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <CardTitle>Kit Jardim Completo</CardTitle>
        </div>
        <CardDescription>Para quem quer transformação em grande escala</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            5× Adubo Granulado
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            3× Adubo Líquido
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            30 PROs
          </li>
        </ul>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground line-through">R$ 165,00</span>
          <span className="text-3xl font-bold text-primary">R$ 130</span>
        </div>
        <Button onClick={onGetStarted} variant="hero" className="w-full">
          Comprar Kit
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  </div>
);
