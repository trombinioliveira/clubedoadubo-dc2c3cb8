import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, ArrowRight, Check, Sprout, TreeDeciduous, Star, Loader2, Shield, Droplets, ChevronDown, ChevronUp, Truck } from 'lucide-react';
import { createMPPreference } from '@/lib/publicTransparency';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const REQUIRES_ADDRESS = [
  'plano_semente', 'plano_muda', 'plano_arvore',
  'assinatura_granulado', 'assinatura_liquido', 'assinatura_combo',
  'anual_semente', 'anual_muda', 'anual_arvore',
  'adubo_granulado', 'adubo_liquido',
];

interface PricingSectionProps {
  onGetStarted: () => void;
}

function useCheckout() {
  const { user } = useAuth();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkout = async (product_key: string, quantity = 1) => {
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
      const result = await createMPPreference({ product_key, quantity, user_id: user?.id ?? null });
      window.location.href = result.init_point;
    } catch (err: any) {
      console.error('Checkout error:', err);
      if (err?.message === 'ADDRESS_INCOMPLETE') {
        toast.error('Complete seu endereço para receber adubo.', { description: 'Redirecionando para o perfil...' });
        setTimeout(() => navigate('/perfil'), 1500);
      } else {
        toast.error('Não foi possível iniciar o pagamento. Tente novamente.');
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
    if (!user) { onGetStarted(); return; }
    if (productKey) { checkout(productKey, quantity); } else { onGetStarted(); }
  };

  return (
    <Button onClick={handleClick} variant={variant} className={className} disabled={isLoading}>
      {isLoading ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Aguarde…</>
      ) : (
        <>{label}<ArrowRight className="w-4 h-4 ml-2" /></>
      )}
    </Button>
  );
}

