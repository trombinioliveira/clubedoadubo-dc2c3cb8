import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  AlertCircle, RefreshCw, ArrowRight, Plus, Heart, Sprout,
  Star, PartyPopper, Compass, TrendingUp, Eye, Sparkles, HelpCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateDreamModal } from '@/components/CreateDreamModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ─── Types ───

interface DreamRow {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  is_completed: boolean;
  created_at: string;
}

type DreamStage = 'plantado' | 'crescimento' | 'ganhando_forma' | 'realizado';

function getDreamStage(current: number, target: number, isCompleted: boolean): DreamStage {
  if (isCompleted || current >= target) return 'realizado';
  const pct = target > 0 ? (current / target) * 100 : 0;
  if (pct >= 50) return 'ganhando_forma';
  if (pct > 0) return 'crescimento';
  return 'plantado';
}

const stageConfig: Record<DreamStage, { label: string; emoji: string; color: string; reading: string }> = {
  plantado: {
    label: 'Plantado',
    emoji: '🌱',
    color: 'text-muted-foreground',
    reading: 'Este sonho já está conectado à sua jornada.',
  },
  crescimento: {
    label: 'Em crescimento',
    emoji: '🌿',
    color: 'text-primary',
    reading: 'Ele ainda está no começo, mas já ganhou direção.',
  },
  ganhando_forma: {
    label: 'Ganhando forma',
    emoji: '🌳',
    color: 'text-primary',
    reading: 'Sua participação pode continuar dando forma a ele.',
  },
  realizado: {
    label: 'Realizado',
    emoji: '🎉',
    color: 'text-primary',
    reading: 'Este sonho já virou conquista na sua jornada.',
  },
};

// ─── User-level state ───

type PageState = 'sem_sonho' | 'inicio' | 'crescendo' | 'maduro';

function getPageState(dreams: DreamRow[]): PageState {
  if (dreams.length === 0) return 'sem_sonho';
  const active = dreams.filter(d => !d.is_completed);
  if (active.length === 0) return 'maduro'; // only completed dreams
  const hasGrowing = active.some(d => d.current_amount > 0);
  if (!hasGrowing) return 'inicio';
  if (dreams.length >= 3) return 'maduro';
  return 'crescendo';
}

// ─── Data Hook ───

function useDreamsData(userId: string | undefined) {
  const dreamsQuery = useQuery({
    queryKey: ['dreams-page', userId],
    queryFn: async () => {
      if (!userId) return { dreams: [] as DreamRow[], prosTotal: 0, prosConnected: 0 };

      const [dreamsRes, prosCountRes, prosConnectedRes] = await Promise.all([
        supabase.from('dreams').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('pros').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('pros').select('id', { count: 'exact', head: true }).eq('user_id', userId).not('dream_id', 'is', null),
      ]);

      if (dreamsRes.error) throw dreamsRes.error;
      if (prosCountRes.error) throw prosCountRes.error;
      if (prosConnectedRes.error) throw prosConnectedRes.error;

      // Compute current_amount from paid pros per dream
      const dreamsRaw = (dreamsRes.data ?? []) as DreamRow[];

      // For accurate per-dream amounts, fetch pros with dream_id and paid status
      const { data: paidPros, error: paidErr } = await supabase
        .from('pros')
        .select('dream_id')
        .eq('user_id', userId)
        .eq('status', 'paid')
        .not('dream_id', 'is', null);

      if (paidErr) throw paidErr;

      const paidByDream: Record<string, number> = {};
      (paidPros ?? []).forEach(p => {
        if (p.dream_id) paidByDream[p.dream_id] = (paidByDream[p.dream_id] ?? 0) + 1;
      });

      const dreams: DreamRow[] = dreamsRaw.map(d => {
        const paidCount = paidByDream[d.id] ?? 0;
        const currentAmount = paidCount * 2; // R$2 per paid PRO
        return {
          ...d,
          current_amount: currentAmount,
          is_completed: currentAmount >= d.target_amount,
        };
      });

      return {
        dreams,
        prosTotal: prosCountRes.count ?? 0,
        prosConnected: prosConnectedRes.count ?? 0,
      };
    },
    enabled: !!userId,
  });

  return {
    dreams: dreamsQuery.data?.dreams ?? [],
    prosTotal: dreamsQuery.data?.prosTotal ?? 0,
    prosConnected: dreamsQuery.data?.prosConnected ?? 0,
    isLoading: dreamsQuery.isLoading,
    isError: dreamsQuery.isError,
    refetch: dreamsQuery.refetch,
  };
}

// ─── Helper: format currency ───

function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

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

// ─── Micro Help ───

