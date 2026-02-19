import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Recycle, Package, Gift, ArrowRight, Check, Droplets, TreeDeciduous, Sprout, TreePine, Star, Loader2 } from 'lucide-react';
import { createMPPreference } from '@/lib/publicTransparency';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface PricingSectionProps {
  onGetStarted: () => void;
}

type PlanCategory = 'avulsa' | 'assinatura' | 'ciclo' | 'kits' | 'presentes' | 'todos';

// ── Checkout hook ──────────────────────────────────────────────────────────────
function useCheckout() {
  const { user } = useAuth();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const checkout = async (product_key: string, quantity = 1) => {
    setLoadingKey(product_key);
    try {
      const result = await createMPPreference({
        product_key,
        quantity,
        user_id: user?.id ?? null,
      });
      // Redirect to Mercado Pago Checkout Pro
      window.location.href = result.init_point;
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Não foi possível iniciar o pagamento. Tente novamente.');
    } finally {
      setLoadingKey(null);
    }
  };

  return { checkout, loadingKey };
}

// ── CheckoutButton ─────────────────────────────────────────────────────────────
function CheckoutButton({
  productKey,
  label = 'Comprar',
  variant = 'default' as 'default' | 'hero',
  className = 'w-full',
  quantity = 1,
  onGetStarted,
}: {
  productKey: string | null;
  label?: string;
  variant?: 'default' | 'hero';
  className?: string;
  quantity?: number;
  onGetStarted: () => void;
}) {
  const { checkout, loadingKey } = useCheckout();
  const { user } = useAuth();
  const isLoading = loadingKey === productKey;

  const handleClick = () => {
    if (!user) {
      onGetStarted();
      return;
    }
    if (productKey) {
      checkout(productKey, quantity);
    } else {
      onGetStarted();
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Aguarde…</>
      ) : (
        <>{label}<ArrowRight className="w-4 h-4 ml-2" /></>
      )}
    </Button>
  );
}

export const PricingSection = ({ onGetStarted }: PricingSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<PlanCategory>('avulsa');

  const categories: { id: PlanCategory; label: string; icon: React.ElementType }[] = [
    { id: 'avulsa', label: 'Compra Avulsa', icon: Package },
    { id: 'assinatura', label: 'Assinaturas', icon: Recycle },
    { id: 'ciclo', label: 'Fechar o Ciclo', icon: Leaf },
    { id: 'kits', label: 'Kits', icon: Gift },
    { id: 'presentes', label: 'Presentes', icon: Gift },
    { id: 'todos', label: 'Todos', icon: Star },
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
          <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
            De compras avulsas a assinaturas completas, encontre a melhor forma de transformar resíduo em valor
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto">
            💡 <strong>Importante:</strong> O valor que você pode receber vem da venda real do adubo, não da entrada de novos participantes.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Pagamentos processados com segurança via <strong>Mercado Pago</strong>
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
          {activeCategory === 'presentes' && <PresentesPlans onGetStarted={onGetStarted} />}
          {activeCategory === 'todos' && <TodosPlans onGetStarted={onGetStarted} />}
        </div>
      </div>
    </section>
  );
};

const AvulsaPlans = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="grid md:grid-cols-2 gap-6">
    {/* Card Adubos */}
    <Card className="hover:shadow-elevated transition-shadow h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪴</span>
          <CardTitle className="text-lg">Adubos</CardTitle>
        </div>
        <CardDescription>Produtos prontos para uso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Adubo Granulado */}
        <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50 border border-border">
          <div>
            <h4 className="font-semibold text-foreground">Adubo Granulado</h4>
            <p className="text-sm text-muted-foreground">0,5 kg</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary">R$ 15</span>
            <CheckoutButton productKey="adubo_granulado" label="Comprar" className="" onGetStarted={onGetStarted} />
          </div>
        </div>
        {/* Adubo Líquido */}
        <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50 border border-border">
          <div>
            <h4 className="font-semibold text-foreground">Adubo Líquido Concentrado</h4>
            <p className="text-sm text-muted-foreground">500 ml</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary">R$ 10</span>
            <CheckoutButton productKey="adubo_liquido" label="Comprar" className="" onGetStarted={onGetStarted} />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Card PRO */}
    <Card className="hover:shadow-elevated transition-shadow h-full border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">♻️</span>
          <CardTitle className="text-lg">PRO</CardTitle>
        </div>
        <CardDescription>Processamento de Resíduo Orgânico</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-[calc(100%-5rem)]">
        <div>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-foreground">1 PRO = 100g de resíduo</h4>
              <div>
                <span className="text-2xl font-bold text-primary">R$ 1</span>
                <span className="text-muted-foreground text-sm">/PRO</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Compra livre em qualquer quantidade</p>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              Ativação individual e rastreável
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              Participa da fila FIFO global
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              Valor gerado na venda do adubo
            </li>
          </ul>
        </div>
        <CheckoutButton productKey="pro_avulso" label="Ativar PROs" variant="hero" className="w-full mt-4" onGetStarted={onGetStarted} />
      </CardContent>
    </Card>
  </div>
);

