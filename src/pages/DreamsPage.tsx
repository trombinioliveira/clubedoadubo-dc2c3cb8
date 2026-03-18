import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Sparkles, Plus, Heart, ArrowRight, Trophy, Compass, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

import { DreamCardWithLevels } from '@/features/dreams/components/DreamCardWithLevels';
import { DreamCollectionsSection } from '@/features/dreams/components/DreamCollectionsSection';
import { CreateDreamModal } from '@/components/CreateDreamModal';
import { AllocateProModal } from '@/features/dreams/components/AllocateProModal';
import { calculateLevelInfo, DREAM_COLLECTIONS } from '@/features/dreams/constants/levels';

interface Dream {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  is_completed: boolean;
  created_at: string;
  auto_reactivate?: boolean;
}

interface Pro {
  id: string;
  status: 'pending' | 'processing' | 'ready' | 'sold' | 'paid';
  dream_id: string | null;
}

const DreamsPage = () => {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [pros, setPros] = useState<Pro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    const [dreamsRes, prosRes] = await Promise.all([
      supabase.from('dreams').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('pros').select('id, status, dream_id').eq('user_id', user.id),
    ]);
    if (!dreamsRes.error) {
      const dreamsWithProgress = (dreamsRes.data as Dream[]).map(dream => {
        const allocatedPros = prosRes.data?.filter(p => p.dream_id === dream.id) || [];
        const paidPros = allocatedPros.filter(p => p.status === 'paid');
        const currentAmount = paidPros.length * 2;
        return { ...dream, current_amount: currentAmount, is_completed: currentAmount >= dream.target_amount };
      });
      setDreams(dreamsWithProgress);
    }
    if (!prosRes.error) setPros(prosRes.data as Pro[] || []);
    setIsLoading(false);
  };

  const createDream = async (title: string, targetAmount: number) => {
    if (!user) return;
    const { error } = await supabase.from('dreams').insert({ user_id: user.id, title, target_amount: targetAmount });
    if (!error) fetchData();
  };

  const handleToggleReactivation = async (_dreamId: string, enabled: boolean) => {
    toast.success(enabled ? 'Reativação automática ativada!' : 'Reativação automática desativada');
  };

  const openAllocateModal = (dream: Dream) => {
    setSelectedDream(dream);
    setIsAllocateOpen(true);
  };

  const activeDreams = dreams.filter(d => !d.is_completed);
  const completedDreams = dreams.filter(d => d.is_completed);
  const totalProsInDreams = pros.filter(p => p.dream_id).length;
  const levelInfo = calculateLevelInfo(totalProsInDreams);
  const getProsForDream = (dreamId: string) => pros.filter(p => p.dream_id === dreamId).length;

  const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  // Dream state for "next step" block
  const dreamStage = dreams.length === 0 ? 'none' : activeDreams.length > 0 && activeDreams.some(d => d.current_amount > 0) ? 'growing' : activeDreams.length > 0 ? 'started' : 'mature';

  // Human-readable state for each dream
  const getDreamState = (dream: Dream) => {
    if (dream.is_completed) return { label: 'Realizado', emoji: '🎉' };
    const pct = dream.target_amount > 0 ? (dream.current_amount / dream.target_amount) * 100 : 0;
    if (pct >= 75) return { label: 'Ganhando forma', emoji: '🌳' };
    if (pct >= 25) return { label: 'Em crescimento', emoji: '🌿' };
    return { label: 'Plantado', emoji: '🌱' };
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
      {/* ========== HEADER ========== */}
      <motion.div {...fadeIn} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Meus sonhos</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Transforme sua participação em construções reais, no seu ritmo.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient gap-1.5 self-start">
            <Plus className="w-4 h-4" />
            Novo sonho
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-10">

          {/* ========== BLOCO 1 — Sonhos em construção ========== */}
          {activeDreams.length > 0 && (
            <motion.div {...fadeIn} transition={{ delay: 0.05 }}>
              <h2 className="text-xl font-semibold text-foreground mb-1">Seus sonhos em construção</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Aqui aparecem os sonhos que já estão vivos na sua jornada e que podem ganhar forma com o tempo.
              </p>
              <div className="space-y-4">
                {activeDreams.map((dream) => {
                  const state = getDreamState(dream);
                  const pct = dream.target_amount > 0 ? Math.min((dream.current_amount / dream.target_amount) * 100, 100) : 0;
                  return (
                    <Card key={dream.id} className="border-primary/15">
                      <CardContent className="p-4 sm:p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{dream.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <span>{state.emoji}</span> {state.label}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => openAllocateModal(dream)} className="gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Conectar
                          </Button>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>R$ {dream.current_amount.toFixed(0)} de R$ {dream.target_amount.toFixed(0)}</span>
                            <span>{Math.round(pct)}%</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                        <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                          {pct === 0 && 'Este sonho já está conectado à sua jornada.'}
                          {pct > 0 && pct < 50 && 'Ele ainda está no começo, mas já ganhou direção.'}
                          {pct >= 50 && pct < 100 && 'Sua participação pode continuar dando forma a ele.'}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ========== Empty State ========== */}
          {dreams.length === 0 && (
            <motion.div {...fadeIn} transition={{ delay: 0.05 }}>
              <Card className="bg-muted/30 border-border">
                <CardContent className="p-6 sm:p-8 text-center space-y-3">
                  <div className="text-5xl">💭</div>
                  <h3 className="text-lg font-semibold text-foreground">Nenhum sonho criado ainda</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Quando um sonho se realiza, sua jornada ganha uma prova concreta do ciclo. Você pode começar por sonhos pequenos para sentir isso mais cedo e seguir construindo no seu ritmo.
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient gap-1.5">
                    <Plus className="w-4 h-4" />
                    Criar meu primeiro sonho
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ========== BLOCO 2 — O que já está conectado ========== */}
          {dreams.length > 0 && (
            <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
              <h2 className="text-xl font-semibold text-foreground mb-1">O que já está conectado à sua jornada</h2>
              <p className="text-sm text-muted-foreground mb-4">Veja, de forma rápida, o panorama atual da sua construção.</p>
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-2xl font-bold text-foreground">{activeDreams.length}</p>
                    <p className="text-xs text-muted-foreground">Sonhos ativos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-2xl font-bold text-foreground">{completedDreams.length}</p>
                    <p className="text-xs text-muted-foreground">Realizados</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-2xl font-bold text-foreground">{totalProsInDreams}</p>
                    <p className="text-xs text-muted-foreground">Conectados</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ========== BLOCO 3 — Como seus sonhos avançam ========== */}
          {dreams.length > 0 && (
            <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
              <h2 className="text-xl font-semibold text-foreground mb-1">Como seus sonhos avançam</h2>
              <p className="text-sm text-muted-foreground mb-4">Os sonhos não ficam parados. Eles ganham forma conforme sua participação segue em movimento.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { emoji: '🌱', label: 'Ainda no início' },
                  { emoji: '🌿', label: 'Ganhando forma' },
                  { emoji: '🌳', label: 'Avançando' },
                  { emoji: '🎉', label: 'Realizado' },
                ].map(({ emoji, label }) => (
                  <div key={label} className="text-center p-3 rounded-xl bg-muted/30 border border-border">
                    <div className="text-2xl mb-1">{emoji}</div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ========== BLOCO 4 — Próximo passo ========== */}
          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-semibold text-foreground mb-2">Próximo passo para continuar construindo</h2>
            <Card>
              <CardContent className="p-5 sm:p-6 space-y-3">
                {dreamStage === 'none' && (
                  <>
                    <p className="text-foreground font-medium">Seu próximo passo é criar o primeiro sonho que você quer construir por aqui.</p>
                    <p className="text-sm text-muted-foreground">Quando você cria um sonho, sua participação ganha direção pessoal e fica mais fácil acompanhar sua evolução.</p>
                    <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient gap-1.5">
                      <Plus className="w-4 h-4" /> Criar meu primeiro sonho
                    </Button>
                  </>
                )}
                {dreamStage === 'started' && (
                  <>
                    <p className="text-foreground font-medium">Seu próximo passo é continuar dando forma ao que você quer construir.</p>
                    <p className="text-sm text-muted-foreground">Ao seguir construindo, seu sonho deixa de ser só uma ideia e ganha presença real na sua jornada.</p>
                    <Link to="/planos#inicio">
                      <Button className="earth-gradient gap-1.5">
                        <ArrowRight className="w-4 h-4" /> Continuar construindo
                      </Button>
                    </Link>
                  </>
                )}
                {dreamStage === 'growing' && (
                  <>
                    <p className="text-foreground font-medium">Seu próximo passo é acompanhar o que já está em movimento e seguir fortalecendo sua construção.</p>
                    <p className="text-sm text-muted-foreground">Seu sonho já começou a ganhar forma. Agora vale acompanhar sua evolução com mais clareza.</p>
                    <Link to="/fifo">
                      <Button className="earth-gradient gap-1.5">
                        <ArrowRight className="w-4 h-4" /> Acompanhar minha participação
                      </Button>
                    </Link>
                  </>
                )}
                {dreamStage === 'mature' && (
                  <>
                    <p className="text-foreground font-medium">Seu próximo passo é organizar o que já está em construção e decidir onde quer concentrar sua jornada agora.</p>
                    <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient gap-1.5">
                      <Plus className="w-4 h-4" /> Criar outro sonho
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ========== BLOCO 5 — Inspirações ========== */}
          <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
            <h2 className="text-xl font-semibold text-foreground mb-1">Inspirações para a sua jornada</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Cada jornada é única. Estas referências existem para inspirar possibilidades, não para virar regra.
            </p>
            <DreamCollectionsSection
              currentLevel={levelInfo.currentLevel}
              onSelectCollection={() => setIsCreateOpen(true)}
            />
          </motion.div>

          {/* ========== BLOCO 6 — Sonhos realizados ========== */}
          {completedDreams.length > 0 && (
            <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
              <h2 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Sonhos realizados
              </h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Cada sonho realizado mostra que o ciclo pode ganhar forma na sua vida de maneira concreta. Realizar um sonho não encerra sua jornada — também pode abrir novos caminhos e novas construções.
              </p>
              <div className="space-y-3">
                {completedDreams.map((dream) => (
                  <Card key={dream.id} className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <p className="font-medium text-foreground text-sm">{dream.title}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {dream.current_amount.toFixed(0)} — Realizado
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Modais */}
      <CreateDreamModal open={isCreateOpen} onOpenChange={setIsCreateOpen} onConfirm={createDream} />
      {selectedDream && (
        <AllocateProModal open={isAllocateOpen} onOpenChange={setIsAllocateOpen} dream={selectedDream} onSuccess={fetchData} />
      )}
    </div>
  );
};

export default DreamsPage;
