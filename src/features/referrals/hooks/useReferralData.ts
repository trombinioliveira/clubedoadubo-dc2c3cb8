import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

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
    queryKey: ['referred-users', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      // Get profiles referred by this user
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, created_at, last_login_at')
        .eq('referred_by', profile.id)
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];

      const fallbackUsers = profiles.map((p) => ({
        id: p.id,
        fullName: p.full_name,
        joinedAt: p.created_at,
        prosCount: 0,
        totalWeightGrams: 0,
        paidPros: 0,
        isActive: false,
        lastActivity: p.last_login_at,
      })) satisfies ReferredUser[];

      // For each referred user, get their PRO stats
      const userIds = profiles.map(p => p.user_id);
      
      const { data: pros, error: prosError } = await supabase
        .from('pros')
        .select('user_id, weight_grams, status')
        .in('user_id', userIds);

      if (prosError) {
        console.warn('[Referral] Could not load network PRO stats, showing referred users without PRO aggregation.', prosError);
        return fallbackUsers;
      }

      // Aggregate PRO data per user
      const prosMap = new Map<string, { count: number; weight: number; paid: number }>();
      pros?.forEach(pro => {
        const current = prosMap.get(pro.user_id) || { count: 0, weight: 0, paid: 0 };
        current.count++;
        current.weight += pro.weight_grams;
        if (pro.status === 'paid') current.paid++;
        prosMap.set(pro.user_id, current);
      });

      return profiles.map(p => {
        const proData = prosMap.get(p.user_id) || { count: 0, weight: 0, paid: 0 };
        return {
          id: p.id,
          fullName: p.full_name,
          joinedAt: p.created_at,
          prosCount: proData.count,
          totalWeightGrams: proData.weight,
          paidPros: proData.paid,
          isActive: proData.count > 0,
          lastActivity: p.last_login_at,
        } as ReferredUser;
      });
    },
    enabled: !!profile?.id,
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
      ? `https://clubedoadubo.com.br/u/${profile.referral_code}`
      : null,
  };
}
