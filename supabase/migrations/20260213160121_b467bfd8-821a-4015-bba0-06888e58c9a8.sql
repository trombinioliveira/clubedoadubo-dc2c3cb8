
-- Fix search_path for generate_slug
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
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
