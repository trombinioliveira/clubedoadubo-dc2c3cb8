import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Leaf, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useReferralData } from '../hooks/useReferralData';
import { ReferralLinkCard } from '../components/ReferralLinkCard';
import { ImpactMetricsGrid } from '../components/ImpactMetricsGrid';
import { ReferredUsersList } from '../components/ReferredUsersList';
import { ImpactCardsSection } from '@/components/ImpactCardsSection';
import { CommissionPreferenceSelector } from '@/components/CommissionPreferenceSelector';
import { CommissionSimulator } from '@/components/CommissionSimulator';
import { Skeleton } from '@/components/ui/skeleton';

export function ReferralsPage() {
  const { user, profile: authProfile } = useAuth();
  const { 
    profile, 
    stats, 
    referredUsers, 
    impact, 
    ownImpact, 
    isLoading, 
    referralCode, 
    referralLink 
  } = useReferralData();

  // Determine commission tier from stats
  const currentLevel = stats?.current_level || 1;
  const tierLabels: Record<number, { label: string; rate: number }> = {
    1: { label: 'Iniciante', rate: 5 },
    2: { label: 'Ativo', rate: 7 },
    3: { label: 'Embaixador', rate: 10 },
    4: { label: 'Líder', rate: 15 },
  };
  const currentTier = tierLabels[currentLevel] || tierLabels[1];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-secondary/10 to-transparent py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Share2 className="w-8 h-8 text-secondary" />
                Minhas Indicações
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe sua rede e o impacto na economia circular
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Referral Link Card */}
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <ReferralLinkCard 
            referralCode={referralCode || null} 
            referralLink={referralLink || null} 
          />
        )}

        {/* Impact Metrics Summary */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <ImpactMetricsGrid impact={impact} ownImpact={ownImpact} />
        )}

        {/* Main Tabs Navigation */}
        <Tabs defaultValue="impacto" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="impacto" className="text-xs sm:text-sm py-2 px-3 rounded-lg">
              <Leaf className="w-4 h-4 mr-1 hidden sm:inline" />
              Meu Impacto
            </TabsTrigger>
            <TabsTrigger value="comissao" className="text-xs sm:text-sm py-2 px-3 rounded-lg">
              <DollarSign className="w-4 h-4 mr-1 hidden sm:inline" />
              Comissão
            </TabsTrigger>
            <TabsTrigger value="simulador" className="text-xs sm:text-sm py-2 px-3 rounded-lg">
              <TrendingUp className="w-4 h-4 mr-1 hidden sm:inline" />
              Simulador
            </TabsTrigger>
            <TabsTrigger value="rede" className="text-xs sm:text-sm py-2 px-3 rounded-lg">
              <Users className="w-4 h-4 mr-1 hidden sm:inline" />
              Minha Rede
            </TabsTrigger>
          </TabsList>

          {/* Meu Impacto Tab */}
          <TabsContent value="impacto" className="mt-6">
            <ImpactCardsSection 
              directPros={stats?.direct_pros || 0}
              recurringPros={stats?.recurring_pros || 0}
              globalPros={stats?.global_pros_received || 0}
              fifoPosition={0}
              currentGoal={stats?.fifo_goal_current || 2}
              statusBadge={currentTier.label}
            />
          </TabsContent>

          {/* Comissão Tab */}
          <TabsContent value="comissao" className="mt-6">
            <CommissionPreferenceSelector 
              userId={user?.id || ''}
              currentPreference={authProfile?.commission_preference || 'pros'}
            />
          </TabsContent>

          {/* Simulador Tab */}
          <TabsContent value="simulador" className="mt-6">
            <CommissionSimulator 
              currentLevel={currentLevel}
              currentRate={currentTier.rate}
              activeReferrals={impact.activeReferrals}
            />
          </TabsContent>

          {/* Minha Rede Tab */}
          <TabsContent value="rede" className="mt-6">
            <ReferredUsersList 
              users={referredUsers} 
              isLoading={isLoading} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
