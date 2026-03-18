import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Sparkles, Heart, Eye, Globe, PartyPopper, X,
  ArrowRight, CheckCircle2, Circle, Compass,
  TrendingUp, Users, BarChart3, AlertCircle, RefreshCw,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type UserStage = 'A' | 'B' | 'C' | 'D';

interface DashboardSummary {
  pros_in_cycle: number;
  pros_sold: number;
  pros_paid: number;
  total_received: number;
  today_sales_count: number;
  today_pros_paid: number;
  month_sales_count: number;
  month_pros_paid: number;
  active_dreams_count: number;
  completed_dreams_count: number;
  has_active_subscription: boolean;
  active_plan_key: string | null;
}

function useJornadaData(userId: string | undefined) {
  // Full summary RPC (same as old dashboard)
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc('get_user_dashboard_summary', {
        p_user_id: userId,
      });
      if (error) throw error;
      return data as unknown as DashboardSummary;
    },
    enabled: !!userId,
    refetchInterval: 60_000,
  });

  const summary = summaryQuery.data;
  const prosCount = summary ? (summary.pros_in_cycle + summary.pros_sold + summary.pros_paid) : 0;
  const dreamsCount = summary ? (summary.active_dreams_count + summary.completed_dreams_count) : 0;
  const hasSubscription = summary?.has_active_subscription ?? false;

  return {
    summary,
    prosCount,
    dreamsCount,
    hasSubscription,
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError,
    refetchAll: summaryQuery.refetch,
  };
}

