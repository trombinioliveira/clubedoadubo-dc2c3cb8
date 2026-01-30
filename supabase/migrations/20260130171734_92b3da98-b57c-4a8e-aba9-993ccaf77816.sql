-- Drop and recreate with guaranteed unique code generation
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
  v_chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
BEGIN
  -- Get starting position
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_start_position FROM fifo_queue;
  
  -- Generate all PROs using LATERAL to force per-row evaluation of random
  WITH generated_codes AS (
    SELECT 
      gen_random_uuid() as id,
      v_start_position + n - 1 as pos,
      (
        -- Generate unique code using position + random suffix
        -- Position ensures uniqueness, random adds unpredictability
        lpad(to_hex(v_start_position + n - 1), 4, '0') ||
        substr(
          translate(
            encode(gen_random_bytes(3), 'hex'),
            'abcdef',
            'QRSTUV'
          ), 1, 4
        )
      ) as code
    FROM generate_series(1, p_amount) as n
  ),
  inserted_pros AS (
    INSERT INTO pros (id, code, user_id, weight_grams, fifo_position, status)
    SELECT id, upper(code), p_user_id, 100, pos, 'pending'
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