/* ═══ Bloco de benefícios reutilizável ═══ */
function BenefitsBlock({ benefits }: { benefits: { title: string; items: string[] }[] }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {benefits.map((group) => (
        <div key={group.title} className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {group.items.map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export const PricingSection = ({ onGetStarted }: PricingSectionProps) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <section id="planos" className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 space-y-16 md:space-y-24">

        {/* ═══ B) BLOCO "O QUE ACONTECE AO ASSINAR" ═══ */}
        <div className="max-w-3xl mx-auto">
          <Card className="border-primary/20">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center">O que acontece ao assinar</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>Você recebe adubo em casa (conforme o plano) e fecha um ciclo de sustentabilidade real.</p>
                <p>PROs são ativados automaticamente todo mês, e você acompanha o ciclo até a venda ser registrada e o valor ser distribuído pela regra pública do Clube.</p>
                <p>Você acompanha sua jornada no painel público e o crescimento dos seus sonhos.</p>
              </div>
              <p className="text-xs text-muted-foreground/80 text-center">
                Pagamento seguro via Mercado Pago.
              </p>
              <BenefitsBlock benefits={[
                { title: 'Benefícios para você', items: ['Adubo em casa (conforme o plano)', 'PROs ativados automaticamente todo mês', 'Jornada e sonhos evoluindo com transparência'] },
                { title: 'Benefícios para a cidade e o planeta', items: ['Menos resíduo orgânico indo para descarte', 'Mais adubo orgânico substituindo insumos convencionais', 'Economia circular funcionando na prática'] },
                { title: 'Benefícios do sistema (confiança)', items: ['Regras públicas e rastreáveis', 'Valor só nasce da venda real do adubo', 'Painel público com dados do ciclo'] },
              ]} />
            </CardContent>
          </Card>
        </div>

        {/* ═══ HERO ═══ */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            🌱 Participe todo mês.<br />Automatize seu impacto.
          </h1>
          <p className="text-lg text-muted-foreground mb-2">Ative PROs + receba adubo em casa.</p>
          <p className="text-muted-foreground/80 text-sm mb-6">Participação contínua no ciclo. Sem precisar lembrar.</p>
          <p className="text-xs text-muted-foreground/60 mb-8">Pagamentos processados com segurança via <strong>Mercado Pago</strong></p>
          <CheckoutButton productKey="plano_muda" label="👉 Assinar Plano Muda" variant="hero" className="text-base py-6 px-8" onGetStarted={onGetStarted} />
        </div>

        {/* ═══ 3 PLANOS MENSAIS ═══ */}
        <div id="todos-planos" className="max-w-5xl mx-auto scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Planos Mensais — PROs + Adubo</h2>
          <p className="text-muted-foreground text-center mb-2">Assinatura completa com envio de adubo</p>
          <p className="text-xs text-center text-muted-foreground/70 mb-8 flex items-center justify-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Frete incluso — envio acumulado a cada 2–3 meses para otimizar logística.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
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
                  <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-primary" />Frete incluso</li>
                </ul>
                <CheckoutButton productKey="plano_semente" label="Assinar Semente" className="w-full" onGetStarted={onGetStarted} />
              </CardContent>
            </Card>

            {/* Muda */}
            <Card id="plano-muda" className="relative border-primary shadow-[0_0_30px_hsl(var(--primary)/0.15)] overflow-hidden scroll-mt-24">
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1">✨ Mais Popular</Badge>
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
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Frete incluso (envio acumulado)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Participação contínua na fila</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />Histórico no painel</li>
                </ul>
                <p className="text-xs text-muted-foreground/70">Equivalente a <strong className="text-foreground">R$ 1,66 por dia</strong>.</p>
                <CheckoutButton productKey="plano_muda" label="Assinar Plano Muda" variant="hero" className="w-full text-base py-6" onGetStarted={onGetStarted} />
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
                  <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-primary" />Frete incluso</li>
                </ul>
                <CheckoutButton productKey="plano_arvore" label="Assinar Árvore" className="w-full" onGetStarted={onGetStarted} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ═══ C) TESTE COM R$ 1 ═══ */}
        <div id="pro-avulso" className="max-w-lg mx-auto scroll-mt-24">
          <Card className="border-primary/20">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center">O que acontece no teste de R$ 1</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>Você ativa 1 PRO e entra no ciclo (1 PRO = 1 participação registrada).</p>
                <p>Essa participação representa 100g de resíduo orgânico seguindo para virar adubo real.</p>
                <p>Você acompanha tudo publicamente no painel — do registro até a venda ser registrada e o valor ser distribuído pela regra pública do Clube.</p>
              </div>
              <p className="text-xs text-muted-foreground/80 text-center">Pagamento seguro via Mercado Pago.</p>
              <p className="text-xs text-muted-foreground/60 text-center italic">Sem promessas mágicas. Só fatos rastreáveis.</p>

              <BenefitsBlock benefits={[
                { title: 'Benefícios para você', items: ['Entrar no ciclo em 1 minuto', 'Ver sua participação registrada', 'Dar o primeiro passo na sua jornada'] },
                { title: 'Benefícios para a cidade e o planeta', items: ['100g de resíduo orgânico a caminho do adubo', 'Fortalece compostagem e uso de orgânicos', 'Torna o problema visível'] },
                { title: 'Benefícios do sistema (confiança)', items: ['Você acompanha tudo publicamente', 'Eventos registrados (do resíduo à venda)', 'Regra pública de distribuição'] },
              ]} />

              <CheckoutButton productKey="pro_avulso" label="Ativar 1 PRO (R$ 1)" variant="hero" className="w-full text-base py-6" onGetStarted={onGetStarted} />
            </CardContent>
          </Card>
        </div>

        {/* ═══ VER MAIS OPÇÕES ═══ */}
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setShowMore(!showMore)}>
            {showMore ? <><ChevronUp className="w-4 h-4 mr-2" /> Ocultar opções</> : <><ChevronDown className="w-4 h-4 mr-2" /> Ver mais opções</>}
          </Button>

          {showMore && (
            <div className="space-y-16 mt-8 animate-fade-in">
              {/* Planos Anuais */}
              <div id="planos-anuais" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground text-center mb-2">🔥 Planos Anuais com Desconto</h2>
                <p className="text-muted-foreground text-center mb-8">Pagamento único + economia real</p>
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { name: 'Semente', emoji: '🌱', from: 300, to: 270, save: 30, bonus: 2, key: 'anual_semente' },
                    { name: 'Muda', emoji: '🌿', from: 600, to: 540, save: 60, bonus: 5, key: 'anual_muda', popular: true },
                    { name: 'Árvore', emoji: '🌳', from: 1080, to: 960, save: 120, bonus: 10, key: 'anual_arvore' },
                  ].map((plan) => (
                    <Card key={plan.name} className={`hover:shadow-elevated transition-shadow ${plan.popular ? 'border-primary/50' : ''}`}>
                      {plan.popular && <Badge className="mx-auto w-fit mt-3">Melhor custo-benefício</Badge>}
                      <CardHeader className="text-center pb-2">
                        <div className="text-3xl mb-1">{plan.emoji}</div>
                        <CardTitle className="text-lg">{plan.name} Anual</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground line-through">R$ {plan.from}</span><br />
                          <span className="text-3xl font-bold text-primary">R$ {plan.to}</span>
                          <span className="text-muted-foreground text-sm"> à vista</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="w-fit mx-auto text-xs">Economia de R$ {plan.save}</Badge>
                          <Badge variant="outline" className="w-fit mx-auto text-xs">+{plan.bonus} PROs bônus no 1º mês</Badge>
                        </div>
                        <CheckoutButton productKey={plan.key} label="Assinar Anual" className="w-full" onGetStarted={onGetStarted} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* PRO Only */}
              <div>
                <h2 className="text-2xl font-bold text-foreground text-center mb-2">♻️ Plano Mensal — Apenas PRO</h2>
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

              {/* Assinatura Adubo */}
              <div id="adubo-mensal" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground text-center mb-2">🪴 Assinatura de Adubo</h2>
                <p className="text-muted-foreground text-center mb-8">Entrega recorrente em casa</p>
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { name: 'Granulado', desc: '0,5 kg mensal', price: 15, icon: Leaf, key: 'assinatura_granulado' },
                    { name: 'Líquido', desc: '600 ml mensal', price: 15, icon: Droplets, key: 'assinatura_liquido' },
                    { name: 'Combo', desc: 'Granulado + Líquido', price: 28, icon: Star, key: 'assinatura_combo', highlight: true },
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
            </div>
          )}
        </div>

        {/* ═══ SEGURANÇA ═══ */}
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
          <CheckoutButton productKey="plano_muda" label="Entrar no Ciclo" variant="hero" className="text-base px-10 py-6" onGetStarted={onGetStarted} />
        </div>

      </div>
    </section>
  );
};
