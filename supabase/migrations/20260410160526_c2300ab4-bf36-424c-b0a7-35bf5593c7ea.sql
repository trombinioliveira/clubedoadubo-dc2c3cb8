
-- RPC segura para listar os indicados do usuário logado
-- Contorna a RLS de profiles usando SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_my_referred_users(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_profile_id uuid;
  v_result json;
BEGIN
  -- Only the user themselves or admin/staff can call this
  IF p_user_id != auth.uid() AND NOT is_admin(auth.uid()) AND NOT is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Get caller's profile_id
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE user_id = p_user_id;

  IF v_profile_id IS NULL THEN
    RETURN '[]'::json;
  END IF;

  -- Return referred users with their PRO stats (privacy-safe: no email, cpf, pix, address)
  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.joined_at DESC), '[]'::json)
  INTO v_result
  FROM (
    SELECT
      p.id,
      p.full_name,
      p.created_at AS joined_at,
      p.last_login_at AS last_activity,
      COALESCE(pro_stats.pros_count, 0) AS pros_count,
      COALESCE(pro_stats.total_weight_grams, 0) AS total_weight_grams,
      COALESCE(pro_stats.paid_pros, 0) AS paid_pros,
      (COALESCE(pro_stats.pros_count, 0) > 0) AS is_active
    FROM public.profiles p
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::integer AS pros_count,
        COALESCE(SUM(pr.weight_grams), 0)::integer AS total_weight_grams,
        COUNT(*) FILTER (WHERE pr.status = 'paid')::integer AS paid_pros
      FROM public.pros pr
      WHERE pr.user_id = p.user_id
    ) pro_stats ON true
    WHERE p.referred_by = v_profile_id
  ) t;

  RETURN v_result;
END;
$$;
