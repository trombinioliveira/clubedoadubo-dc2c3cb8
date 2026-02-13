
-- Add slug column for public landing page URLs
ALTER TABLE public.collection_points 
ADD COLUMN slug text UNIQUE;

-- Add description and extra fields for the public page
ALTER TABLE public.collection_points
ADD COLUMN description text,
ADD COLUMN phone text,
ADD COLUMN whatsapp text,
ADD COLUMN opening_hours text,
ADD COLUMN has_public_page boolean NOT NULL DEFAULT false;

-- Create function to generate slug from name
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  slug text;
BEGIN
  slug := lower(trim(input_text));
  slug := translate(slug, 'áàãâäéèêëíìîïóòõôöúùûüçñ', 'aaaaaeeeeiiiioooooouuuucn');
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(both '-' from slug);
  RETURN slug;
END;
$$;

-- Create RPC to get collection point public data (accessible without auth)
CREATE OR REPLACE FUNCTION public.get_collection_point_public(p_slug text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result json;
  v_point record;
  v_total_weighings integer;
  v_total_weight_grams bigint;
  v_total_pros integer;
  v_unique_users integer;
BEGIN
  SELECT * INTO v_point
  FROM collection_points
  WHERE slug = p_slug AND is_active = true AND has_public_page = true;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Aggregate stats
  SELECT 
    COUNT(*)::integer,
    COALESCE(SUM(weight_grams), 0)::bigint
  INTO v_total_weighings, v_total_weight_grams
  FROM weighings
  WHERE collection_point_id = v_point.id;

  SELECT COUNT(*)::integer
  INTO v_total_pros
  FROM pros
  WHERE collection_point_id = v_point.id;

  SELECT COUNT(DISTINCT user_id)::integer
  INTO v_unique_users
  FROM weighings
  WHERE collection_point_id = v_point.id;

  v_result := json_build_object(
    'name', v_point.name,
    'address', v_point.address,
    'city', v_point.city,
    'state', v_point.state,
    'description', v_point.description,
    'phone', v_point.phone,
    'whatsapp', v_point.whatsapp,
    'openingHours', v_point.opening_hours,
    'createdAt', v_point.created_at,
    'totalWeighings', v_total_weighings,
    'totalWeightKg', v_total_weight_grams::numeric / 1000,
    'totalPros', v_total_pros,
    'uniqueUsers', v_unique_users,
    'co2AvoidedKg', (v_total_weight_grams::numeric / 1000) * 2.5,
    'fertilizerKg', (v_total_weight_grams::numeric / 1000) * 0.6
  );

  RETURN v_result;
END;
$$;
