import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, Loader2, Shield, ChevronDown, ChevronUp, Leaf, Sprout, TreeDeciduous, Droplets, Star, Truck } from 'lucide-react';
import { createMPPreference } from '@/lib/publicTransparency';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/* ═══ Mercado Pago Links (Produção) ═══ */
const MP_LINKS: Record<string, string> = {
  // Assinaturas mensais
  plano_semente: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849783ce770197a92d9f080e62',
  plano_muda: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c938084979341770197a92f393f0816',
  plano_arvore: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849783ce770197a931656c0e63',
  assinatura_pro_semente: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c3bb1733b044bd8ac509bd26f86380d',
  assinatura_pro_muda: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=e5e71cf4107a45798be1770b102b552f',
  assinatura_pro_arvore: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=4f1cfedf9865484189d553c6dbe6256c',
  assinatura_granulado: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=3f5cfdc73b8242158c7e97559ad88983',
  assinatura_liquido: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=860d9cf840d5414ea4f222cb53fe860d',
  assinatura_combo: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=eeb074367cc34454a345b543c17bfa9a',
  // Pagamentos únicos
  pro_avulso: 'https://mpago.li/1Uj3CkR',
  anual_semente: 'https://mpago.la/1XURHSR',
  anual_muda: 'https://mpago.la/218kBxc',
  anual_arvore: 'https://mpago.la/11TAc7W',
};

const REQUIRES_ADDRESS = [
  'plano_semente', 'plano_muda', 'plano_arvore',
  'assinatura_granulado', 'assinatura_liquido', 'assinatura_combo',
  'anual_semente', 'anual_muda', 'anual_arvore',
];

/* Plans that use edge function (preference) instead of direct link */
const USE_PREFERENCE = ['pro_avulso'];

interface PricingSectionProps {
  onGetStarted: () => void;
}

function useCheckout() {
  const { user } = useAuth();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkout = async (product_key: string, quantity = 1) => {
    if (loadingKey) return; // prevent double click

    if (user && REQUIRES_ADDRESS.includes(product_key)) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('address_street, address_number, address_neighborhood, address_zipcode, city, address_state')
          .eq('user_id', user.id)
          .single();
        const p = profile as any;
        const addressComplete = p?.address_street && p?.address_number && p?.address_neighborhood && p?.address_zipcode && p?.city && p?.address_state;
        if (!addressComplete) {
          toast.error('Complete seu endereço para receber adubo.', { description: 'Redirecionando para o perfil...' });
          setTimeout(() => navigate('/perfil'), 1500);
          return;
        }
      } catch (err) {
        console.error('Error checking address:', err);
      }
    }

    setLoadingKey(product_key);
    try {
      if (USE_PREFERENCE.includes(product_key)) {
        // Use edge function for pro_avulso
        const result = await createMPPreference({ product_key, quantity, user_id: user?.id ?? null });
        window.location.href = result.init_point;
      } else {
        // Use direct MP link
        const link = MP_LINKS[product_key];
        if (!link) {
          toast.error('Não foi possível iniciar o pagamento agora. Tente novamente.');
          return;
        }
        window.location.href = link;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      if (err?.message === 'ADDRESS_INCOMPLETE') {
        toast.error('Complete seu endereço para receber adubo.', { description: 'Redirecionando para o perfil...' });
        setTimeout(() => navigate('/perfil'), 1500);
      } else {
        toast.error('Não foi possível iniciar o pagamento agora. Tente novamente.');
      }
    } finally {
      setLoadingKey(null);
    }
  };

  return { checkout, loadingKey };
}

function CheckoutButton({
  productKey,
  label = 'Comprar',
  variant = 'default' as 'default' | 'hero',
  className = 'w-full',
  quantity = 1,
  onGetStarted,
  globalLoading,
}: {
  productKey: string | null;
  label?: string;
  variant?: 'default' | 'hero';
  className?: string;
  quantity?: number;
  onGetStarted: () => void;
  globalLoading?: string | null;
}) {
  const { checkout, loadingKey } = useCheckout();
  const { user } = useAuth();
  const isLoading = loadingKey === productKey;
  const isAnyLoading = !!loadingKey || !!globalLoading;

  const handleClick = () => {
    if (!user) { onGetStarted(); return; }
    if (productKey) { checkout(productKey, quantity); } else { onGetStarted(); }
  };

  return (
    <Button onClick={handleClick} variant={variant} className={className} disabled={isLoading || (isAnyLoading && !isLoading)}>
      {isLoading ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando pagamento…</>
      ) : (
        <>{label}<ArrowRight className="w-4 h-4 ml-2" /></>
      )}
    </Button>
  );
}

