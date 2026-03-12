import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, ArrowRight, Sprout, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.webp';

type Status = 'sucesso' | 'pendente' | 'erro';

const CONFIG: Record<Status, {
  icon: React.ElementType;
  iconClass: string;
  title: string;
  description: string;
  cta: string;
  ctaPath: string;
  secondaryCta?: string;
  secondaryPath?: string;
}> = {
  sucesso: {
    icon: CheckCircle2,
    iconClass: 'text-primary',
    title: 'Você entrou no ciclo.',
    description: 'Seu primeiro passo foi registrado. Em instantes, sua participação aparecerá no sistema e você poderá acompanhar tudo com transparência.',
    cta: 'Ver próximos passos',
    ctaPath: '/ciclo',
    secondaryCta: 'Voltar ao início',
    secondaryPath: '/',
  },
  pendente: {
    icon: Clock,
    iconClass: 'text-yellow-500',
    title: 'Seu pagamento está em análise.',
    description: 'Seu primeiro passo já foi iniciado. Assim que o pagamento for confirmado, sua participação será registrada automaticamente.',
    cta: 'Acompanhar status',
    ctaPath: '/dashboard',
  },
  erro: {
    icon: XCircle,
    iconClass: 'text-destructive',
    title: 'Não foi possível concluir esse passo.',
    description: 'Seu pagamento não foi confirmado. Nenhum valor foi cobrado. Você pode tentar novamente agora ou voltar quando quiser.',
    cta: 'Tentar novamente',
    ctaPath: '/planos',
  },
};

export default function CheckoutResultPage({ status }: { status: Status }) {
  const [searchParams] = useSearchParams();
  const cfg = CONFIG[status];
  const Icon = cfg.icon;

  const [isProAvulso, setIsProAvulso] = useState(false);
  const [checking, setChecking] = useState(status === 'sucesso');

  useEffect(() => {
    if (status !== 'sucesso') return;

    const externalRef = searchParams.get('external_reference') || '';
    if (!externalRef) {
      setChecking(false);
      return;
    }

    const checkProductKey = async () => {
      try {
        const { data } = await supabase
          .from('financial_entries')
          .select('product_key')
          .eq('external_reference', externalRef)
          .limit(1)
          .maybeSingle();

        if (data?.product_key === 'pro_avulso') {
          setIsProAvulso(true);
        }
      } catch (err) {
        console.error('Error checking product_key:', err);
      } finally {
        setChecking(false);
      }
    };

    checkProductKey();
  }, [status, searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Clube do Adubo" className="h-10 w-auto" />
            <span className="font-bold text-lg text-foreground hidden sm:block">Clube do Adubo</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                <Icon className={`w-8 h-8 ${cfg.iconClass}`} />
              </div>
              <CardTitle className="text-2xl">{cfg.title}</CardTitle>
              <CardDescription className="text-base">{cfg.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full earth-gradient">
                <Link to={cfg.ctaPath}>{cfg.cta}</Link>
              </Button>
              {cfg.secondaryCta && cfg.secondaryPath && (
                <Button variant="ghost" asChild className="w-full">
                  <Link to={cfg.secondaryPath}>{cfg.secondaryCta}</Link>
                </Button>
              )}
              {status === 'erro' && (
                <>
                  <Button variant="ghost" asChild className="w-full">
                    <Link to="/">Voltar ao início</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Precisa de ajuda?{' '}
                    <Link to="/contato" className="text-primary hover:underline">
                      Fale conosco
                    </Link>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── Upgrade CTA for pro_avulso purchases ── */}
          {status === 'sucesso' && checking && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {status === 'sucesso' && !checking && isProAvulso && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center space-y-4">
                <Sprout className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-lg font-bold text-foreground">
                  Quer continuar participando todo mês?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Transforme esse primeiro passo em um plano mensal com adubo em casa.
                </p>
                <Button asChild variant="hero" className="w-full">
                  <Link to="/planos#plano-muda">
                    Conhecer planos mensais
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
