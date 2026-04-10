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
  // Public identity
  instagram: string | null;
}

export function usePublicProfile(referralCode: string | undefined) {
  return useQuery({
    queryKey: ['public-profile', referralCode],
    queryFn: async (): Promise<PublicProfileData | null> => {
      if (!referralCode) return null;

      // Use the database function to get public profile data
      const { data, error } = await supabase
        .rpc('get_public_profile_data', { p_referral_code: referralCode });

      if (error) {
        console.error('Error fetching public profile:', error);
        throw error;
      }

      if (!data) return null;

      return data as unknown as PublicProfileData;
    },
    enabled: !!referralCode,
    retry: 2,
    retryDelay: 1000,
  });
}
