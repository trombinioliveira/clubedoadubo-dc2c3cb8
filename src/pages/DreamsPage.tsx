import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, Plus } from 'lucide-react';
import { HelpTooltip } from '@/components/shared/HelpTooltip';

// Components
import { AggregatedImpactCard } from '@/features/dreams/components/AggregatedImpactCard';
import { DreamCardWithLevels } from '@/features/dreams/components/DreamCardWithLevels';
import { NextLevelCard } from '@/features/dreams/components/NextLevelCard';
import { DreamCollectionsSection } from '@/features/dreams/components/DreamCollectionsSection';
import { FloatingPixButton } from '@/features/dreams/components/FloatingPixButton';
import { AddProsPixModal } from '@/features/dreams/components/AddProsPixModal';
import { CreateDreamModal } from '@/components/CreateDreamModal';
import { AllocateProModal } from '@/features/dreams/components/AllocateProModal';

// Constants
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

interface Profile {
  pix_key: string | null;
  full_name: string;
}

const DreamsPage = () => {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [pros, setPros] = useState<Pro[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const [dreamsRes, prosRes, profileRes] = await Promise.all([
      supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('pros')
        .select('id, status, dream_id')
        .eq('user_id', user.id),
      supabase
        .from('profiles')
        .select('pix_key, full_name')
        .eq('user_id', user.id)
        .single()
    ]);

    if (!dreamsRes.error) {
      const dreamsWithProgress = (dreamsRes.data as Dream[]).map(dream => {
        const allocatedPros = prosRes.data?.filter(p => p.dream_id === dream.id) || [];
        const paidPros = allocatedPros.filter(p => p.status === 'paid');
        const currentAmount = paidPros.length * 2;
        return {
          ...dream,
          current_amount: currentAmount,
          is_completed: currentAmount >= dream.target_amount
        };
      });
      setDreams(dreamsWithProgress);
    }

    if (!prosRes.error) {
      setPros(prosRes.data as Pro[] || []);
    }

    if (!profileRes.error) {
      setProfile(profileRes.data as Profile);
    }

    setIsLoading(false);
  };

  const createDream = async (title: string, targetAmount: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('dreams')
      .insert({
        user_id: user.id,
        title,
        target_amount: targetAmount
      });

    if (!error) {
      fetchData();
    }
  };

  const handleToggleReactivation = async (dreamId: string, enabled: boolean) => {
    // Em produção, salvaria no banco
    toast.success(enabled ? 'Reativação automática ativada!' : 'Reativação automática desativada');
  };

  const openAllocateModal = (dream: Dream) => {
    setSelectedDream(dream);
    setIsAllocateOpen(true);
  };

  const handleSelectCollection = (collection: typeof DREAM_COLLECTIONS[number]) => {
    setIsCreateOpen(true);
  };

  // Cálculos
  const activeDreams = dreams.filter(d => !d.is_completed);
  const completedDreams = dreams.filter(d => d.is_completed);
  
  const totalProsInDreams = pros.filter(p => p.dream_id).length;
  const totalUserPros = pros.length;
  
  const levelInfo = calculateLevelInfo(totalProsInDreams);

  // PROs alocados por sonho
  const getProsForDream = (dreamId: string) => 
    pros.filter(p => p.dream_id === dreamId).length;

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Meus Sonhos
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Transforme seu impacto em conquistas reais
            <HelpTooltip content="Os níveis crescem conforme PROs válidos entram no seu ciclo. O nível 21 é o limite máximo por CPF." />
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Novo Sonho
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Card Agregado de Impacto */}
          <AggregatedImpactCard
            totalProsInDreams={totalProsInDreams}
            totalDreams={dreams.length}
            completedDreams={completedDreams.length}
          />

          {/* Card Próximo Nível */}
          <NextLevelCard
            totalPros={totalProsInDreams}
            hasDreams={dreams.length > 0}
            onAddPros={() => setIsPixModalOpen(true)}
            onCreateDream={() => setIsCreateOpen(true)}
          />

          {/* Sonhos Ativos */}
          {activeDreams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                Sonhos em Crescimento
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeDreams.map((dream) => (
                  <DreamCardWithLevels
                    key={dream.id}
                    dream={dream}
                    allocatedPros={getProsForDream(dream.id)}
                    onAllocatePros={() => openAllocateModal(dream)}
                    onToggleReactivation={(enabled) => handleToggleReactivation(dream.id, enabled)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sonhos Concluídos */}
          {completedDreams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                Sonhos Realizados
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completedDreams.map((dream) => (
                  <DreamCardWithLevels
                    key={dream.id}
                    dream={dream}
                    allocatedPros={getProsForDream(dream.id)}
                    onAllocatePros={() => {}}
                    onToggleReactivation={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {dreams.length === 0 && (
            <div className="text-center py-12 px-4 bg-muted/30 rounded-2xl">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum sonho cadastrado</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Crie seu primeiro sonho e comece a transformar seu impacto em conquistas reais.
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Sonho
              </Button>
            </div>
          )}

          {/* Coleções de Sonhos */}
          <DreamCollectionsSection
            currentLevel={levelInfo.currentLevel}
            onSelectCollection={handleSelectCollection}
          />

          {/* Frase-guia */}
          <div className="text-center py-6">
            <p className="text-lg font-medium text-muted-foreground italic">
              "Um passo por vez, todos os dias, até o impacto máximo."
            </p>
          </div>
        </div>
      )}

      {/* Botão Flutuante PIX */}
      <FloatingPixButton onClick={() => setIsPixModalOpen(true)} />

      {/* Modais */}
      <CreateDreamModal 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onConfirm={createDream}
      />

      <AddProsPixModal
        open={isPixModalOpen}
        onOpenChange={setIsPixModalOpen}
        pixKey={profile?.pix_key || user?.id || 'demo-key'}
        userName={profile?.full_name || 'Usuário'}
      />

      {selectedDream && (
        <AllocateProModal
          open={isAllocateOpen}
          onOpenChange={setIsAllocateOpen}
          dream={selectedDream}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default DreamsPage;
