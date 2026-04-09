-- New optimized RPC: returns user's own entries + global status counts
-- Avoids scanning all 2.6M rows

CREATE OR REPLACE FUNCTION public.get_user_fifo_summary(p_user_id uuid DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_global json;
  v_my_entries json;
  v_total int;
  v_ahead int;
  v_first_position int;
BEGIN
  -- Global counts by status (uses index on status)
  SELECT json_build_object(
    'pending', coalesce(sum(case when fq.status = 'pending' then 1 else 0 end), 0),
    'processing', coalesce(sum(case when fq.status = 'processing' then 1 else 0 end), 0),
    'ready', coalesce(sum(case when fq.status = 'ready' then 1 else 0 end), 0),
    'sold', coalesce(sum(case when fq.status = 'sold' then 1 else 0 end), 0),
    'paid', coalesce(sum(case when fq.status = 'paid' then 1 else 0 end), 0),
    'total', count(*)
  ) INTO v_global
  FROM fifo_queue fq;

  v_total := (v_global->>'total')::int;

  -- If no user, return just global
  IF p_user_id IS NULL THEN
    RETURN json_build_object(
      'global', v_global,
      'my_entries', '[]'::json,
      'first_position', null,
      'ahead_count', 0
    );
  END IF;

  -- User's own entries (small set, fast)
  SELECT coalesce(json_agg(row_to_json(t) ORDER BY t.queue_position), '[]'::json)
  INTO v_my_entries
  FROM (
    SELECT 
      fq.id as queue_id,
      fq.position as queue_position,
      fq.status as queue_status,
      fq.created_at as queue_created_at,
      fq.paid_at as queue_paid_at,
      p.id as pro_id,
      p.code as pro_code,
      p.weight_grams as pro_weight_grams,
      p.status as pro_status,
      p.created_at as pro_created_at,
      p.user_id as pro_user_id,
      prof.full_name as user_name
    FROM fifo_queue fq
    JOIN pros p ON fq.pro_id = p.id
    LEFT JOIN profiles prof ON p.user_id = prof.user_id
    WHERE p.user_id = p_user_id
  ) t;

  -- First unpaid position
  SELECT min(fq.position) INTO v_first_position
  FROM fifo_queue fq
  JOIN pros p ON fq.pro_id = p.id
  WHERE p.user_id = p_user_id AND fq.status != 'paid';

  -- Count ahead
  IF v_first_position IS NOT NULL THEN
    SELECT count(*) INTO v_ahead
    FROM fifo_queue
    WHERE position < v_first_position AND status != 'paid';
  ELSE
    v_ahead := 0;
  END IF;

  RETURN json_build_object(
    'global', v_global,
    'my_entries', v_my_entries,
    'first_position', v_first_position,
    'ahead_count', v_ahead
  );
END;
$$;

-- Ensure index on fifo_queue.status for fast aggregation
CREATE INDEX IF NOT EXISTS idx_fifo_queue_status ON fifo_queue(status);

-- Ensure index on pros.user_id for fast user lookup
CREATE INDEX IF NOT EXISTS idx_pros_user_id ON pros(user_id);