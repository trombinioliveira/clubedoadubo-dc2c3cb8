import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, ArrowRight, Check, Sprout, TreeDeciduous, TreePine, Star, Loader2, Shield, Droplets } from 'lucide-react';
import { createMPPreference } from '@/lib/publicTransparency';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface PricingSectionProps {
  onGetStarted: () => void;
}

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
  return (
    <section id="planos" className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 space-y-16 md:space-y-24">

        {/* ═══ SEÇÃO 1 — HERO ═══ */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            🌱 Participe todo mês.<br />Automatize seu impacto.
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Receba adubo em casa + ative PROs automaticamente.
          </p>
          <p className="text-muted-foreground/80 text-sm mb-6">
            Sem precisar lembrar. Sem precisar voltar aqui.<br />Participação contínua no ciclo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <CheckoutButton
              productKey="plano_muda"
              label="Assinar Plano Mais Popular"
              variant="hero"
              className="text-base px-8 py-6"
              onGetStarted={onGetStarted}
            />
            <Button variant="outline" size="lg" onClick={() => {
              document.getElementById('todos-planos')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Ver Todos os Planos
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-4">
            Pagamentos processados com segurança via <strong>Mercado Pago</strong>
          </p>

          {/* ═══ TESTE COM R$ 1 ═══ */}
          <div className="max-w-md mx-auto mt-8">
            <Card className="bg-muted/50 border-dashed">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-muted-foreground">💡 Teste com R$ 1</CardTitle>
                <CardDescription>Compra única — sem compromisso</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  1 PRO = R$ 1. Ative uma unidade e veja como funciona.
                </p>
                <CheckoutButton productKey="pro_avulso" label="Ativar 1 PRO" className="w-full" onGetStarted={onGetStarted} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ═══ SEÇÃO 2 — PLANO MAIS POPULAR ═══ */}
        <div id="plano-muda" className="max-w-lg mx-auto scroll-mt-24">
          <Card className="relative border-primary shadow-[0_0_30px_hsl(var(--primary)/0.15)] overflow-hidden">
            <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1">
              ✨ Mais Popular
            </Badge>
            <CardHeader className="text-center pt-8 pb-2">
              <div className="text-5xl mb-3">🌿</div>
              <CardTitle className="text-2xl">Plano Muda</CardTitle>
              <CardDescription>Assinatura mensal completa</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-5 pb-8">
              <div>
                <span className="text-5xl font-bold text-primary">R$ 50</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2.5 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />25 PROs ativados automaticamente todo mês</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />2 adubos entregues em casa</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Participação contínua na fila</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Histórico no painel</li>
              </ul>
              <p className="text-xs text-muted-foreground/70">
                Equivalente a <strong className="text-foreground">R$ 1,66 por dia</strong>.
              </p>
              <CheckoutButton
                productKey="plano_muda"
                label="Assinar Plano Muda"
                variant="hero"
                className="w-full text-base py-6"
                onGetStarted={onGetStarted}
              />
            </CardContent>
          </Card>
        </div>

        {/* ═══ SEÇÃO 3 — OUTROS PLANOS MENSAIS COMPLETOS ═══ */}
        <div id="todos-planos" className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Outros planos mensais
          </h2>
          <p className="text-muted-foreground text-center mb-8">PROs + Adubo no mesmo plano</p>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Semente */}
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="text-4xl mb-2">🌱</div>
                <CardTitle>Plano Semente</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <span className="text-4xl font-bold text-primary">R$ 25</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-primary" />10 PROs/mês</li>
                  <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-primary" />1 adubo/mês</li>
                </ul>
                <CheckoutButton productKey="plano_semente" label="Assinar Semente" className="w-full" onGetStarted={onGetStarted} />
              </CardContent>
            </Card>

            {/* Árvore */}
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="text-4xl mb-2">🌳</div>
                <CardTitle>Plano Árvore</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <span className="text-4xl font-bold text-primary">R$ 90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-primary" />50 PROs/mês</li>
                  <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-primary" />3 adubos/mês</li>
                </ul>
                <CheckoutButton productKey="plano_arvore" label="Assinar Árvore" className="w-full" onGetStarted={onGetStarted} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ═══ SEÇÃO 4 — PLANOS ANUAIS COM DESCONTO ═══ */}
        <div id="planos-anuais" className="max-w-4xl mx-auto scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            🔥 Planos Anuais com Desconto
          </h2>
          <p className="text-muted-foreground text-center mb-8">Pagamento único + economia real</p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: 'Semente', emoji: '🌱', from: 300, to: 270, save: 30, bonus: 2, key: 'anual_semente' },
              { name: 'Muda', emoji: '🌿', from: 600, to: 540, save: 60, bonus: 5, key: 'anual_muda', popular: true },
              { name: 'Árvore', emoji: '🌳', from: 1080, to: 960, save: 120, bonus: 10, key: 'anual_arvore' },
            ].map((plan) => (
              <Card key={plan.name} className={`hover:shadow-elevated transition-shadow ${plan.popular ? 'border-primary/50' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 relative mx-auto w-fit mt-3">
                    Melhor custo-benefício
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="text-3xl mb-1">{plan.emoji}</div>
                  <CardTitle className="text-lg">{plan.name} Anual</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground line-through">R$ {plan.from}</span>
                    <br />
                    <span className="text-3xl font-bold text-primary">R$ {plan.to}</span>
                    <span className="text-muted-foreground text-sm"> à vista</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="w-fit mx-auto text-xs">
                      Economia de R$ {plan.save}
                    </Badge>
                    <Badge variant="outline" className="w-fit mx-auto text-xs">
                      +{plan.bonus} PROs bônus no 1º mês
                    </Badge>
                  </div>
                  <CheckoutButton productKey={plan.key} label="Assinar Anual" className="w-full" onGetStarted={onGetStarted} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ═══ SEÇÃO 5 — PLANO MENSAL APENAS PRO ═══ */}
        <div id="pro-avulso" className="max-w-4xl mx-auto scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            ♻️ Plano Mensal — Apenas PRO
          </h2>
          <p className="text-muted-foreground text-center mb-8">Para quem não quer adubo físico</p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: 'Semente', pros: 10, price: 10, icon: Sprout, key: 'assinatura_pros_semente' },
              { name: 'Muda', pros: 25, price: 25, icon: Leaf, key: 'assinatura_pros_muda' },
              { name: 'Árvore', pros: 50, price: 50, icon: TreeDeciduous, key: 'assinatura_pros_arvore' },
            ].map((plan) => (
              <Card key={plan.name} className="hover:shadow-elevated transition-shadow">
                <CardHeader className="text-center pb-2">
                  <plan.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.pros} PROs/mês</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <span className="text-3xl font-bold text-primary">R$ {plan.price}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <CheckoutButton productKey={plan.key} label="Assinar" className="w-full" onGetStarted={onGetStarted} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ═══ SEÇÃO 6 — ASSINATURA APENAS DE ADUBO ═══ */}
        <div id="adubo-mensal" className="max-w-4xl mx-auto scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            🪴 Assinatura de Adubo
          </h2>
          <p className="text-muted-foreground text-center mb-8">Entrega recorrente em casa</p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: 'Granulado', desc: '0,5 kg mensal', price: 15, icon: Leaf, key: 'assinatura_granulado' },
              { name: 'Líquido', desc: '500 ml mensal', price: 10, icon: Droplets, key: 'assinatura_liquido' },
              { name: 'Combo', desc: 'Granulado + Líquido', price: 22, icon: Star, key: 'assinatura_combo', highlight: true },
            ].map((plan) => (
              <Card key={plan.name} className={`hover:shadow-elevated transition-shadow ${plan.highlight ? 'border-primary/50' : ''}`}>
                {plan.highlight && <Badge className="mx-auto w-fit mt-3">Combo</Badge>}
                <CardHeader className="text-center pb-2">
                  <plan.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <span className="text-3xl font-bold text-primary">R$ {plan.price}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <CheckoutButton productKey={plan.key} label="Assinar" className="w-full" onGetStarted={onGetStarted} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


        {/* ═══ SEÇÃO SEGURANÇA ═══ */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border">
            <CardHeader className="text-center pb-2">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-xl">É seguro?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground max-w-md mx-auto">
                {[
                  'Existe uma fila única',
                  'Quem entra primeiro recebe primeiro',
                  'Nada altera a ordem',
                  'O valor depende de venda real de adubo',
                  'PRO não é investimento',
                  'Não depende da entrada de novos participantes',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* ═══ CHAMADA FINAL ═══ */}
        <div className="text-center max-w-lg mx-auto pb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">Quer participar?</h2>
          <p className="text-muted-foreground mb-6">
            Não precisa entender tudo agora.<br />Basta entrar no ciclo e acompanhar.
          </p>
          <CheckoutButton
            productKey="plano_muda"
            label="Entrar no Ciclo"
            variant="hero"
            className="text-base px-10 py-6"
            onGetStarted={onGetStarted}
          />
        </div>

      </div>
    </section>
  );
};