const AssinaturaPlans = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const proPlans = [
    { name: 'Semente', pros: 10, price: 10, icon: Sprout, productKey: 'assinatura_pros_semente' },
    { name: 'Muda', pros: 25, price: 25, icon: Leaf, productKey: 'assinatura_pros_muda' },
    { name: 'Árvore', pros: 50, price: 50, icon: TreeDeciduous, productKey: 'assinatura_pros_arvore' },
    { name: 'Livre', pros: null, price: null, icon: Star, productKey: null },
  ];

  const aduboPlans = [
    { name: 'Adubo Granulado', description: '0,5 kg mensal', price: 15, icon: Leaf, productKey: 'assinatura_granulado', combo: false },
    { name: 'Adubo Líquido', description: '500 ml mensal', price: 10, icon: Droplets, productKey: 'assinatura_liquido', combo: false },
    { name: 'Granulado + Líquido', description: 'Ambos os adubos mensais', price: 22, icon: Star, productKey: 'assinatura_combo', combo: true },
  ];

  return (
    <div className="space-y-8">
      {/* Assinatura de PROs */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <span className="text-2xl">🌾</span> Assinatura de PROs
        </h3>
        <p className="text-muted-foreground mb-2">Impacto contínuo + participação automática no ciclo</p>
        <p className="text-xs text-muted-foreground/70 mb-4">
          PROs ativados automaticamente todo mês. Você acompanha na Fila FIFO.
        </p>
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
                <CheckoutButton productKey={plan.productKey} label="Assinar" className="w-full" onGetStarted={onGetStarted} />
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
                <CheckoutButton productKey={plan.productKey} label="Assinar" className="w-full" onGetStarted={onGetStarted} />
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
    { name: 'Semente', emoji: '🌱', pros: 10, adubos: 1, price: 25, icon: Sprout, productKey: 'plano_semente', popular: false },
    { name: 'Muda', emoji: '🌿', pros: 25, adubos: 2, price: 50, popular: true, icon: TreeDeciduous, productKey: 'plano_muda' },
    { name: 'Árvore', emoji: '🌳', pros: 50, adubos: 3, price: 90, icon: TreePine, productKey: 'plano_arvore', popular: false },
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
        <p className="text-xs text-muted-foreground/80 mt-2">
          Você recebe adubo físico em casa + ativa PROs que entram na Fila FIFO
        </p>
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
              <CheckoutButton
                productKey={plan.productKey}
                label="Assinar agora"
                variant={plan.popular ? 'hero' : 'default'}
                className="w-full"
                onGetStarted={onGetStarted}
              />
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
        <CheckoutButton productKey="kit_iniciante" label="Comprar Kit" className="w-full" onGetStarted={onGetStarted} />
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
            25 PROs
          </li>
        </ul>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground line-through">R$ 130,00</span>
          <span className="text-3xl font-bold text-primary">R$ 100</span>
        </div>
        <CheckoutButton productKey="kit_jardim" label="Comprar Kit" className="w-full" onGetStarted={onGetStarted} />
      </CardContent>
    </Card>
  </div>
);

const PresentesPlans = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <Card className="hover:shadow-elevated transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          <CardTitle>Presente Verde</CardTitle>
        </div>
        <CardDescription>Um presente com impacto real e rastreável</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            10 PROs ativados em nome do presenteado
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            1 Adubo Granulado
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            Certificado digital de impacto
          </li>
        </ul>
        <div className="mb-4">
          <span className="text-3xl font-bold text-primary">R$ 30</span>
        </div>
        <CheckoutButton productKey="plano_semente" label="Presentear" className="w-full" onGetStarted={onGetStarted} />
      </CardContent>
    </Card>

    <Card className="hover:shadow-elevated transition-shadow border-primary/50">
      <CardHeader>
        <Badge className="w-fit mb-2">Especial</Badge>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <CardTitle>Presente Ciclo Completo</CardTitle>
        </div>
        <CardDescription>A experiência completa do ciclo como presente</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            25 PROs ativados
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            2 Adubos (granulado + líquido)
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            Acesso ao painel de impacto
          </li>
        </ul>
        <div className="mb-4">
          <span className="text-3xl font-bold text-primary">R$ 60</span>
        </div>
        <CheckoutButton productKey="plano_muda" label="Presentear" className="w-full" onGetStarted={onGetStarted} />
      </CardContent>
    </Card>
  </div>
);

const TodosPlans = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="space-y-10">
    <AvulsaPlans onGetStarted={onGetStarted} />
    <AssinaturaPlans onGetStarted={onGetStarted} />
    <CicloPlans onGetStarted={onGetStarted} />
    <KitsPlans onGetStarted={onGetStarted} />
  </div>
);
