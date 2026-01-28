-- Update generate_pro_code to generate 8-character alphanumeric codes
CREATE OR REPLACE FUNCTION public.generate_pro_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_code TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  LOOP
    new_code := '';
    -- Generate 8 random alphanumeric characters
    FOR i IN 1..8 LOOP
      new_code := new_code || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    -- Check if code is unique
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.pros WHERE code = new_code);
  END LOOP;
  
  RETURN new_code;
END;
$function$;