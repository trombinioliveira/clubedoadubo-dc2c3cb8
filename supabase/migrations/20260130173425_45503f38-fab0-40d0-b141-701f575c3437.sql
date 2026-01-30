-- Direct bulk insert of 100,000 PROs
-- Using simple DO block with direct inserts

DO $$
DECLARE
  v_start_position INTEGER;
  v_admin_user_id UUID;
  v_batch_size INTEGER := 10000;
  v_total INTEGER := 100000;
  v_current INTEGER := 0;
BEGIN
  -- Get admin user (first admin in the system)
  SELECT ur.user_id INTO v_admin_user_id 
  FROM user_roles ur 
  WHERE ur.role = 'admin' 
  LIMIT 1;
  
  IF v_admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No admin user found';
  END IF;

  -- Get starting position
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_start_position FROM fifo_queue;
  
  RAISE NOTICE 'Starting at position %, inserting % PROs for user %', v_start_position, v_total, v_admin_user_id;
  
  -- Insert in batches
  WHILE v_current < v_total LOOP
    -- Insert PROs batch
    INSERT INTO pros (id, code, user_id, weight_grams, fifo_position, status)
    SELECT 
      gen_random_uuid(),
      upper(lpad(to_hex(v_start_position + v_current + n - 1), 5, '0') || substr(md5(random()::text || n::text), 1, 3)),
      v_admin_user_id,
      100,
      v_start_position + v_current + n - 1,
      'pending'
    FROM generate_series(1, LEAST(v_batch_size, v_total - v_current)) as n;
    
    -- Insert FIFO entries for this batch
    INSERT INTO fifo_queue (pro_id, position, status)
    SELECT id, fifo_position, 'pending'
    FROM pros 
    WHERE fifo_position >= v_start_position + v_current 
      AND fifo_position < v_start_position + v_current + v_batch_size;
    
    v_current := v_current + v_batch_size;
    RAISE NOTICE 'Inserted % of % PROs', v_current, v_total;
  END LOOP;
  
  RAISE NOTICE 'Done! Inserted % PROs from position % to %', v_total, v_start_position, v_start_position + v_total - 1;
END $$;