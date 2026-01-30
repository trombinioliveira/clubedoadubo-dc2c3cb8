-- Create a function to generate PROs efficiently in the database
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
  v_code TEXT;
  v_chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  v_i INTEGER;
  v_j INTEGER;
  v_pro_id UUID;
  v_sample_codes TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get starting position
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_start_position FROM fifo_queue;
  
  -- Generate PROs in a single transaction
  FOR v_i IN 0..(p_amount - 1) LOOP
    -- Generate unique 8-character code
    LOOP
      v_code := '';
      FOR v_j IN 1..8 LOOP
        v_code := v_code || SUBSTR(v_chars, FLOOR(RANDOM() * 36 + 1)::INTEGER, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM pros WHERE code = v_code);
    END LOOP;
    
    -- Insert PRO
    INSERT INTO pros (code, user_id, weight_grams, fifo_position, status)
    VALUES (v_code, p_user_id, 100, v_start_position + v_i, 'pending')
    RETURNING id INTO v_pro_id;
    
    -- Insert FIFO entry
    INSERT INTO fifo_queue (pro_id, position, status)
    VALUES (v_pro_id, v_start_position + v_i, 'pending');
    
    -- Keep first 10 codes as samples
    IF v_i < 10 THEN
      v_sample_codes := array_append(v_sample_codes, v_code);
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT 
    p_amount,
    v_start_position,
    v_start_position + p_amount - 1,
    v_sample_codes;
END;
$$;