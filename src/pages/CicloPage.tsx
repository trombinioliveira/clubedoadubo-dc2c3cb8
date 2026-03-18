import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  AlertCircle, RefreshCw, ArrowRight, CheckCircle2, Circle,
  Sprout, Recycle, Heart, Eye, Compass, Leaf
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ─── Data Hook ───

type CicloStage = 'nenhum' | 'entrou' | 'direcionou' | 'continuo';

function useCicloData(userId: string | undefined) {
  const prosQuery = useQuery({
    queryKey: ['ciclo-pros', userId],
    queryFn: async () => {
      if (!userId) return { total: 0, hasPaid: false };
      const [countRes, paidRes] = await Promise.all([
        supabase.from('pros').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('pros').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'paid'),
      ]);
      if (countRes.error) throw countRes.error;
      if (paidRes.error) throw paidRes.error;
      return { total: countRes.count ?? 0, hasPaid: (paidRes.count ?? 0) > 0 };
    },
    enabled: !!userId,
  });

  const dreamsQuery = useQuery({
    queryKey: ['ciclo-dreams', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await supabase
        .from('dreams').select('id', { count: 'exact', head: true }).eq('user_id', userId);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
  });

  const subQuery = useQuery({
    queryKey: ['ciclo-sub', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { count, error } = await supabase
        .from('subscriptions').select('id', { count: 'exact', head: true })
        .eq('user_id', userId).eq('status', 'active');
      if (error) throw error;
      return (count ?? 0) > 0;
    },
    enabled: !!userId,
  });

  const isLoading = prosQuery.isLoading || dreamsQuery.isLoading || subQuery.isLoading;
  const isError = prosQuery.isError || dreamsQuery.isError || subQuery.isError;
  const refetchAll = () => { prosQuery.refetch(); dreamsQuery.refetch(); subQuery.refetch(); };

  const prosTotal = prosQuery.data?.total ?? 0;
  const hasPaid = prosQuery.data?.hasPaid ?? false;
  const dreamsCount = dreamsQuery.data ?? 0;
  const hasSubscription = subQuery.data ?? false;

  let stage: CicloStage = 'nenhum';
  if (hasSubscription) stage = 'continuo';
  else if (dreamsCount > 0) stage = 'direcionou';
  else if (prosTotal > 0) stage = 'entrou';

  return { prosTotal, hasPaid, dreamsCount, hasSubscription, stage, isLoading, isError, refetchAll };
}

// ─── Stage Label ───

function getStageBadge(stage: CicloStage) {
  const map: Record<CicloStage, { label: string; color: string }> = {
    nenhum: { label: 'Ainda não começou', color: 'bg-muted text-muted-foreground' },
    entrou: { label: 'Entrou no ciclo', color: 'bg-primary/10 text-primary' },
    direcionou: { label: 'Direcionou sua jornada', color: 'bg-primary/15 text-primary' },
    continuo: { label: 'Participação contínua ativa', color: 'bg-primary/20 text-primary font-semibold' },
  };
  return map[stage];
}

// ─── Etapas do Ciclo ───

interface EtapaConfig {
  num: number;
  title: string;
  text: string;
  icon: React.ElementType;
  isDone: (d: ReturnType<typeof useCicloData>) => boolean;
  humanReading: (d: ReturnType<typeof useCicloData>) => string;
  cta?: (d: ReturnType<typeof useCicloData>) => { label: string; link: string } | null;
}

const etapas: EtapaConfig[] = [
  {
    num: 1,
    title: 'Entrar no ciclo',
    text: 'Sua participação começa quando você assume um lugar real dentro do sistema.',
    icon: Sprout,
    isDone: (d) => d.prosTotal > 0,
    humanReading: (d) =>
      d.prosTotal > 0
        ? `Você já está no ciclo com ${d.prosTotal} participaç${d.prosTotal === 1 ? 'ão' : 'ões'}.`
        : 'Você ainda não entrou no ciclo.',
    cta: (d) =>
      d.prosTotal === 0 ? { label: 'Dar meu primeiro passo', link: '/planos' } : null,
  },
  {
    num: 2,
    title: 'Acompanhar a transformação',
    text: 'O resíduo passa por um processo real até se tornar adubo e seguir adiante no ciclo.',
    icon: Recycle,
    isDone: (d) => d.prosTotal > 0,
    humanReading: (d) =>
      d.prosTotal > 0
        ? 'Sua participação já está em transformação dentro do ciclo.'
        : 'Quando você entrar no ciclo, poderá acompanhar a transformação real.',
    cta: (d) =>
      d.prosTotal > 0 ? { label: 'Acompanhar minha participação', link: '/fifo' } : null,
  },
  {
    num: 3,
    title: 'Dar direção à sua jornada',
    text: 'Ao conectar um sonho, sua participação passa a apontar para algo concreto na sua vida.',
    icon: Heart,
    isDone: (d) => d.dreamsCount > 0,
    humanReading: (d) =>
      d.dreamsCount > 0
        ? `Você já conectou ${d.dreamsCount} sonho${d.dreamsCount === 1 ? '' : 's'} à sua jornada.`
        : 'Você ainda pode dar direção pessoal ao seu ciclo criando um sonho.',
    cta: (d) =>
      d.dreamsCount === 0 ? { label: 'Criar meu primeiro sonho', link: '/dreams' } : null,
  },
  {
    num: 4,
    title: 'Ver o retorno do ciclo',
    text: 'Quando o adubo entra em movimento e o ciclo se fecha, sua participação acompanha esse retorno com clareza.',
    icon: Eye,
    isDone: (d) => d.hasPaid,
    humanReading: (d) =>
      d.hasPaid
        ? 'O ciclo já se completou ao menos uma vez na sua jornada.'
        : 'Quando o adubo for vendido, o retorno do ciclo chegará até você.',
    cta: (d) =>
      d.prosTotal > 0 && !d.hasPaid ? { label: 'Acompanhar minha participação', link: '/fifo' } : null,
  },
];

