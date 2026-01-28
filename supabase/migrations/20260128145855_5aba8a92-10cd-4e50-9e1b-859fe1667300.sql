-- Fix the generate_pro_code function to handle existing codes with mixed format
-- and generate clean sequential codes going forward
CREATE OR REPLACE FUNCTION public.generate_pro_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_code TEXT;
  year_str TEXT;
  seq_num INTEGER;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the max sequential number, handling both old format and new format codes
  -- First try to extract from codes that end with digits only (new format: PRO-YYYY-XXXX)
  -- Then also check codes with random prefixes (old format: PRO-YYYY-RANDOM)
  SELECT COALESCE(
    MAX(
      CASE 
        -- Try to extract number from end of code (handles both formats)
        WHEN code ~ '^PRO-[0-9]{4}-[0-9]+$' THEN 
          CAST(SUBSTRING(code FROM 10) AS INTEGER)
        ELSE 
          -- For codes like PRO-2026-ZAA3HP0003, extract the trailing digits
          CASE 
            WHEN SUBSTRING(code FROM '[0-9]+$') ~ '^[0-9]+$' THEN
              CAST(SUBSTRING(code FROM '[0-9]+$') AS INTEGER)
            ELSE 0
          END
      END
    ), 
    0
  ) + 1
  INTO seq_num
  FROM public.pros
  WHERE code LIKE 'PRO-' || year_str || '-%';
  
  -- Generate new clean code format: PRO-YYYY-XXXX (padded to 4 digits)
  new_code := 'PRO-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  -- Ensure uniqueness by checking if code exists and incrementing if needed
  WHILE EXISTS (SELECT 1 FROM public.pros WHERE code = new_code) LOOP
    seq_num := seq_num + 1;
    new_code := 'PRO-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  END LOOP;
  
  RETURN new_code;
END;
$function$;