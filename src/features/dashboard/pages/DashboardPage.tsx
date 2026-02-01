import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  DashboardHeader,
  QuickActionsCard,
  CycleResumeCard,
  DreamsResumeCard,
  EnvironmentalImpactCard,
  LevelReferralsCard,
  DailyHistoryCard,
  QrCodeModal
} from '../components';
import { AddProsPixModal } from '@/features/dreams/components/AddProsPixModal';
import { calculateLevelInfo } from '@/features/dreams/constants/levels';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);

  // Busca PROs do usuário
  const { data: pros = [] } = useQuery({
    queryKey: ['user-pros', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('pros')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Busca sonhos do usuário
  const { data: dreams = [] } = useQuery({
    queryKey: ['user-dreams', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Busca posição na fila FIFO
  const { data: fifoData } = useQuery({
    queryKey: ['user-fifo-position', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Busca o primeiro PRO não pago do usuário na fila
      const { data, error } = await supabase
        .from('fifo_queue')
        .select('position, pros!inner(user_id)')
        .eq('pros.user_id', user.id)
        .neq('status', 'paid')
        .order('position', { ascending: true })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Busca total na fila
      const { count } = await supabase
        .from('fifo_queue')
        .select('*', { count: 'exact', head: true });
      
      return {
        position: data?.position || null,
        total: count || 0
      };
    },
    enabled: !!user?.id,
  });

  // Cálculos derivados
  const totalPros = pros.length;
  const activePros = pros.filter(p => p.status !== 'paid').length;
  const hasActiveDream = dreams.some(d => d.current_amount < d.target_amount);
  const levelInfo = calculateLevelInfo(totalPros);
  
  // Nome do usuário para saudação
  const userName = profile?.full_name?.split(' ')[0] || 'Participante';
  const referralCode = profile?.referral_code || 'CODIGO';
  const pixKey = profile?.pix_key || profile?.cpf || 'chave-pix';

  // Handler para adicionar PROs a um sonho específico
  const handleAddProsToream = (dreamId: string) => {
    // Por enquanto, abre o modal de PIX genérico
    // Em uma implementação futura, poderia pré-selecionar o sonho
    setPixModalOpen(true);
  };

  // Estima dias para próximo pagamento (placeholder)
  const estimatedDays = Math.max(1, Math.round((fifoData?.position || 100) / 10));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header com saudação e botões */}
      <DashboardHeader
        userName={userName}
        onOpenPix={() => setPixModalOpen(true)}
        onOpenQrCode={() => setQrCodeModalOpen(true)}
      />

      {/* Modais */}
      <AddProsPixModal
        open={pixModalOpen}
        onOpenChange={setPixModalOpen}
        pixKey={pixKey}
        userName={userName}
      />

      <QrCodeModal
        open={qrCodeModalOpen}
        onOpenChange={setQrCodeModalOpen}
        referralCode={referralCode}
        userName={userName}
      />

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Ações Rápidas */}
        <QuickActionsCard
          totalPros={totalPros}
          hasActiveDream={hasActiveDream}
          prosToNextLevel={levelInfo.prosToNextLevel}
          onOpenPix={() => setPixModalOpen(true)}
        />

        {/* Grid principal */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Coluna esquerda */}
          <div className="space-y-6">
            {/* Resumo do Ciclo */}
            <CycleResumeCard
              totalPros={activePros}
              fifoPosition={fifoData?.position || null}
              totalInQueue={fifoData?.total || 0}
              estimatedDays={estimatedDays}
            />

            {/* Meus Sonhos */}
            <DreamsResumeCard
              dreams={dreams}
              onAddPros={handleAddProsToream}
            />
          </div>

          {/* Coluna direita */}
          <div className="space-y-6">
            {/* Impacto Ambiental */}
            <EnvironmentalImpactCard totalPros={totalPros} />

            {/* Nível & Indicações */}
            <LevelReferralsCard
              totalPros={totalPros}
              referralCode={referralCode}
              onOpenQrCode={() => setQrCodeModalOpen(true)}
            />
          </div>
        </div>

        {/* Histórico Diário */}
        <DailyHistoryCard
          history={[]}
          onRegisterAction={() => setPixModalOpen(true)}
        />

        {/* Callout educacional */}
        <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-border">
          <h3 className="font-bold text-foreground mb-2">💡 Fila justa, ondas de impacto</h3>
          <p className="text-sm text-muted-foreground">
            A fila FIFO é única e global — todos participam na mesma ordem justa. 
            Suas indicações criam <span className="font-semibold text-primary">ondas de impacto</span>, 
            mas nunca alteram a ordem da fila. Quando o adubo é vendido, quem está à frente recebe primeiro.
          </p>
        </div>
      </div>
    </div>
  );
}
