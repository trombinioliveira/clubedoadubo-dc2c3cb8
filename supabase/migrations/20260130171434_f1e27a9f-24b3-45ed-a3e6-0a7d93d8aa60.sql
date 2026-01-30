-- Drop the old function
DROP FUNCTION IF EXISTS public.generate_pros_batch(INTEGER, UUID);

-- Create optimized function using batch inserts
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
  
  -- Generate all PROs using generate_series for bulk insert (much faster)
  WITH generated_codes AS (
    SELECT 
      gen_random_uuid() as id,
      upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)) as code,
      v_start_position + (row_number() OVER ())::integer - 1 as pos
    FROM generate_series(1, p_amount)
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