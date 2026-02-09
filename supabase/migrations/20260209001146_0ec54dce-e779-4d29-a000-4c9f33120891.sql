-- Create a secure view for public profile data that doesn't expose sensitive information
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  p.referral_code,
  p.created_at as member_since,
  -- Only expose first name + last initial for privacy
  CASE 
    WHEN position(' ' in p.full_name) > 0 
    THEN split_part(p.full_name, ' ', 1) || ' ' || left(split_part(p.full_name, ' ', array_length(string_to_array(p.full_name, ' '), 1)), 1) || '.'
    ELSE p.full_name
  END as public_name,
  p.user_id,
  p.id as profile_id
FROM public.profiles p
WHERE p.referral_code IS NOT NULL
  AND p.is_blocked = false;

-- Grant access to the view for anon and authenticated users
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Create a function to get public profile impact data
CREATE OR REPLACE FUNCTION public.get_public_profile_data(p_referral_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
  v_profile record;
  v_total_pros integer;
  v_total_weight_grams bigint;
  v_referrals_count integer;
  v_network_pros integer;
  v_current_level integer;
BEGIN
  -- Get profile by referral code
  SELECT pp.*, p.user_id, p.id as profile_id
  INTO v_profile
  FROM public_profiles pp
  JOIN profiles p ON pp.referral_code = p.referral_code
  WHERE pp.referral_code = upper(p_referral_code);
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Get PRO stats
  SELECT 
    COUNT(*)::integer,
    COALESCE(SUM(weight_grams), 0)::bigint
  INTO v_total_pros, v_total_weight_grams
  FROM pros
  WHERE user_id = v_profile.user_id;
  
  -- Get referral stats level
  SELECT COALESCE(current_level, 1)
  INTO v_current_level
  FROM referral_stats
  WHERE user_id = v_profile.user_id;
  
  IF v_current_level IS NULL THEN
    v_current_level := 1;
  END IF;
  
  -- Count referrals
  SELECT COUNT(*)::integer
  INTO v_referrals_count
  FROM profiles
  WHERE referred_by = v_profile.profile_id;
  
  -- Count network PROs (PROs from referred users)
  SELECT COALESCE(COUNT(pr.id), 0)::integer
  INTO v_network_pros
  FROM profiles p
  JOIN pros pr ON pr.user_id = p.user_id
  WHERE p.referred_by = v_profile.profile_id;
  
  -- Build result
  v_result := json_build_object(
    'publicName', v_profile.public_name,
    'city', null,
    'memberSince', v_profile.member_since,
    'totalPros', v_total_pros,
    'totalWeightKg', v_total_weight_grams::numeric / 1000,
    'co2AvoidedKg', (v_total_weight_grams::numeric / 1000) * 2.5,
    'fertilizerKg', (v_total_weight_grams::numeric / 1000) * 0.6,
    'sealActive', v_total_pros > 0,
    'sealLabel', CASE v_current_level
      WHEN 1 THEN 'Iniciante'
      WHEN 2 THEN 'Ativo'
      WHEN 3 THEN 'Embaixador'
      WHEN 4 THEN 'Líder'
      ELSE 'Iniciante'
    END,
    'currentLevel', v_current_level,
    'referralsCount', v_referrals_count,
    'networkPros', v_network_pros
  );
  
  RETURN v_result;
END;
$$;

-- Grant execute permission to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_public_profile_data(text) TO anon, authenticated;