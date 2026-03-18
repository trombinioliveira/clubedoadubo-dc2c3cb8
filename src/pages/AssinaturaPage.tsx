import React from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Leaf, ArrowRight, MessageCircle, CalendarDays, Sparkles,
  RefreshCw, AlertCircle, CheckCircle2, Pause, XCircle, HelpCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── Plan metadata ───

const PLAN_META: Record<string, { label: string; prosPerCycle: number; price: string; desc: string }> = {
  plano_semente: { label: 'Plano Semente', prosPerCycle: 10, price: 'R$ 25/mês', desc: '10 participações por ciclo mensal.' },
  plano_muda: { label: 'Plano Muda', prosPerCycle: 25, price: 'R$ 50/mês', desc: '25 participações por ciclo mensal.' },
  plano_arvore: { label: 'Plano Árvore', prosPerCycle: 50, price: 'R$ 90/mês', desc: '50 participações por ciclo mensal. Inclui frete de adubo.' },
  anual_semente: { label: 'Semente Anual', prosPerCycle: 10, price: 'R$ 250/ano', desc: '10 participações por ciclo, compromisso anual.' },
  anual_muda: { label: 'Muda Anual', prosPerCycle: 25, price: 'R$ 500/ano', desc: '25 participações por ciclo, compromisso anual.' },
  anual_arvore: { label: 'Árvore Anual', prosPerCycle: 50, price: 'R$ 900/ano', desc: '50 participações por ciclo, compromisso anual.' },
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType; humanLabel: string }> = {
  active: { label: 'Ativa', variant: 'default', icon: CheckCircle2, humanLabel: 'Sua participação contínua está ativa.' },
  paused: { label: 'Pausada', variant: 'secondary', icon: Pause, humanLabel: 'Sua participação está temporariamente pausada. Enquanto pausada, novas participações não são geradas.' },
  canceled: { label: 'Encerrada', variant: 'destructive', icon: XCircle, humanLabel: 'Sua participação contínua foi encerrada. As participações já geradas continuam no ciclo normalmente.' },
  pending: { label: 'Processando', variant: 'outline', icon: RefreshCw, humanLabel: 'Estamos processando sua assinatura. Isso pode levar alguns minutos.' },
};