function getStage(prosCount: number, dreamsCount: number, hasSubscription: boolean): UserStage {
  if (hasSubscription) return 'D';
  if (dreamsCount > 0) return 'C';
  if (prosCount > 0) return 'B';
  return 'A';
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Content Maps ───

const momentoContent: Record<UserStage, { frase: string; micro: string; cta: string; ctaLink: string; cta2?: string; cta2Link?: string }> = {
  A: {
    frase: 'Você chegou ao seu espaço no Clube do Adubo. Agora pode dar seu primeiro passo no ciclo.',
    micro: 'Começando por aqui, você entende melhor como sua participação funciona e passa a acompanhar tudo com clareza.',
    cta: 'Dar meu primeiro passo',
    ctaLink: '/planos',
    cta2: 'Entender como funciona',
    cta2Link: '/ciclo',
  },
  B: {
    frase: 'Sua participação já começou. Agora vale dar direção ao que você está construindo por aqui.',
    micro: 'Ao conectar um sonho à sua jornada, fica mais fácil acompanhar sua evolução e sentir o ciclo ganhar forma na sua vida.',
    cta: 'Criar meu primeiro sonho',
    ctaLink: '/dreams',
    cta2: 'Ver como o ciclo funciona',
    cta2Link: '/ciclo',
  },
  C: {
    frase: 'Sua jornada já está conectada a algo seu. Agora você pode acompanhar com mais clareza o que está em movimento.',
    micro: 'Você já transformou participação em direção. O próximo passo é acompanhar sua evolução e fortalecer seu ritmo no ciclo.',
    cta: 'Acompanhar minha jornada',
    ctaLink: '/fifo',
    cta2: 'Conhecer a participação mensal',
    cta2Link: '/planos',
  },
  D: {
    frase: 'Sua participação já segue com continuidade. Por aqui, você acompanha o que está ativo, o que evoluiu e o que vem a seguir.',
    micro: 'Seu ciclo já está em movimento recorrente. Agora o mais importante é acompanhar desdobramentos, sonhos e próximos avanços.',
    cta: 'Ver minha evolução',
    ctaLink: '/dreams',
    cta2: 'Acompanhar o sistema',
    cta2Link: '/transparencia',
  },
};

const proximoPassoContent: Record<UserStage, { frase: string; micro: string; cta: string; ctaLink: string; cta2?: string; cta2Link?: string }> = {
  A: {
    frase: 'Seu melhor próximo passo agora é começar sua participação no ciclo.',
    micro: 'Ao começar, você entra no sistema de forma concreta e passa a acompanhar tudo por aqui.',
    cta: 'Dar meu primeiro passo',
    ctaLink: '/planos',
  },
  B: {
    frase: 'Agora vale conectar sua participação a algo que faça sentido para você.',
    micro: 'Ao criar um sonho, sua jornada ganha direção e fica mais fácil acompanhar sua evolução.',
    cta: 'Criar meu primeiro sonho',
    ctaLink: '/dreams',
  },
  C: {
    frase: 'Seu próximo passo agora é acompanhar o que já está em movimento na sua jornada.',
    micro: 'Você já começou e já deu direção ao ciclo. Agora vale observar sua evolução e fortalecer sua participação.',
    cta: 'Acompanhar minha jornada',
    ctaLink: '/fifo',
    cta2: 'Conhecer a participação mensal',
    cta2Link: '/planos',
  },
  D: {
    frase: 'Seu próximo passo agora é acompanhar seus avanços e os desdobramentos da sua participação.',
    micro: 'Com participação contínua ativa, o mais importante passa a ser visão, acompanhamento e próximos ajustes da jornada.',
    cta: 'Ver minha evolução',
    ctaLink: '/dreams',
  },
};

const JornadaPage = () => {
  const { user, profile } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  const { summary, prosCount, dreamsCount, hasSubscription, isLoading, isError, refetchAll } = useJornadaData(user?.id);
  const stage = getStage(prosCount, dreamsCount, hasSubscription);
  const momento = momentoContent[stage];
  const proximo = proximoPassoContent[stage];

  useEffect(() => {
    if (!user) return;
    const key = `welcome_shown_${user.id}`;
    if (!localStorage.getItem(key)) {
      setShowWelcome(true);
      localStorage.setItem(key, 'true');
    }
  }, [user]);

  const firstName = profile?.full_name?.split(' ')[0] || 'Participante';

  // Marcos with dynamic titles for marco 3
  const marcos = [
    {
      title: 'Você entrou no ciclo',
      text: 'Sua participação já começou de forma real.',
      done: prosCount > 0,
    },
    {
      title: 'Você deu direção à sua jornada',
      text: 'Seus sonhos ajudam a transformar participação em algo que faz sentido para sua vida.',
      done: dreamsCount > 0,
    },
    {
      title: hasSubscription
        ? 'Sua jornada segue com continuidade'
        : 'Sua jornada pode ganhar continuidade',
      text: hasSubscription
        ? 'Sua participação contínua está ativa e seu ritmo segue em movimento.'
        : 'Acompanhar e fortalecer o ritmo da sua participação torna sua experiência mais viva e mais estável.',
      done: hasSubscription,
    },
  ];

  // ─── Error state ───
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Não foi possível carregar sua jornada</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tivemos um problema ao buscar seus dados. Isso pode ser temporário — tente novamente em instantes.
          </p>
          <Button onClick={() => refetchAll()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // ─── Loading state ───
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-48 mt-2" />
            </CardContent>
          </Card>
          <div className="space-y-3">
            <Skeleton className="h-6 w-56" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-7 w-12" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card>
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-44 mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* ── Welcome banner (first visit only) ── */}
        {showWelcome && (
          <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <PartyPopper className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground">Bem-vindo ao Clube do Adubo</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Seu e-mail foi confirmado com sucesso.<br />
                  Agora você já pode acompanhar sua jornada, conhecer os planos e dar o próximo passo no ciclo.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link to="/planos">
                    <Button size="sm" className="earth-gradient font-medium gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Conhecer os planos
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => setShowWelcome(false)}>
                    Ver minha jornada
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ BLOCO 1 — Seu momento no ciclo ═══ */}
        <section className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Seu momento no ciclo
          </h1>
          <p className="text-muted-foreground text-sm">
            Olá, {firstName}!
          </p>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-5 sm:p-6 space-y-3">
              <p className="text-foreground font-medium leading-relaxed">
                {momento.frase}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {momento.micro}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link to={momento.ctaLink}>
                  <Button className="earth-gradient gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    {momento.cta}
                  </Button>
                </Link>
                {momento.cta2 && momento.cta2Link && (
                  <Link to={momento.cta2Link}>
                    <Button variant="outline" size="sm">
                      {momento.cta2}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 2 — O que já está em andamento (enriched) ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">O que já está em andamento</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Veja o que já começou a ganhar forma na sua jornada.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="No ciclo"
              value={summary?.pros_in_cycle ?? 0}
              icon={<Sparkles className="w-4 h-4 text-primary" />}
              sub="Participações ativas"
            />
            <StatCard
              label="Vendidos"
              value={summary?.pros_sold ?? 0}
              icon={<TrendingUp className="w-4 h-4 text-primary" />}
              sub="Aguardando retorno"
            />
            <StatCard
              label="Concluídos"
              value={summary?.pros_paid ?? 0}
              icon={<CheckCircle2 className="w-4 h-4 text-primary" />}
              sub="Ciclo completo"
            />
            <StatCard
              label="Recebido"
              value={formatBRL(summary?.total_received ?? 0)}
              icon={<Wallet className="w-4 h-4 text-primary" />}
              sub="Retorno total"
              isText
            />
          </div>

          {/* Dreams + Rhythm summary row */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/dreams" className="group">
              <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Sonhos</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {summary?.active_dreams_count ?? 0}
                    {(summary?.completed_dreams_count ?? 0) > 0 && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        + {summary?.completed_dreams_count} concluído{(summary?.completed_dreams_count ?? 0) > 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(summary?.active_dreams_count ?? 0) === 0
                      ? 'Nenhum sonho criado ainda.'
                      : 'Sonhos ativos dando direção à jornada.'}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to={hasSubscription ? '/assinatura' : '/planos'} className="group">
              <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Ritmo</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {hasSubscription ? 'Contínuo' : 'Manual'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasSubscription
                      ? 'Participação contínua ativa.'
                      : 'Participe manualmente ou ative um plano.'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* ═══ BLOCO 2.5 — Movimento do ciclo (from dashboard) ═══ */}
        {prosCount > 0 && (
          <section className="space-y-4">
            <Card>
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Movimento do ciclo</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vendas de adubo e participações concluídas — o que moveu o ciclo recentemente.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Hoje</p>
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{summary?.today_sales_count ?? 0}</span> venda{(summary?.today_sales_count ?? 0) !== 1 ? 's' : ''} · <span className="font-semibold">{summary?.today_pros_paid ?? 0}</span> concluída{(summary?.today_pros_paid ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Este mês</p>
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{summary?.month_sales_count ?? 0}</span> venda{(summary?.month_sales_count ?? 0) !== 1 ? 's' : ''} · <span className="font-semibold">{summary?.month_pros_paid ?? 0}</span> concluída{(summary?.month_pros_paid ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Link to="/painel-publico#inicio">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 px-0">
                    <Eye className="w-3.5 h-3.5" /> Ver painel público completo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ═══ BLOCO 3 — Seu próximo passo ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Seu próximo passo</h2>
          <Card className="border-primary/20">
            <CardContent className="p-5 sm:p-6 space-y-3">
              <p className="text-foreground font-medium leading-relaxed">
                {proximo.frase}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {proximo.micro}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link to={proximo.ctaLink}>
                  <Button className="earth-gradient gap-1.5">
                    <ArrowRight className="w-4 h-4" />
                    {proximo.cta}
                  </Button>
                </Link>
                {proximo.cta2 && proximo.cta2Link && (
                  <Link to={proximo.cta2Link}>
                    <Button variant="outline" size="sm">{proximo.cta2}</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 4 — Como sua jornada avança ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Como sua jornada avança</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sua participação não fica parada. Ela ganha forma, direção e continuidade com o tempo.
            </p>
          </div>
          <div className="space-y-0">
            {marcos.map((marco, i) => (
              <div key={i} className="flex gap-4 relative">
                {i < marcos.length - 1 && (
                  <div className={cn(
                    "absolute left-[15px] top-8 w-0.5 h-[calc(100%-8px)]",
                    marco.done ? "bg-primary/40" : "bg-border"
                  )} />
                )}
                <div className="shrink-0 z-10">
                  {marco.done ? (
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  ) : (
                    <Circle className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="pb-8">
                  <p className={cn(
                    "font-medium text-sm",
                    marco.done ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {marco.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {marco.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ BLOCO 5 — Continue sua jornada ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Continue sua jornada</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Aqui estão os caminhos mais importantes para continuar acompanhando e construindo sua participação.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PathCard
              to="/ciclo"
              icon={<Compass className="w-5 h-5 text-primary" />}
              title="Entender meu ciclo"
              text="Veja as etapas da sua participação e entenda como o sistema funciona de forma simples."
            />
            <PathCard
              to="/dreams"
              icon={<Heart className="w-5 h-5 text-primary" />}
              title="Ver meus sonhos"
              text="Acompanhe o que já está conectado à sua jornada e o que você quer construir."
            />
            <PathCard
              to="/fifo"
              icon={<BarChart3 className="w-5 h-5 text-primary" />}
              title="Acompanhar minha participação"
              text="Veja como sua posição evolui e acompanhe o andamento do ciclo com mais clareza."
            />
            <PathCard
              to="/indicacoes"
              icon={<Users className="w-5 h-5 text-primary" />}
              title="Minha onda de impacto"
              text="Acompanhe como sua participação pode alcançar outras pessoas e ampliar o ciclo."
            />
          </div>
        </section>

        {/* ═══ BLOCO 6 — Você faz parte de algo maior ═══ */}
        <section className="space-y-4 pb-4">
          <h2 className="text-xl font-bold text-foreground">Você faz parte de algo maior</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sua jornada faz parte de um ciclo real de transformação de resíduos, produção de adubo e acompanhamento público no território.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/painel-publico#inicio">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Eye className="w-4 h-4" />
                Ver o Painel Público
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Globe className="w-4 h-4" />
                Ir para a Área Pública
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

// ─── Sub-components ───

function StatCard({ label, value, icon, sub, isText }: {
  label: string; value: string | number; icon: React.ReactNode; sub: string; isText?: boolean;
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-3 sm:p-4 space-y-1">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
        <p className={cn("font-bold text-foreground", isText ? "text-sm" : "text-xl")}>{value}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function PathCard({ to, icon, title, text }: { to: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link to={to} className="group block">
      <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all">
        <CardContent className="p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {title}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {text}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default JornadaPage;
