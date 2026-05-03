CREATE OR REPLACE FUNCTION public.generate_pro_code()
RETURNS text
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
END;
$function$;