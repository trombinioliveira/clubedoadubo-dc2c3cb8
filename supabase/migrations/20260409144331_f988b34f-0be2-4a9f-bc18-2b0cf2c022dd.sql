
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pool_count int;
  v_fifo_count int;
  v_pending_credits int;
  v_last_conversion timestamptz;
  v_last_distribution timestamptz;
  v_pool_status text;
  v_fifo_status text;
  v_credits_status text;
BEGIN
  -- Pool disponível = todos os PROs pendentes (não atribuídos a participantes reais)
  SELECT count(*) INTO v_pool_count
  FROM public.pros
  WHERE status = 'pending';

  -- FIFO total
  SELECT count(*) INTO v_fifo_count FROM public.fifo_queue;

  -- Créditos pendentes
  SELECT coalesce(sum(quantity_remaining), 0) INTO v_pending_credits
  FROM public.pro_credits
  WHERE quantity_remaining > 0;

  -- Última conversão (pro_activations)
  SELECT max(created_at) INTO v_last_conversion FROM public.pro_activations;

  -- Última distribuição
  SELECT max(created_at) INTO v_last_distribution FROM public.sale_distributions;

  v_pool_status := CASE WHEN v_pool_count > 0 THEN 'ok' ELSE 'empty' END;
  v_fifo_status := CASE WHEN v_fifo_count > 0 THEN 'ok' ELSE 'empty' END;
  v_credits_status := CASE WHEN v_pending_credits = 0 THEN 'ok' ELSE 'pending' END;

  RETURN json_build_object(
    'system', 'ok',
    'pool', v_pool_status,
    'pool_available', v_pool_count,
    'fifo', v_fifo_status,
    'fifo_total', v_fifo_count,
    'credits', v_credits_status,
    'credits_pending', v_pending_credits,
    'last_conversion', v_last_conversion,
    'last_distribution', v_last_distribution
  );
END;
$$;
