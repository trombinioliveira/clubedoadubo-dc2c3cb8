import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  AlertCircle, RefreshCw, ArrowRight, Eye, ChevronDown, ChevronUp,
  Compass, Sprout, Sparkles, Shield, Clock, TrendingUp, HelpCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── Types ───

type ProStatus = 'pending' | 'processing' | 'ready' | 'sold' | 'paid';

interface QueueEntry {
  queue_id: string;
  queue_position: number;
  queue_status: ProStatus;
  queue_created_at: string;
  queue_paid_at: string | null;
  pro_id: string;
  pro_code: string;
  pro_weight_grams: number;
  pro_status: ProStatus;
  pro_created_at: string;
  pro_user_id: string | null;
  user_name: string;
}

// ─── Humanized status mapping ───

const statusHuman: Record<ProStatus, { label: string; emoji: string; reading: string }> = {
  pending: {
    label: 'Aguardando coleta',
    emoji: '🌱',
    reading: 'Sua participação foi registrada e aguarda o início do processamento.',
  },
  processing: {
    label: 'Em compostagem',
    emoji: '🌿',
    reading: 'O resíduo está sendo transformado em adubo. Esse processo leva tempo biológico real.',
  },
  ready: {
    label: 'Adubo pronto',
    emoji: '🌾',
    reading: 'O adubo já está pronto e disponível para venda.',
  },
  sold: {
    label: 'Aguardando retorno',
    emoji: '📦',
    reading: 'O adubo foi vendido. Quando chegar a vez desta participação, o valor será pago.',
  },
  paid: {
    label: 'Ciclo concluído',
    emoji: '✅',
    reading: 'O ciclo se completou e o valor foi pago.',
  },
};

// ─── Data Hook ───