// ─── Path Card ───

function PathCard({ title, text, link }: { title: string; text: string; link: string }) {
  return (
    <Link to={link}>
      <Card className="hover:shadow-md transition-shadow h-full group">
        <CardContent className="p-5 space-y-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
          <span className="inline-flex items-center text-xs font-medium text-primary gap-1">
            Acessar <ArrowRight className="w-3 h-3" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Page ───

export default function CicloPage() {
  const { user } = useAuth();
  const data = useCicloData(user?.id);
  const { stage, isLoading, isError, refetchAll } = data;

  // ── Error ──
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Não foi possível carregar o passo a passo</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tivemos um problema ao buscar seus dados. Tente novamente em instantes.
          </p>
          <Button onClick={refetchAll} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="space-y-3">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Card><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}><CardContent className="p-5 space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-2/3" /></CardContent></Card>
            ))}
          </div>
          <Card><CardContent className="p-5 space-y-2"><Skeleton className="h-5 w-60" /><Skeleton className="h-4 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const badge = getStageBadge(stage);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* ═══ Header ═══ */}
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Passo a passo do ciclo
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Entenda como sua participação funciona e em que etapa você está hoje.
          </p>
        </section>

        {/* ═══ BLOCO 1 — Abertura explicativa ═══ */}
        <section>
          <Card className="border-primary/15 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-5 sm:p-6">
              <p className="text-foreground leading-relaxed">
                Aqui você acompanha, de forma simples, como sua participação entra no ciclo, ganha direção e se conecta ao retorno real do sistema.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 2 — Seu estágio no ciclo ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Seu estágio no ciclo</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Seu momento atual aparece aqui para ajudar você a entender o que já aconteceu e o que ainda pode avançar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('inline-flex items-center px-3 py-1.5 rounded-full text-sm', badge.color)}>
              {badge.label}
            </span>
          </div>
        </section>

        {/* ═══ BLOCO 3 — As etapas do ciclo ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">As etapas do ciclo</h2>
          <div className="space-y-4">
            {etapas.map((etapa) => {
              const Icon = etapa.icon;
              const done = etapa.isDone(data);
              const reading = etapa.humanReading(data);
              const ctaData = etapa.cta?.(data);

              return (
                <Card key={etapa.num} className={cn(
                  'transition-all',
                  done ? 'border-primary/25 bg-primary/5' : 'border-border'
                )}>
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      {/* Step indicator */}
                      <div className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                        done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}>
                        {done ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-bold">{etapa.num}</span>}
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className={cn('w-4 h-4', done ? 'text-primary' : 'text-muted-foreground')} />
                          <h3 className="font-semibold text-foreground">{etapa.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{etapa.text}</p>
                        <p className={cn(
                          'text-sm leading-relaxed',
                          done ? 'text-primary font-medium' : 'text-muted-foreground italic'
                        )}>
                          {reading}
                        </p>

                        {ctaData && (
                          <div className="pt-1">
                            <Link to={ctaData.link}>
                              <Button size="sm" className="earth-gradient gap-1.5">
                                {ctaData.label}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ═══ BLOCO 4 — O que acontece depois ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">O que acontece depois</h2>
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              <p className="text-foreground leading-relaxed">
                No Clube do Adubo, o ciclo não termina como um ponto final. Ele continua em movimento, e sua jornada pode seguir avançando com mais clareza e continuidade.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.hasSubscription
                  ? 'Com sua participação contínua ativa, novos ciclos seguem sendo gerados automaticamente, fortalecendo sua jornada e expandindo o impacto real do sistema.'
                  : 'Você pode fortalecer sua presença no ciclo a qualquer momento, criando novos sonhos, ampliando sua participação ou ativando a continuidade.'}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 5 — Continue sua jornada ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Continue sua jornada</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PathCard
              title="Voltar para minha Jornada"
              text="Veja seu momento atual e o próximo passo mais importante."
              link="/jornada"
            />
            <PathCard
              title="Ver meus Sonhos"
              text="Conecte sua participação a algo concreto na sua vida."
              link="/dreams"
            />
            <PathCard
              title="Acompanhar minha participação"
              text="Veja com mais detalhe onde sua participação está no ciclo."
              link="/fifo"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
