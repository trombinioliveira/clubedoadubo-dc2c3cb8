-- 1. user_checkins
CREATE TABLE public.user_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  collection_point_id uuid NOT NULL REFERENCES public.collection_points(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'qr',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_checkins_user ON public.user_checkins(user_id);
CREATE INDEX idx_user_checkins_point ON public.user_checkins(collection_point_id);
CREATE INDEX idx_user_checkins_created_at ON public.user_checkins(created_at DESC);

ALTER TABLE public.user_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own checkins" ON public.user_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage checkins" ON public.user_checkins
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Staff view checkins" ON public.user_checkins
  FOR SELECT USING (is_staff(auth.uid()));

-- 2. user_point_connections
CREATE TABLE public.user_point_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  collection_point_id uuid NOT NULL REFERENCES public.collection_points(id) ON DELETE CASCADE,
  first_checkin_at timestamptz NOT NULL DEFAULT now(),
  last_checkin_at timestamptz NOT NULL DEFAULT now(),
  total_checkins integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, collection_point_id)
);

CREATE INDEX idx_upc_point ON public.user_point_connections(collection_point_id);

ALTER TABLE public.user_point_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own connections" ON public.user_point_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage connections" ON public.user_point_connections
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Staff view connections" ON public.user_point_connections
  FOR SELECT USING (is_staff(auth.uid()));

-- 3. Permitir fifo_position nulo para PROs cortesia (fora da economia/FIFO)
ALTER TABLE public.pros ALTER COLUMN fifo_position DROP NOT NULL;

-- 4. RPC: registrar check-in (idempotente por evento, concede PRO cortesia só no 1º)
CREATE OR REPLACE FUNCTION public.register_checkin(p_slug text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_point record;
  v_conn record;
  v_is_first boolean := false;
  v_pro_id uuid;
  v_pro_code text;
  v_total_users integer;
  v_total_checkins integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT * INTO v_point
  FROM public.collection_points
  WHERE slug = p_slug AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'point_not_found';
  END IF;

  -- Sempre cria o check-in
  INSERT INTO public.user_checkins (user_id, collection_point_id, source)
  VALUES (v_user_id, v_point.id, 'qr');

  -- Upsert da conexão
  SELECT * INTO v_conn
  FROM public.user_point_connections
  WHERE user_id = v_user_id AND collection_point_id = v_point.id;

  IF NOT FOUND THEN
    v_is_first := true;
    INSERT INTO public.user_point_connections (
      user_id, collection_point_id, first_checkin_at, last_checkin_at, total_checkins
    ) VALUES (v_user_id, v_point.id, now(), now(), 1);
  ELSE
    UPDATE public.user_point_connections
    SET total_checkins = total_checkins + 1,
        last_checkin_at = now(),
        updated_at = now()
    WHERE id = v_conn.id;
  END IF;

  -- Concede 1 PRO cortesia apenas no PRIMEIRO check-in deste usuário no ponto
  IF v_is_first THEN
    v_pro_code := public.generate_pro_code();
    INSERT INTO public.pros (
      code, user_id, weight_grams, status, pro_type, collection_point_id, fifo_position
    ) VALUES (
      v_pro_code, v_user_id, 100, 'paid', 'courtesy', v_point.id, NULL
    ) RETURNING id INTO v_pro_id;
  END IF;

  -- Estatísticas atualizadas do ponto
  SELECT count(DISTINCT user_id), count(*)
  INTO v_total_users, v_total_checkins
  FROM public.user_checkins
  WHERE collection_point_id = v_point.id;

  RETURN json_build_object(
    'point_name', v_point.name,
    'point_slug', v_point.slug,
    'is_first_checkin', v_is_first,
    'pro_granted', v_is_first,
    'pro_code', v_pro_code,
    'user_total_checkins', COALESCE((SELECT total_checkins FROM public.user_point_connections WHERE user_id = v_user_id AND collection_point_id = v_point.id), 1),
    'point_total_users', v_total_users,
    'point_total_checkins', v_total_checkins
  );
END;
$$;

-- 5. RPC pública: estatísticas do ponto
CREATE OR REPLACE FUNCTION public.get_point_checkin_stats(p_slug text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_point record;
  v_total_users integer;
  v_total_checkins integer;
BEGIN
  SELECT id, name, slug, city, state, is_active
  INTO v_point
  FROM public.collection_points
  WHERE slug = p_slug AND is_active = true;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT count(DISTINCT user_id), count(*)
  INTO v_total_users, v_total_checkins
  FROM public.user_checkins
  WHERE collection_point_id = v_point.id;

  RETURN json_build_object(
    'point_id', v_point.id,
    'point_name', v_point.name,
    'point_slug', v_point.slug,
    'city', v_point.city,
    'state', v_point.state,
    'total_users', COALESCE(v_total_users, 0),
    'total_checkins', COALESCE(v_total_checkins, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_point_checkin_stats(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_checkin(text) TO authenticated;