export const PricingSection = ({ onGetStarted }: PricingSectionProps) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <section id="planos" className="py-10 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 space-y-14 md:space-y-20">

        {/* ═══ BLOCO 1 — ABERTURA ═══ */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="secondary" className="text-xs px-4 py-1.5">
            ♻️ Ciclo real · Dados públicos · Participação transparente
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Participe todo mês.<br />
            Receba adubo em casa.<br />
            <span className="text-primary">Veja sua jornada crescer.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
            Escolha um plano mensal para seguir no ciclo de forma contínua.
            Você acompanha tudo com transparência, passo a passo.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Pagamento mensal com segurança via Mercado Pago.
          </p>
        </div>

        {/* ═══ BLOCO 2 — PLANOS MENSAIS ═══ */}
        <div id="todos-planos" className="max-w-5xl mx-auto scroll-mt-24">
          <div className="text-center mb-6 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Escolha como você quer participar todo mês</h2>
            <p className="text-muted-foreground">Planos mensais com adubo em casa e participação contínua no ciclo.</p>
            <p className="text-xs text-muted-foreground/70 flex items-center justify-center gap-1.5 mt-2">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              Frete incluso. Em alguns casos, os envios podem ser agrupados para tornar a logística mais eficiente.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
            {/* Semente */}
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="text-4xl mb-2">🌱</div>
                <CardTitle>Plano Semente</CardTitle>
                <CardDescription>Para começar sua participação mensal com leveza.</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <span className="text-4xl font-bold text-primary">R$ 25</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-[200px] mx-auto">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />10 PROs por mês</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />1 adubo por mês</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Frete incluso</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Entrada leve para participar todo mês</li>
                </ul>
                <CheckoutButton productKey="plano_semente" label="Assinar Plano Semente" className="w-full" onGetStarted={onGetStarted} />
              </CardContent>
            </Card>

            {/* Muda — Destaque */}
            <Card id="plano-muda" className="relative border-primary shadow-[0_0_30px_hsl(var(--primary)/0.15)] overflow-hidden scroll-mt-24">
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1">✨ Mais popular</Badge>
              <CardHeader className="text-center pt-8 pb-2">
                <div className="text-5xl mb-3">🌿</div>
                <CardTitle className="text-2xl">Plano Muda</CardTitle>
                <CardDescription>Para quem quer uma participação mensal mais completa.</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-5 pb-8">
                <div>
                  <span className="text-5xl font-bold text-primary">R$ 50</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2.5 text-left max-w-xs mx-auto">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />25 PROs por mês</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />2 adubos por mês</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Frete incluso</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Melhor equilíbrio entre participação e recebimento</li>
                </ul>
                <CheckoutButton productKey="plano_muda" label="Assinar Plano Muda" variant="hero" className="w-full text-base py-6" onGetStarted={onGetStarted} />
              </CardContent>
            </Card>

            {/* Árvore */}
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="text-4xl mb-2">🌳</div>
                <CardTitle>Plano Árvore</CardTitle>
                <CardDescription>Para quem quer participar com mais força, todos os meses.</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <span className="text-4xl font-bold text-primary">R$ 90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-[220px] mx-auto">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />50 PROs por mês</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />3 adubos por mês</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Frete incluso</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Para uma participação mensal mais intensa</li>
                </ul>
                <CheckoutButton productKey="plano_arvore" label="Assinar Plano Árvore" className="w-full" onGetStarted={onGetStarted} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ═══ BLOCO 3 — TESTE DE R$1 ═══ */}
        <div id="pro-avulso" className="max-w-lg mx-auto scroll-mt-24">
          <Card className="border-primary/20">
            <CardContent className="p-6 sm:p-8 space-y-5">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Quer começar pequeno?</h2>
                <p className="text-muted-foreground">Teste com R$1 e entre no ciclo em 1 minuto.</p>
              </div>

              <div className="text-sm text-muted-foreground space-y-3">
                <p>Você ativa 1 PRO e dá o primeiro passo na sua jornada.</p>
                <p>Essa participação representa 100g de resíduo orgânico a caminho do adubo.</p>
              </div>

              <div className="text-xs text-muted-foreground/80 text-center space-y-1">
                <p>Você acompanha tudo com transparência no painel público.</p>
                <p>Pagamento seguro via Mercado Pago.</p>
              </div>

              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />Um primeiro passo simples para entrar no ciclo</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />Sua participação fica registrada</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />Você acompanha tudo publicamente</li>
              </ul>

              <p className="text-xs text-muted-foreground/60 text-center italic">
                Ao clicar, você será redirecionado para o pagamento seguro via Mercado Pago.
              </p>

              <CheckoutButton productKey="pro_avulso" label="Começar com R$1" variant="hero" className="w-full text-base py-6" onGetStarted={onGetStarted} />
            </CardContent>
          </Card>
        </div>

        {/* ═══ BLOCO 4 — CONFIANÇA ═══ */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border">
            <CardHeader className="text-center pb-2">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-xl">Por que isso é confiável</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center max-w-md mx-auto">
                Você não precisa confiar no escuro. O ciclo foi desenhado para ser acompanhado com clareza, passo a passo.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground max-w-md mx-auto">
                {[
                  'Existe uma ordem pública de participação',
                  'Depois que você entra, essa ordem não muda',
                  'O valor só existe quando o adubo é vendido de verdade',
                  'PRO não é investimento',
                  'O sistema não depende da entrada de novas pessoas para funcionar',
                  'Você pode acompanhar tudo no painel público',
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

        {/* ═══ BLOCO 5 — OUTRAS FORMAS DE PARTICIPAR ═══ */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4 space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Outras formas de participar</h2>
            <p className="text-muted-foreground">Se você prefere outro formato, também existem opções para seguir no ciclo do seu jeito.</p>
          </div>

          <Button variant="ghost" className="w-full text-muted-foreground mb-4" onClick={() => setShowMore(!showMore)}>
            {showMore ? <><ChevronUp className="w-4 h-4 mr-2" /> Ocultar opções</> : <><ChevronDown className="w-4 h-4 mr-2" /> Ver todas as opções</>}
          </Button>

          {showMore && (
            <div className="space-y-14 animate-fade-in">

              {/* Planos Anuais */}
              <div id="planos-anuais" className="scroll-mt-24 space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-1">Planos Anuais</h3>
                  <p className="text-sm text-muted-foreground">Para quem prefere pagar uma vez e garantir o ano com economia.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-5">
                  {[
                    { name: 'Semente Anual', emoji: '🌱', desc: 'Para quem quer garantir o ano com leveza e economia.', to: 270, save: 30, bonus: 2, key: 'anual_semente' },
                    { name: 'Muda Anual', emoji: '🌿', desc: 'Para quem quer garantir o ano com mais equilíbrio e economia.', to: 540, save: 60, bonus: 5, key: 'anual_muda' },
                    { name: 'Árvore Anual', emoji: '🌳', desc: 'Para quem quer garantir o ano com mais força e economia.', to: 960, save: 120, bonus: 10, key: 'anual_arvore' },
                  ].map((plan) => (
                    <Card key={plan.key} className="hover:shadow-elevated transition-shadow">
                      <CardHeader className="text-center pb-2">
                        <div className="text-3xl mb-1">{plan.emoji}</div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription className="text-xs">{plan.desc}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center space-y-3">
                        <div>
                          <span className="text-3xl font-bold text-primary">R$ {plan.to}</span>
                          <span className="text-muted-foreground text-sm"> à vista</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="w-fit mx-auto text-xs">Economia de R$ {plan.save}</Badge>
                          <Badge variant="outline" className="w-fit mx-auto text-xs">+{plan.bonus} PROs bônus no 1º mês</Badge>
                        </div>
                        <CheckoutButton productKey={plan.key} label={`Escolher ${plan.name}`} className="w-full" onGetStarted={onGetStarted} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Apenas PRO */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-1">Apenas PRO</h3>
                  <p className="text-sm text-muted-foreground">Para quem quer participar mensalmente sem receber adubo físico.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-5">
                  {[
                    { name: 'Semente', pros: 10, price: 10, icon: Sprout, key: 'assinatura_pro_semente' },
                    { name: 'Muda', pros: 25, price: 25, icon: Leaf, key: 'assinatura_pro_muda' },
                    { name: 'Árvore', pros: 50, price: 50, icon: TreeDeciduous, key: 'assinatura_pro_arvore' },
                  ].map((plan) => (
                    <Card key={plan.key} className="hover:shadow-elevated transition-shadow">
                      <CardHeader className="text-center pb-2">
                        <plan.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription>{plan.pros} PROs por mês</CardDescription>
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

              {/* Assinatura de Adubo */}
              <div id="adubo-mensal" className="scroll-mt-24 space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-1">Assinatura de Adubo</h3>
                  <p className="text-sm text-muted-foreground">Para quem quer receber adubo em casa de forma recorrente.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-5">
                  {[
                    { name: 'Granulado', desc: '0,5 kg por mês', price: 15, icon: Leaf, key: 'assinatura_granulado' },
                    { name: 'Líquido', desc: '600 ml por mês', price: 15, icon: Droplets, key: 'assinatura_liquido' },
                    { name: 'Combo', desc: 'Granulado + Líquido', price: 28, icon: Star, key: 'assinatura_combo', highlight: true },
                  ].map((plan) => (
                    <Card key={plan.key} className={`hover:shadow-elevated transition-shadow ${plan.highlight ? 'border-primary/50' : ''}`}>
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
            </div>
          )}
        </div>

        {/* ═══ BLOCO 6 — FECHAMENTO ═══ */}
        <div className="text-center max-w-lg mx-auto pb-8 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Quer participar?</h2>
          <p className="text-muted-foreground">
            Você não precisa entender tudo de uma vez.<br />
            Basta dar o primeiro passo e acompanhar sua jornada com transparência.
          </p>
          <CheckoutButton productKey="plano_muda" label="Assinar Plano Muda" variant="hero" className="text-base px-10 py-6" onGetStarted={onGetStarted} />
        </div>

      </div>
    </section>
  );
};