function MicroHelp({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Page ───

const DreamsPage = () => {
  const { user } = useAuth();
  const { dreams, prosTotal, prosConnected, isLoading, isError, refetch } = useDreamsData(user?.id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const activeDreams = dreams.filter(d => !d.is_completed);
  const completedDreams = dreams.filter(d => d.is_completed);
  const pageState = getPageState(dreams);

  const handleCreateDream = async (title: string, targetAmount: number) => {
    if (!user) return;
    await supabase.from('dreams').insert({ user_id: user.id, title, target_amount: targetAmount });
    refetch();
  };

  // ── Error ──
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Não foi possível carregar seus sonhos</h2>
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
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-80" />
          </div>
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* ═══ Header ═══ */}
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Meus sonhos</h1>
          <p className="text-muted-foreground leading-relaxed">
            Transforme sua participação em construções reais, no seu ritmo.
          </p>
        </section>

        {/* ═══ BLOCO 1 — Seus sonhos em construção ═══ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Seus sonhos em construção</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Aqui aparecem os sonhos que já estão vivos na sua jornada e que podem ganhar forma com o tempo.
              </p>
            </div>
            {dreams.length > 0 && (
              <Button size="sm" onClick={() => setIsCreateOpen(true)} className="earth-gradient gap-1.5 shrink-0">
                <Plus className="w-4 h-4" /> Novo sonho
              </Button>
            )}
          </div>

          {/* Active Dreams */}
          {activeDreams.length > 0 && (
            <div className="space-y-4">
              {activeDreams.map(dream => {
                const stage = getDreamStage(dream.current_amount, dream.target_amount, dream.is_completed);
                const cfg = stageConfig[stage];
                const pct = dream.target_amount > 0 ? Math.min(100, (dream.current_amount / dream.target_amount) * 100) : 0;

                return (
                  <Card key={dream.id} className="border-primary/15">
                    <CardContent className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-lg truncate">{dream.title}</h3>
                          <span className={cn('inline-flex items-center gap-1.5 text-sm', cfg.color)}>
                            <span>{cfg.emoji}</span> {cfg.label}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                          {formatBRL(dream.current_amount)} / {formatBRL(dream.target_amount)}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        {cfg.reading}
                      </p>

                      <div className="space-y-1">
                        <Progress value={pct} className="h-2" />
                        <p className="text-xs text-muted-foreground">{Math.round(pct)}% do caminho</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty state — no dreams at all */}
          {dreams.length === 0 && (
            <Card className="border-dashed border-primary/20">
              <CardContent className="p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Nenhum sonho criado ainda</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                    Quando você cria um sonho, sua participação ganha direção pessoal e fica mais fácil acompanhar sua evolução. Comece por algo pequeno — até um sonho de R$ 2 já mostra que o ciclo funciona de verdade.
                  </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient gap-1.5">
                  <Sparkles className="w-4 h-4" /> Criar meu primeiro sonho
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* ═══ BLOCO 2 — O que já está conectado à sua jornada ═══ */}
        {dreams.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">O que já está conectado à sua jornada</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Veja, de forma rápida, o panorama atual da sua construção.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Sonhos ativos</span>
                  <p className="text-2xl font-bold text-foreground">{activeDreams.length}</p>
                  <p className="text-xs text-muted-foreground">Tudo o que você está construindo agora.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Sonhos realizados</span>
                  <p className="text-2xl font-bold text-foreground">{completedDreams.length}</p>
                  <p className="text-xs text-muted-foreground">O que já virou conquista dentro da sua jornada.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-muted-foreground">Participação conectada</span>
                    <MicroHelp text="Indica quantas participações já foram direcionadas a algum sonho seu. Quanto mais participações conectadas, mais direção sua jornada ganha." />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{prosConnected}</p>
                  <p className="text-xs text-muted-foreground">O quanto da sua jornada já ganhou direção por meio dos seus sonhos.</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* ═══ BLOCO 3 — Como seus sonhos avançam ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Como seus sonhos avançam</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Os sonhos não ficam parados. Eles ganham forma conforme sua participação segue em movimento.
            </p>
          </div>
          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { emoji: '🌱', label: 'Plantado', desc: 'Ainda no início' },
                  { emoji: '🌿', label: 'Em crescimento', desc: 'Já ganhando forma' },
                  { emoji: '🌳', label: 'Ganhando forma', desc: 'Avançando com constância' },
                  { emoji: '🎉', label: 'Realizado', desc: 'Meta alcançada!' },
                ].map(s => (
                  <div key={s.label} className="text-center space-y-1">
                    <span className="text-2xl">{s.emoji}</span>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cada participação paga no ciclo contribui com R$ 2,00 para o sonho ao qual está conectada. Sonhos menores podem ser realizados mais rápido, ajudando você a sentir cedo que o ciclo funciona de verdade.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 4 — Próximo passo para continuar construindo ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Próximo passo para continuar construindo</h2>
          <Card className="border-primary/15">
            <CardContent className="p-5 sm:p-6 space-y-3">
              {pageState === 'sem_sonho' && (
                <>
                  <p className="text-foreground font-medium leading-relaxed">
                    Seu próximo passo é criar o primeiro sonho que você quer construir por aqui.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Quando você cria um sonho, sua participação ganha direção pessoal e fica mais fácil acompanhar sua evolução.
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient gap-1.5">
                    <Sparkles className="w-4 h-4" /> Criar meu primeiro sonho
                  </Button>
                </>
              )}
              {pageState === 'inicio' && (
                <>
                  <p className="text-foreground font-medium leading-relaxed">
                    Seu sonho já está criado. Agora ele precisa ganhar conexão com a sua participação.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Que tal criar mais um sonho pequeno para sentir o ciclo funcionando cedo? Sonhos de R$ 2 a R$ 20 já mostram resultados reais.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient gap-1.5">
                      <Plus className="w-4 h-4" /> Criar outro sonho
                    </Button>
                    <Link to="/fifo">
                      <Button variant="outline" className="gap-1.5">
                        <Eye className="w-4 h-4" /> Ver minha participação
                      </Button>
                    </Link>
                  </div>
                </>
              )}
              {pageState === 'crescendo' && (
                <>
                  <p className="text-foreground font-medium leading-relaxed">
                    Seus sonhos já estão ganhando forma. Continue acompanhando a evolução deles por aqui.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Você pode criar novos sonhos para diversificar sua construção ou acompanhar como sua participação avança no ciclo.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient gap-1.5">
                      <Plus className="w-4 h-4" /> Criar mais um sonho
                    </Button>
                    <Link to="/fifo">
                      <Button variant="outline" className="gap-1.5">
                        <Eye className="w-4 h-4" /> Ver minha participação
                      </Button>
                    </Link>
                  </div>
                </>
              )}
              {pageState === 'maduro' && (
                <>
                  <p className="text-foreground font-medium leading-relaxed">
                    Seu próximo passo é organizar o que já está em construção e decidir onde quer concentrar sua jornada agora.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Com vários sonhos em andamento, vale escolher em qual focar e, se quiser, criar novos desafios para sua jornada.
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient gap-1.5">
                    <Plus className="w-4 h-4" /> Organizar meus sonhos
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 5 — Inspirações para a sua jornada ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Inspirações para a sua jornada</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Cada jornada é única. Estas referências existem para inspirar possibilidades, não para virar regra.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { emoji: '🌱', label: 'Começando', desc: 'Sonhos de R$ 2 a R$ 20 — sinta o ciclo funcionando cedo.', examples: 'Um café especial, um presente simbólico' },
              { emoji: '📱', label: 'Conforto', desc: 'Sonhos de R$ 50 a R$ 500 — rotina e conforto no dia a dia.', examples: 'Conta de celular, livro, assinatura' },
              { emoji: '✈️', label: 'Qualidade de vida', desc: 'Sonhos de R$ 500 a R$ 2.000 — experiências e melhorias.', examples: 'Viagem curta, curso, equipamento' },
              { emoji: '🏠', label: 'Projetos maiores', desc: 'Sonhos a partir de R$ 2.000 — construções de longo prazo.', examples: 'Reforma, entrada de um bem, projeto pessoal' },
            ].map(c => (
              <Card key={c.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.emoji}</span>
                    <h3 className="font-semibold text-foreground">{c.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                  <p className="text-xs text-muted-foreground italic">{c.examples}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Ao longo do tempo, você pode criar quantos sonhos quiser. Não há pressa nem cobrança — o importante é que cada sonho faça sentido para você.
          </p>
        </section>

        {/* ═══ BLOCO 6 — Sonhos realizados ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Sonhos realizados</h2>

          {completedDreams.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cada sonho realizado mostra que o ciclo pode ganhar forma na sua vida de maneira concreta. Mesmo as primeiras pequenas realizações têm muito valor, porque ajudam você a sentir cedo que sua jornada está acontecendo de verdade.
              </p>
              <div className="space-y-3">
                {completedDreams.map(dream => (
                  <Card key={dream.id} className="border-primary/20 bg-primary/5">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <PartyPopper className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{dream.title}</h3>
                        <p className="text-sm text-primary">{formatBRL(dream.target_amount)} realizado</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Realizar um sonho não encerra sua jornada. Também pode abrir novos caminhos, novos focos e novas construções.
              </p>
            </>
          ) : (
            <Card>
              <CardContent className="p-5 sm:p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Quando um sonho se realiza, sua jornada ganha uma prova concreta do ciclo. Você pode começar por sonhos pequenos para sentir isso mais cedo e seguir construindo no seu ritmo.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* ═══ Continue sua jornada ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Continue sua jornada</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PathCard
              title="Voltar para minha Jornada"
              text="Veja seu momento atual e o próximo passo mais importante."
              link="/jornada"
            />
            <PathCard
              title="Entender o ciclo"
              text="Veja como funciona cada etapa da sua participação."
              link="/ciclo"
            />
            <PathCard
              title="Acompanhar minha participação"
              text="Veja onde sua participação está no ciclo."
              link="/fifo"
            />
          </div>
        </section>

      </div>

      {/* ── Create Dream Modal ── */}
      <CreateDreamModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onConfirm={handleCreateDream}
      />
    </div>
  );
};

export default DreamsPage;