function useParticipacaoData(userId: string | undefined) {
  const query = useQuery({
    queryKey: ['minha-participacao', userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_fifo_summary', {
        p_user_id: userId ?? null,
      } as any);
      if (error) throw error;

      const result = data as any;
      const globalByStatus = result.global as Record<string, number>;
      const myEntriesRaw = (result.my_entries || []) as QueueEntry[];

      const myByStatus = {
        pending: myEntriesRaw.filter(q => q.queue_status === 'pending').length,
        processing: myEntriesRaw.filter(q => q.queue_status === 'processing').length,
        ready: myEntriesRaw.filter(q => q.queue_status === 'ready').length,
        sold: myEntriesRaw.filter(q => q.queue_status === 'sold').length,
        paid: myEntriesRaw.filter(q => q.queue_status === 'paid').length,
      };

      const myUnpaid = myEntriesRaw
        .filter(e => e.queue_status !== 'paid')
        .sort((a, b) => a.queue_position - b.queue_position);

      return {
        queue: myEntriesRaw,
        myEntries: myEntriesRaw,
        myUnpaid,
        globalByStatus,
        myByStatus,
        totalGlobal: globalByStatus.total || 0,
        firstPosition: result.first_position,
        aheadCount: result.ahead_count || 0,
      };
    },
    enabled: true,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// ─── MicroHelp ───

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

// ─── PathCard ───

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

// ─── Detail Modal ───

function ParticipacaoDetailModal({
  entry,
  onClose,
}: {
  entry: QueueEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;

  const stages: ProStatus[] = ['pending', 'processing', 'ready', 'sold', 'paid'];
  const currentIdx = stages.indexOf(entry.queue_status);
  const info = statusHuman[entry.queue_status];

  return (
    <Dialog open={!!entry} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            Detalhes da participação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* ID */}
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Identificação</p>
            <p className="text-xl font-bold font-mono text-primary">
              #{entry.queue_position} · {entry.pro_code}
            </p>
          </div>

          {/* Stage dots */}
          <div className="flex items-center justify-center gap-1.5">
            {stages.map((s, idx) => (
              <React.Fragment key={s}>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                    idx <= currentIdx
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {statusHuman[s].emoji}
                </div>
                {idx < stages.length - 1 && (
                  <div className={cn('h-0.5 w-3', idx < currentIdx ? 'bg-primary' : 'bg-muted')} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Current status reading */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-1 text-center">
            <Badge>{info.label}</Badge>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">{info.reading}</p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Posição no ciclo</p>
              <p className="text-xl font-bold text-foreground">{entry.queue_position}º</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Entrada</p>
              <p className="text-sm font-medium text-foreground">
                {format(new Date(entry.queue_created_at), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>

          {entry.queue_status === 'paid' && entry.queue_paid_at && (
            <div className="text-center p-3 border border-dashed border-primary/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Valor recebido</p>
              <p className="text-2xl font-bold text-primary">R$ 2,00</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pago em {format(new Date(entry.queue_paid_at), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          )}

          {entry.queue_status !== 'paid' && (
            <div className="text-center p-3 border border-dashed border-primary/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Valor ao completar o ciclo</p>
              <p className="text-2xl font-bold text-primary">R$ 2,00</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ───

export default function FifoQueuePage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useParticipacaoData(user?.id);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [showAllMine, setShowAllMine] = useState(false);

  // Mark viewed — must be before early returns
  React.useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .update({ has_viewed_fifo: true })
      .eq('user_id', user.id)
      .eq('has_viewed_fifo', false)
      .then(() => {});
  }, [user]);

  // ── Error ──
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Não foi possível carregar sua participação</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tivemos um problema ao buscar seus dados. Tente novamente em instantes.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (isLoading || !data) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-80" />
          </div>
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { myEntries, myUnpaid, myByStatus, globalByStatus, totalGlobal, firstPosition, aheadCount } = data;
  const hasParticipation = myEntries.length > 0;
  const myPaidCount = myByStatus.paid;
  const myActiveCount = myEntries.length - myPaidCount;
  const totalReceived = myPaidCount * 2;
  const visibleEntries = showAllMine ? myUnpaid : myUnpaid.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* ═══ Header ═══ */}
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Minha participação</h1>
          <p className="text-muted-foreground leading-relaxed">
            Acompanhe onde está cada participação sua dentro do ciclo e entenda como ela avança.
          </p>
        </section>

        {/* ═══ BLOCO 1 — Resumo pessoal ═══ */}
        {hasParticipation ? (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Sua participação agora</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-muted-foreground">Em andamento</span>
                    <MicroHelp text="Participações que ainda estão passando por alguma etapa do ciclo." />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{myActiveCount}</p>
                  <p className="text-xs text-muted-foreground">Participações ativas no ciclo.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Ciclos concluídos</span>
                  <p className="text-2xl font-bold text-foreground">{myPaidCount}</p>
                  <p className="text-xs text-muted-foreground">Participações que já completaram o ciclo.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Valor recebido</span>
                  <p className="text-2xl font-bold text-primary">R$ {totalReceived.toFixed(2).replace('.', ',')}</p>
                  <p className="text-xs text-muted-foreground">Total já retornado pela sua participação.</p>
                </CardContent>
              </Card>
            </div>
          </section>
        ) : (
          <section>
            <Card className="border-dashed border-primary/20">
              <CardContent className="p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sprout className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Você ainda não tem participações</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                    Quando sua participação entrar no ciclo, ela vai aparecer aqui com todas as etapas que está percorrendo.
                  </p>
                </div>
                <Link to="/planos">
                  <Button className="earth-gradient gap-1.5">
                    <Sparkles className="w-4 h-4" /> Conhecer os planos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ═══ BLOCO 2 — Onde estão suas participações ═══ */}
        {hasParticipation && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Onde estão suas participações</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Cada participação passa por etapas reais até que o ciclo se complete.
              </p>
            </div>

            {/* Stage summary — personal */}
            <div className="space-y-3">
              {(['pending', 'processing', 'ready', 'sold', 'paid'] as ProStatus[]).map(status => {
                const count = myByStatus[status];
                if (count === 0) return null;
                const info = statusHuman[status];
                return (
                  <Card key={status} className={status === 'paid' ? 'border-primary/20 bg-primary/5' : ''}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <span className="text-2xl">{info.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{info.label}</span>
                          <Badge variant="secondary" className="text-xs">{count}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{info.reading}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Individual entries — first 5 expandable */}
            {myUnpaid.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Suas participações ativas ({myUnpaid.length}):
                </p>
                <div className="space-y-2">
                  {visibleEntries.map(entry => {
                    const info = statusHuman[entry.queue_status];
                    return (
                      <button
                        key={entry.queue_id}
                        onClick={() => setSelectedEntry(entry)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span>{info.emoji}</span>
                            <span className="text-sm font-mono font-medium text-foreground">
                              #{entry.queue_position}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {info.label}
                            </span>
                          </div>
                          <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
                {myUnpaid.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllMine(!showAllMine)}
                    className="gap-1 w-full text-muted-foreground"
                  >
                    {showAllMine ? (
                      <><ChevronUp className="w-4 h-4" /> Mostrar menos</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Ver todas ({myUnpaid.length})</>
                    )}
                  </Button>
                )}
              </div>
            )}
          </section>
        )}

        {/* ═══ BLOCO 3 — Como o ciclo avança ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Como o ciclo avança</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Cada participação percorre etapas reais até se completar. Ninguém interfere na ordem.
            </p>
          </div>
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="space-y-4">
                {[
                  {
                    emoji: '🌱',
                    title: 'Coleta e compostagem',
                    desc: 'O resíduo é coletado e transformado em adubo por compostagem natural. Esse processo leva tempo biológico real.',
                  },
                  {
                    emoji: '📦',
                    title: 'Venda do adubo',
                    desc: 'O adubo pronto é vendido a compradores reais. O valor da venda é o que movimenta o ciclo — não o ingresso de novas pessoas.',
                  },
                  {
                    emoji: '✅',
                    title: 'Retorno por ordem de chegada',
                    desc: 'O valor retorna para quem está na vez, em ordem cronológica. Cada participação paga vale R$ 2,00.',
                  },
                ].map(step => (
                  <div key={step.title} className="flex gap-3 items-start">
                    <span className="text-xl mt-0.5">{step.emoji}</span>
                    <div>
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 4 — Por que a ordem é justa ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Por que a ordem é justa</h2>
          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Ordem cronológica</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Quem entrou primeiro está na frente. Sempre.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Sem exceções</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ninguém fura a ordem. Indicações geram impacto, mas não alteram posições.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Movido por vendas reais</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      O ciclo só avança quando o adubo é vendido de verdade.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 5 — Panorama do ciclo (compacto, focado no usuário) ═══ */}
        {hasParticipation && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Panorama do ciclo</h2>
            <Card>
              <CardContent className="p-5 sm:p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  O ciclo está ativo e funcionando. Atualmente existem <span className="font-semibold text-foreground">{totalGlobal}</span> participações no sistema — <span className="font-semibold text-foreground">{globalByStatus.paid}</span> já completaram o ciclo.
                </p>

                {firstPosition && (
                  <div className="p-4 bg-primary/5 rounded-lg text-center space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Sua participação mais próxima está na posição
                    </p>
                    <p className="text-2xl font-bold text-primary">#{firstPosition}</p>
                    {aheadCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {aheadCount} {aheadCount === 1 ? 'participação à frente' : 'participações à frente'}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Quer ver todos os dados abertos do ciclo?{' '}
                  <Link to="/painel-publico/fila" className="text-primary hover:underline font-medium">
                    Acesse o painel público →
                  </Link>
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ═══ BLOCO 6 — Próximo passo ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Próximo passo</h2>
          <Card className="border-primary/15">
            <CardContent className="p-5 sm:p-6 space-y-3">
              {!hasParticipation ? (
                <>
                  <p className="text-foreground font-medium leading-relaxed">
                    Para acompanhar sua participação por aqui, primeiro você precisa entrar no ciclo.
                  </p>
                  <Link to="/planos">
                    <Button className="earth-gradient gap-1.5">
                      <Sparkles className="w-4 h-4" /> Conhecer os planos
                    </Button>
                  </Link>
                </>
              ) : myPaidCount === 0 ? (
                <>
                  <p className="text-foreground font-medium leading-relaxed">
                    Sua participação está no ciclo. Agora é acompanhar as etapas e, se quiser, direcionar para um sonho.
                  </p>
                  <Link to="/dreams">
                    <Button className="earth-gradient gap-1.5">
                      <Sparkles className="w-4 h-4" /> Direcionar para um sonho
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-foreground font-medium leading-relaxed">
                    Você já tem ciclos concluídos. Pode seguir acompanhando ou explorar formas de ampliar sua participação.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/dreams">
                      <Button className="earth-gradient gap-1.5">
                        <Sparkles className="w-4 h-4" /> Ver meus sonhos
                      </Button>
                    </Link>
                    <Link to="/assinatura">
                      <Button variant="outline" className="gap-1.5">
                        <TrendingUp className="w-4 h-4" /> Ampliar participação
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══ Continue sua jornada ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Continue sua jornada</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PathCard
              title="Minha jornada"
              text="Veja seu momento atual e o próximo passo mais importante."
              link="/jornada"
            />
            <PathCard
              title="Meus sonhos"
              text="Dê direção pessoal à sua participação."
              link="/dreams"
            />
            <PathCard
              title="Entender o ciclo"
              text="Veja como cada etapa funciona em detalhe."
              link="/ciclo"
            />
          </div>
        </section>

      </div>

      {/* Detail modal */}
      <ParticipacaoDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  );
}
