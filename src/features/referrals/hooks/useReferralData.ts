import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface ReferredUserRow {
  id: string;
  full_name: string;
  joined_at: string;
  last_activity: string | null;
  pros_count: number;
  total_weight_grams: number;
  paid_pros: number;
  is_active: boolean;
}

export interface ReferralImpact {
  totalReferrals: number;
  activeReferrals: number;
  totalProsFromNetwork: number;
  totalWeightGrams: number;
  co2AvoidedKg: number;
  fertilizerKg: number;
}

export interface ReferredUser {
  id: string;
  fullName: string;
  joinedAt: string;
  prosCount: number;
  totalWeightGrams: number;
  paidPros: number;
  isActive: boolean;
  lastActivity: string | null;
}

export function useReferralData() {
  const { user, profile } = useAuth();

  // Fetch user's referral stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('referral_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch users referred by the current user
  const { data: referredUsers, isLoading: referredLoading } = useQuery({
    queryKey: ['referred-users', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Use SECURITY DEFINER RPC to bypass RLS and get referred users safely
      const { data, error } = await supabase.rpc('get_my_referred_users', { p_user_id: user.id });
      
      if (error) {
        console.error('[Referral] get_my_referred_users RPC error:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) return [];
      
      return (data as unknown as ReferredUserRow[]).map((row) => ({
        id: row.id,
        fullName: row.full_name,
        joinedAt: row.joined_at,
        prosCount: row.pros_count,
        totalWeightGrams: row.total_weight_grams,
        paidPros: row.paid_pros,
        isActive: row.is_active,
        lastActivity: row.last_activity,
      } as ReferredUser));
    },
    enabled: !!user?.id,
  });

  // Fetch user's own PROs for impact calculation
  const { data: userPros, isLoading: prosLoading } = useQuery({
    queryKey: ['user-pros-impact', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('pros')
        .select('id, weight_grams, status, created_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate derived impact metrics
  const impact: ReferralImpact = {
    totalReferrals: referredUsers?.length || 0,
    activeReferrals: referredUsers?.filter(r => r.isActive).length || 0,
    totalProsFromNetwork: referredUsers?.reduce((sum, r) => sum + r.prosCount, 0) || 0,
    totalWeightGrams: referredUsers?.reduce((sum, r) => sum + r.totalWeightGrams, 0) || 0,
    co2AvoidedKg: ((referredUsers?.reduce((sum, r) => sum + r.totalWeightGrams, 0) || 0) / 1000) * 2.5,
    fertilizerKg: ((referredUsers?.reduce((sum, r) => sum + r.totalWeightGrams, 0) || 0) / 1000) * 0.6,
  };

  // User's own impact
  const ownImpact = {
    totalPros: userPros?.length || 0,
    paidPros: userPros?.filter(p => p.status === 'paid').length || 0,
    totalWeightGrams: userPros?.reduce((sum, p) => sum + p.weight_grams, 0) || 0,
    co2AvoidedKg: ((userPros?.reduce((sum, p) => sum + p.weight_grams, 0) || 0) / 1000) * 2.5,
    fertilizerKg: ((userPros?.reduce((sum, p) => sum + p.weight_grams, 0) || 0) / 1000) * 0.6,
  };

  return {
    profile,
    stats,
    referredUsers: referredUsers || [],
    impact,
    ownImpact,
    isLoading: statsLoading || referredLoading || prosLoading,
    referralCode: profile?.referral_code,
    referralLink: profile?.referral_code 
      ? `https://www.clubedoadubo.com.br/u/${profile.referral_code}`
      : null,
  };
}
