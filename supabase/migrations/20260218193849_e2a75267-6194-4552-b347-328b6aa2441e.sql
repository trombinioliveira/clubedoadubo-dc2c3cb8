
-- ============================================================
-- PUBLIC TRANSPARENCY PANEL: Secure Views and KPI Function
-- ============================================================

-- 1. public_fifo_queue VIEW (no PII, only PRO code, position, status, dates)
CREATE OR REPLACE VIEW public.public_fifo_queue AS
SELECT
  fq.id          AS queue_id,
  fq.position,
  fq.status,
  fq.created_at,
  fq.paid_at,
  p.code         AS pro_code,
  p.weight_grams
FROM public.fifo_queue fq
JOIN public.pros p ON fq.pro_id = p.id;

-- Make it security_invoker so callers without auth still get the public view
-- We want this accessible without auth, so we keep security_invoker OFF (default)
-- and rely on the fact that no PII is included.
ALTER VIEW public.public_fifo_queue SET (security_invoker = off);

-- 2. public_financial_entries VIEW (no payer info)
CREATE OR REPLACE VIEW public.public_financial_entries AS
SELECT
  fe.id,
  fe.received_at,
  fe.amount,
  fe.description,
  fe.is_distributed,
  fe.pros_paid,
  fe.distributed_at
FROM public.financial_entries fe;

ALTER VIEW public.public_financial_entries SET (security_invoker = off);

-- 3. public_collection_points_list VIEW (only safe fields)
CREATE OR REPLACE VIEW public.public_collection_points_list AS
SELECT
  cp.id,
  cp.name,
  cp.city,
  cp.state,
  cp.address,
  cp.opening_hours,
  cp.phone,
  cp.whatsapp,
  cp.slug,
  cp.has_public_page,
  cp.description
FROM public.collection_points cp
WHERE cp.is_active = true;

ALTER VIEW public.public_collection_points_list SET (security_invoker = off);

-- 4. RPC: get_public_transparency_kpis() - aggregates for the public dashboard
CREATE OR REPLACE FUNCTION public.get_public_transparency_kpis()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_total_pros          INTEGER;
  v_pending_pros        INTEGER;
  v_paid_pros           INTEGER;
  v_total_weight_grams  BIGINT;
  v_total_sales         BIGINT;
  v_total_sales_amount  NUMERIC;
  v_total_distributed   NUMERIC;
  v_active_points       INTEGER;
  v_last_sale           JSON;
  v_last_batch          JSON;
  v_batches_processing  INTEGER;
  v_batches_done        INTEGER;
  v_weight_processing   BIGINT;
  v_weight_done         BIGINT;
  v_total_weighings     INTEGER;
  v_weight_collected    BIGINT;
BEGIN
  -- PRO counts
  SELECT COUNT(*) INTO v_total_pros FROM public.pros;
  SELECT COUNT(*) INTO v_pending_pros
    FROM public.pros WHERE status IN ('pending','processing','ready','sold');
  SELECT COUNT(*) INTO v_paid_pros FROM public.pros WHERE status = 'paid';

  -- Total weight from weighings
  SELECT COUNT(*), COALESCE(SUM(weight_grams), 0)
    INTO v_total_weighings, v_weight_collected
    FROM public.weighings;

  -- Total weight from pros (emitted)
  SELECT COALESCE(SUM(weight_grams), 0) INTO v_total_weight_grams FROM public.pros;

  -- Financial entries
  SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO v_total_sales, v_total_sales_amount
    FROM public.financial_entries;

  -- Total distributed
  SELECT COALESCE(SUM(amount), 0) INTO v_total_distributed
    FROM public.financial_entries WHERE is_distributed = true;

  -- Active collection points
  SELECT COUNT(*) INTO v_active_points
    FROM public.collection_points WHERE is_active = true;

  -- Last sale
  SELECT json_build_object(
    'received_at', received_at,
    'amount', amount,
    'description', description
  ) INTO v_last_sale
  FROM public.financial_entries
  ORDER BY received_at DESC
  LIMIT 1;

  -- Last finished batch
  SELECT json_build_object(
    'code', code,
    'ready_date', ready_date,
    'total_weight_grams', total_weight_grams,
    'status', status
  ) INTO v_last_batch
  FROM public.batches
  WHERE status IN ('ready','partial_sold','sold')
  ORDER BY COALESCE(ready_date, created_at) DESC
  LIMIT 1;

  -- Batches in processing
  SELECT COUNT(*), COALESCE(SUM(total_weight_grams), 0)
    INTO v_batches_processing, v_weight_processing
    FROM public.batches WHERE status = 'processing';

  -- Batches done
  SELECT COUNT(*), COALESCE(SUM(total_weight_grams), 0)
    INTO v_batches_done, v_weight_done
    FROM public.batches WHERE status IN ('ready','partial_sold','sold');

  -- Build result
  v_result := json_build_object(
    'totalPros', v_total_pros,
    'pendingPros', v_pending_pros,
    'paidPros', v_paid_pros,
    'totalWeightGrams', v_total_weight_grams,
    'totalWeighings', v_total_weighings,
    'weightCollectedGrams', v_weight_collected,
    'totalSales', v_total_sales,
    'totalSalesAmount', v_total_sales_amount,
    'totalDistributed', v_total_distributed,
    'activeCollectionPoints', v_active_points,
    'lastSale', v_last_sale,
    'lastBatch', v_last_batch,
    'batchesProcessing', v_batches_processing,
    'weightProcessingGrams', v_weight_processing,
    'batchesDone', v_batches_done,
    'weightDoneGrams', v_weight_done
  );

  RETURN v_result;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_public_transparency_kpis() TO anon, authenticated;

-- 5. Insert new site_settings for public panel toggles (if not exist)
INSERT INTO public.site_settings (key, value)
VALUES
  ('public_transparency_enabled',    '{"enabled": true}'),
  ('public_fifo_enabled',            '{"enabled": true}'),
  ('public_sales_enabled',           '{"enabled": true}'),
  ('public_collection_points_enabled','{"enabled": true}'),
  ('public_kpis_enabled',            '{"enabled": true}')
ON CONFLICT (key) DO NOTHING;
