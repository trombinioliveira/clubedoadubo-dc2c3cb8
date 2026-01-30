-- Drop and recreate with available functions only
DROP FUNCTION IF EXISTS public.generate_pros_batch(INTEGER, UUID);

CREATE OR REPLACE FUNCTION public.generate_pros_batch(
  p_amount INTEGER,
  p_user_id UUID
)
RETURNS TABLE(
  total_generated INTEGER,
  first_position INTEGER,
  last_position INTEGER,
  sample_codes TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_position INTEGER;
  v_sample_codes TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get starting position
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_start_position FROM fifo_queue;
  
  -- Generate all PROs - position in hex guarantees uniqueness
  WITH generated_codes AS (
    SELECT 
      gen_random_uuid() as id,
      v_start_position + n - 1 as pos,
      -- Code = position in base36-style (unique) + random suffix
      upper(
        lpad(to_hex(v_start_position + n - 1), 5, '0') ||
        substr(md5(random()::text || n::text || clock_timestamp()::text), 1, 3)
      ) as code
    FROM generate_series(1, p_amount) as n
  ),
  inserted_pros AS (
    INSERT INTO pros (id, code, user_id, weight_grams, fifo_position, status)
    SELECT id, code, p_user_id, 100, pos, 'pending'
    FROM generated_codes
    RETURNING id, code, fifo_position
  ),
  inserted_fifo AS (
    INSERT INTO fifo_queue (pro_id, position, status)
    SELECT id, fifo_position, 'pending'
    FROM inserted_pros
  )
  SELECT array_agg(code) INTO v_sample_codes
  FROM (SELECT code FROM inserted_pros ORDER BY fifo_position LIMIT 10) sub;
  
  RETURN QUERY SELECT 
    p_amount,
    v_start_position,
    v_start_position + p_amount - 1,
    v_sample_codes;
END;
$$;