function MicroHelp({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export default function AssinaturaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: subscription, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Also fetch pro_credits remaining for active sub
  const { data: creditsData } = useQuery({
    queryKey: ['my-pro-credits', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('pro_credits')
        .select('quantity_remaining, quantity_total')
        .eq('user_id', user.id)
        .gt('quantity_remaining', 0);
      return data;
    },
    enabled: !!user?.id,
  });

  const totalCreditsRemaining = creditsData?.reduce((acc, c) => acc + c.quantity_remaining, 0) ?? 0;

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-6 w-full max-w-md" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Minha participação contínua</h1>
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <AlertCircle className="w-10 h-10 mx-auto text-destructive" />
              <p className="text-muted-foreground">Não foi possível carregar os dados da sua assinatura.</p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const planMeta = subscription ? PLAN_META[subscription.plan_key] : null;
  const statusConf = subscription ? (STATUS_CONFIG[subscription.status] || STATUS_CONFIG.active) : null;
  const StatusIcon = statusConf?.icon || CheckCircle2;

  // ─── No subscription ───
  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Header */}
          <section className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Minha participação contínua</h1>
            <p className="text-muted-foreground leading-relaxed">
              Aqui você acompanha sua participação contínua no ciclo — o compromisso que mantém suas participações sendo geradas automaticamente, mês a mês.
            </p>
          </section>

          {/* Explanation */}
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">Você ainda não tem uma participação contínua</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Isso não significa que você está fora do ciclo. Qualquer participação que você já tenha — seja avulsa ou por outra forma — continua no ciclo normalmente.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A diferença da participação contínua é que, a cada mês, novas participações são geradas automaticamente sem que você precise fazer nada. É a forma mais simples de manter uma presença constante no ciclo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Difference block */}
          <Card className="border-primary/15 bg-primary/[0.02]">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-semibold text-foreground">Participação manual vs. contínua</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 p-3 rounded-lg bg-background border border-border">
                  <p className="text-sm font-medium text-foreground">Participação manual</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Você compra participações quando quiser, no valor e momento que fizer sentido. Cada compra gera participações que entram no ciclo.
                  </p>
                </div>
                <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <p className="text-sm font-medium text-foreground">Participação contínua</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Um compromisso mensal que gera participações automaticamente. Você escolhe o plano e as participações são criadas a cada ciclo sem precisar lembrar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <section className="space-y-3">
            <Button onClick={() => navigate('/planos')} className="w-full" size="lg">
              Conhecer os planos de participação contínua
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Você pode começar com o plano mais acessível e mudar a qualquer momento.
            </p>
          </section>

          {/* Navigation */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Continue sua jornada</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NavCard to="/jornada" title="Minha jornada" desc="Seu momento no ciclo e próximo passo." />
              <NavCard to="/indicacoes" title="Minha onda de impacto" desc="Veja como sua rede amplia o ciclo." />
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ─── With subscription ───
  const isActive = subscription.status === 'active';
  const isPaused = subscription.status === 'paused';
  const isCanceled = subscription.status === 'canceled';

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* ═══ Header ═══ */}
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Minha participação contínua</h1>
          <p className="text-muted-foreground leading-relaxed">
            Aqui você acompanha o compromisso que mantém suas participações sendo geradas automaticamente no ciclo.
          </p>
        </section>

        {/* ═══ BLOCO 1 — Status atual ═══ */}
        <section className="space-y-4">
          <Card className={isActive ? 'border-primary/20' : isCanceled ? 'border-destructive/20' : 'border-border'}>
            <CardContent className="p-5 sm:p-6 space-y-5">
              {/* Plan + status header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-foreground">
                    {planMeta?.label ?? subscription.plan_key}
                  </h2>
                  <p className="text-sm text-muted-foreground">{planMeta?.price ?? ''}</p>
                </div>
                <Badge variant={statusConf?.variant ?? 'default'} className="gap-1 shrink-0">
                  <StatusIcon className="w-3 h-3" />
                  {statusConf?.label ?? subscription.status}
                </Badge>
              </div>

              {/* Human status explanation */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {statusConf?.humanLabel}
              </p>

              {/* Key details */}
              <div className="grid grid-cols-2 gap-4">
                <DetailCard
                  label="Participações por ciclo"
                  value={`${planMeta?.prosPerCycle ?? subscription.pros_per_cycle}`}
                  help="Quantas participações são geradas automaticamente a cada mês do seu plano."
                />
                <DetailCard
                  label="Ciclo atual"
                  value={`${subscription.current_cycle}º`}
                  help="Em qual ciclo mensal da sua assinatura você está."
                />
              </div>

              {/* Credits remaining */}
              {totalCreditsRemaining > 0 && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{totalCreditsRemaining}</span> {totalCreditsRemaining === 1 ? 'participação aguardando' : 'participações aguardando'} entrada no ciclo
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    Participações do seu plano que ainda estão sendo convertidas. Isso acontece automaticamente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 2 — Linha do tempo ═══ */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Histórico e próximos passos</h2>

          <Card>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <TimelineRow
                icon={CalendarDays}
                label="Início da participação contínua"
                value={formatDate(subscription.started_at)}
                active
              />

              {subscription.next_billing_at && isActive && (
                <TimelineRow
                  icon={RefreshCw}
                  label="Próxima renovação"
                  value={formatDate(subscription.next_billing_at)}
                  help="Data em que o próximo ciclo será cobrado e novas participações serão geradas."
                />
              )}

              {subscription.cancelled_at && (
                <TimelineRow
                  icon={XCircle}
                  label="Encerramento solicitado em"
                  value={formatDate(subscription.cancelled_at)}
                  muted
                />
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 3 — O que a participação contínua sustenta ═══ */}
        {isActive && (
          <section className="space-y-4">
            <Card className="border-primary/10 bg-primary/[0.02]">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <h3 className="text-base font-semibold text-foreground">O que sua participação contínua sustenta</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A cada ciclo mensal, suas participações entram automaticamente no ciclo do adubo — passando por compostagem, venda e retorno. Você não precisa fazer nada: o ciclo gira por conta própria enquanto sua participação contínua estiver ativa.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Além disso, cada participação sua amplia o volume total do ciclo — o que significa mais resíduos processados, mais adubo produzido e mais impacto real.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ═══ BLOCO 4 — Ações ═══ */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">
            {isActive ? 'Gerenciar participação' : isCanceled ? 'Retomar participação' : 'Ações'}
          </h2>

          <Card>
            <CardContent className="p-5 sm:p-6 space-y-4">
              {isActive && (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Para trocar de plano, pausar ou encerrar sua participação contínua, fale com nosso time. Fazemos isso de forma simples e sem burocracia.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={() => navigate('/planos')} className="gap-2">
                      <ArrowRight className="w-4 h-4" /> Ver outros planos
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/contato')} className="gap-2">
                      <MessageCircle className="w-4 h-4" /> Falar com o time
                    </Button>
                  </div>
                </>
              )}

              {isPaused && (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sua participação está pausada. Para retomá-la ou tirar dúvidas, fale com nosso time.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/contato')} className="gap-2">
                    <MessageCircle className="w-4 h-4" /> Falar com o time
                  </Button>
                </>
              )}

              {isCanceled && (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sua participação contínua foi encerrada, mas isso não afeta as participações que já estão no ciclo. Se quiser voltar, é simples — basta escolher um novo plano.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => navigate('/planos')} className="gap-2">
                      <Leaf className="w-4 h-4" /> Escolher novo plano
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/contato')} className="gap-2">
                      <MessageCircle className="w-4 h-4" /> Falar com o time
                    </Button>
                  </div>
                </>
              )}

              {!isActive && !isPaused && !isCanceled && (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sua assinatura está em processamento. Se precisar de ajuda, fale com nosso time.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/contato')} className="gap-2">
                    <MessageCircle className="w-4 h-4" /> Falar com o time
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 5 — Entendendo a participação contínua ═══ */}
        <section className="space-y-4">
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                Dúvidas comuns
              </h3>

              <FaqItem
                q="O que acontece se eu pausar ou encerrar?"
                a="Suas participações que já estão no ciclo continuam normalmente. Pausar ou encerrar apenas impede a geração de novas participações automáticas."
              />
              <FaqItem
                q="Posso trocar de plano?"
                a="Sim. Fale com nosso time e a troca é feita sem complicação. A diferença começa a valer no próximo ciclo."
              />
              <FaqItem
                q="Por que as participações demoram a aparecer?"
                a="Após a confirmação do pagamento, as participações são geradas automaticamente em alguns minutos. Se demorar mais, pode ser um atraso pontual — fale conosco."
              />
            </CardContent>
          </Card>
        </section>

        {/* ═══ Continue sua jornada ═══ */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Continue sua jornada</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NavCard to="/jornada" title="Minha jornada" desc="Seu momento no ciclo e próximo passo." />
            <NavCard to="/indicacoes" title="Minha onda de impacto" desc="Veja como sua rede amplia o ciclo." />
          </div>
        </section>

      </div>
    </div>
  );
}

// ─── Sub-components ───

function DetailCard({ label, value, help }: { label: string; value: string; help?: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
      <div className="flex items-center gap-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {help && <MicroHelp text={help} />}
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function TimelineRow({ icon: Icon, label, value, help, active, muted: isMuted }: {
  icon: React.ElementType; label: string; value: string; help?: string; active?: boolean; muted?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${isMuted ? 'opacity-60' : ''}`}>
      <div className={`p-1.5 rounded-lg shrink-0 ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {help && <MicroHelp text={help} />}
        </div>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="space-y-1 pt-3 border-t border-border/40 first:border-0 first:pt-0">
      <p className="text-sm font-medium text-foreground">{q}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
    </div>
  );
}

function NavCard({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link to={to}>
      <Card className="hover:shadow-md transition-shadow h-full group">
        <CardContent className="p-5 space-y-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          <span className="inline-flex items-center text-xs font-medium text-primary gap-1">Acessar <ArrowRight className="w-3 h-3" /></span>
        </CardContent>
      </Card>
    </Link>
  );
}
