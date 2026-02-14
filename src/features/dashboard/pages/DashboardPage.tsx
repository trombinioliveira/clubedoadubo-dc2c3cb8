import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  DashboardHeader,
  DreamsResumeCard,
  DailyHistoryCard,
  QrCodeModal,
  FloatingAddProsCTA,
  ImpactMissionsSection,
  CollectiveImpactCard,
  CloseCycleSection,
  LevelProgressCard,
  FifoEducationCard
} from '../components';
import { AddProsPixModal } from '@/features/dreams/components/AddProsPixModal';

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

  // Check if missions module is enabled (also controls Daily History)
  const { data: missionsEnabled = true } = useQuery({
    queryKey: ['site-settings', 'missions_enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'missions_enabled')
        .single();
      if (error) return true;
      return (data?.value as any)?.enabled ?? true;
    },
  });

  // Busca posição na fila FIFO
  const { data: fifoData } = useQuery({
    queryKey: ['user-fifo-position', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('fifo_queue')
        .select('position, pros!inner(user_id)')
        .eq('pros.user_id', user.id)
        .neq('status', 'paid')
        .order('position', { ascending: true })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
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

  // Derived values
  const totalPros = pros.length;
  const userName = profile?.full_name?.split(' ')[0] || 'Participante';
  const referralCode = profile?.referral_code || 'CODIGO';
  const pixKey = profile?.pix_key || profile?.cpf || 'chave-pix';
  const estimatedDays = Math.max(1, Math.round((fifoData?.position || 100) / 10));

  const handleAddProsToream = (dreamId: string) => {
    setPixModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <DashboardHeader
        userName={userName}
        onOpenPix={() => setPixModalOpen(true)}
        onOpenQrCode={() => setQrCodeModalOpen(true)}
      />

      {/* Floating CTA - Main action axis */}
      <FloatingAddProsCTA onClick={() => setPixModalOpen(true)} />

      {/* Modals */}
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

      {/* Main content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        
        {/* 1. Impact Missions - Rotating Cards */}
        <ImpactMissionsSection 
          onOpenPix={() => setPixModalOpen(true)}
          referralCode={referralCode}
        />

        {/* 2. Main Grid - Impact + Progress */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Collective Environmental Impact */}
          <CollectiveImpactCard 
            userPros={totalPros}
            onAddPro={() => setPixModalOpen(true)}
          />

          {/* Level Progress */}
          <LevelProgressCard 
            totalPros={totalPros}
            onOpenPix={() => setPixModalOpen(true)}
          />
        </div>

        {/* 3. Dreams Resume */}
        <DreamsResumeCard
          dreams={dreams}
          onAddPros={handleAddProsToream}
        />

        {/* 4. Close the Cycle Section */}
        <CloseCycleSection />

        {/* 5. Daily History - linked to missions toggle */}
        {missionsEnabled && (
          <DailyHistoryCard
            history={[]}
            onRegisterAction={() => setPixModalOpen(true)}
          />
        )}

        {/* 6. FIFO Education Card */}
        <FifoEducationCard
          fifoPosition={fifoData?.position || null}
          totalInQueue={fifoData?.total || 0}
          estimatedDays={estimatedDays}
        />
      </div>
    </div>
  );
}
