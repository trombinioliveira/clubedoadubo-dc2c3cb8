
CREATE OR REPLACE FUNCTION public.get_my_referred_users(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
SET statement_timeout = '15s'
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

  -- Optimized: get referred profiles first, then aggregate pros separately
  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.joined_at DESC), '[]'::json)
  INTO v_result
  FROM (
    SELECT
      p.id,
      p.full_name,
      p.created_at AS joined_at,
      p.last_login_at AS last_activity,
      COALESCE(ps.pros_count, 0) AS pros_count,
      COALESCE(ps.total_weight_grams, 0) AS total_weight_grams,
      COALESCE(ps.paid_pros, 0) AS paid_pros,
      (COALESCE(ps.pros_count, 0) > 0) AS is_active
    FROM public.profiles p
    LEFT JOIN (
      SELECT
        pr.user_id,
        COUNT(*)::integer AS pros_count,
        COALESCE(SUM(pr.weight_grams), 0)::integer AS total_weight_grams,
        COUNT(*) FILTER (WHERE pr.status = 'paid')::integer AS paid_pros
      FROM public.pros pr
      WHERE pr.user_id IN (
        SELECT pp.user_id FROM public.profiles pp WHERE pp.referred_by = v_profile_id
      )
      GROUP BY pr.user_id
    ) ps ON ps.user_id = p.user_id
    WHERE p.referred_by = v_profile_id
  ) t;

  RETURN v_result;
END;
$$;
