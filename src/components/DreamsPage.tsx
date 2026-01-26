import React, { useState } from 'react';
import { mockDreams, mockPros } from '@/data/mockData';
import { DreamCard } from './DreamCard';
import { CreateDreamModal } from './CreateDreamModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Sparkles, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Dream } from '@/types';

export const DreamsPage = () => {
  const [dreams, setDreams] = useState<Dream[]>(mockDreams);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Calculate totals from paid PROs
  const paidPros = mockPros.filter(p => p.status === 'paid');
  const totalEarned = paidPros.length * 2;
  const totalAllocated = dreams.reduce((sum, d) => sum + d.currentAmount, 0);
  const totalGoals = dreams.reduce((sum, d) => sum + d.targetAmount, 0);
  const overallProgress = totalGoals > 0 ? (totalAllocated / totalGoals) * 100 : 0;

  const handleCreateDream = (title: string, targetAmount: number) => {
    const newDream: Dream = {
      id: `dream-${Date.now()}`,
      userId: 'user-1',
      title,
      targetAmount,
      currentAmount: 0,
      createdAt: new Date(),
    };
    setDreams([...dreams, newDream]);
    toast.success('Sonho criado!', {
      description: `"${title}" foi adicionado aos seus sonhos`,
    });
  };

  const activeDreams = dreams.filter(d => d.currentAmount < d.targetAmount);
  const completedDreams = dreams.filter(d => d.currentAmount >= d.targetAmount);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-amber-500/10 to-transparent py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-amber-500" />
                Meus Sonhos
              </h1>
              <p className="text-muted-foreground mt-1">
                Transforme seus PROs em conquistas reais
              </p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)} variant="hero" size="lg">
              <Plus className="w-5 h-5" />
              Novo Sonho
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-status-paid/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-status-paid" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total recebido</p>
                <p className="text-xl font-bold text-foreground">R$ {totalEarned.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meta total</p>
                <p className="text-xl font-bold text-foreground">R$ {totalGoals.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progresso geral</p>
                <p className="text-xl font-bold text-foreground">{overallProgress.toFixed(0)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active dreams */}
        {activeDreams.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">
              Em andamento ({activeDreams.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {activeDreams.map((dream) => (
                <DreamCard key={dream.id} dream={dream} />
              ))}
            </div>
          </section>
        )}

        {/* Completed dreams */}
        {completedDreams.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">
              Concluídos ({completedDreams.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {completedDreams.map((dream) => (
                <DreamCard key={dream.id} dream={dream} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {dreams.length === 0 && (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum sonho ainda</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crie seu primeiro sonho e acompanhe seu progresso conforme seus PROs são pagos
            </p>
            <Button onClick={() => setCreateModalOpen(true)} variant="hero">
              <Plus className="w-5 h-5" />
              Criar primeiro sonho
            </Button>
          </div>
        )}

        {/* Educational callout */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-border">
          <h3 className="font-bold text-foreground mb-2">💡 Como os sonhos funcionam?</h3>
          <p className="text-sm text-muted-foreground">
            Cada vez que um PRO seu é pago (R$ 2,00), você pode direcionar esse valor para 
            seus sonhos. Crie metas realistas e acompanhe seu progresso visual. 
            Seus sonhos são alimentados pelo ciclo do Clube do Adubo!
          </p>
        </div>
      </div>

      {/* Create modal */}
      <CreateDreamModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onConfirm={handleCreateDream}
      />
    </div>
  );
};
