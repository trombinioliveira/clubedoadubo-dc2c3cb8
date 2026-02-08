import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicProfileData {
  publicName: string;
  city: string | null;
  memberSince: string;
  // Impact metrics derived from PROs
  totalPros: number;
  totalWeightKg: number;
  co2AvoidedKg: number;
  fertilizerKg: number;
  // Seal/badge info
  sealActive: boolean;
  sealLabel: string | null;
  currentLevel: number;
  // Network impact
  referralsCount: number;
  networkPros: number;
}

export function usePublicProfile(referralCode: string | undefined) {
  return useQuery({
    queryKey: ['public-profile', referralCode],
    queryFn: async (): Promise<PublicProfileData | null> => {
      if (!referralCode) return null;

      // First, find the profile by referral code
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, created_at')
        .eq('referral_code', referralCode.toUpperCase())
        .maybeSingle();
      
      if (profileError || !profile) return null;

      // Get PRO stats for this user
      const { data: pros, error: prosError } = await supabase
        .from('pros')
        .select('weight_grams, status')
        .eq('user_id', profile.user_id);
      
      if (prosError) throw prosError;

      // Get referral stats
      const { data: stats, error: statsError } = await supabase
        .from('referral_stats')
        .select('current_level, direct_pros, recurring_pros')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      // Count how many people this user referred
      const { count: referralsCount, error: refError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by', profile.id);

      // Get PROs from referred users (network impact)
      const { data: referredProfiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('referred_by', profile.id);

      let networkPros = 0;
      if (referredProfiles && referredProfiles.length > 0) {
        const userIds = referredProfiles.map(p => p.user_id);
        const { count } = await supabase
          .from('pros')
          .select('id', { count: 'exact', head: true })
          .in('user_id', userIds);
        networkPros = count || 0;
      }

      // Calculate metrics
      const totalPros = pros?.length || 0;
      const totalWeightGrams = pros?.reduce((sum, p) => sum + p.weight_grams, 0) || 0;
      const totalWeightKg = totalWeightGrams / 1000;
      const co2AvoidedKg = totalWeightKg * 2.5;
      const fertilizerKg = totalWeightKg * 0.6;

      // Generate public name (first name + last initial)
      const nameParts = profile.full_name.split(' ');
      const publicName = nameParts.length > 1 
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`
        : nameParts[0];

      // Determine seal status based on level
      const currentLevel = stats?.current_level || 1;
      const levelLabels: Record<number, string> = {
        1: 'Iniciante',
        2: 'Ativo',
        3: 'Embaixador',
        4: 'Líder',
      };

      return {
        publicName,
        city: null, // Not exposing city for privacy
        memberSince: profile.created_at,
        totalPros,
        totalWeightKg,
        co2AvoidedKg,
        fertilizerKg,
        sealActive: totalPros > 0,
        sealLabel: levelLabels[currentLevel] || 'Iniciante',
        currentLevel,
        referralsCount: referralsCount || 0,
        networkPros,
      };
    },
    enabled: !!referralCode,
  });
}
