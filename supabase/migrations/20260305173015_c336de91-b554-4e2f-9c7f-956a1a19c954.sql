
-- PARTE 1: Remover trigger duplicado de payment
DROP TRIGGER IF EXISTS trg_create_user_pros_from_payment ON public.financial_entries;

-- PARTE 2: Remover trigger duplicado sold_at
DROP TRIGGER IF EXISTS trg_set_sold_at ON public.pros;

-- PARTE 3: Proteger corrida no pool com FOR UPDATE SKIP LOCKED
CREATE OR REPLACE FUNCTION public.consume_pro_activations()
RETURNS void
LANGUAGE plpgsql
AS $$
declare
  act record;
  pro_record record;
begin
  -- Rate guard
  PERFORM public.guard_pro_creation_rate();

  for act in
    select *
    from public.pro_activations
    where consumed_at is null
    order by created_at
  loop

    for pro_record in
      select id
      from public.pros
      where user_id = 'b22080a1-ca50-4770-974d-57c9d198a5dd'
        and pro_type = 'standard'
        and status = 'pending'
      order by fifo_position
      limit act.quantity
      for update skip locked
    loop

      update public.pros
      set user_id = act.user_id,
          pro_type = 'direct'
      where id = pro_record.id;

    end loop;

    update public.pro_activations
    set consumed_at = now()
    where external_reference = act.external_reference;

  end loop;
end;
$$;

-- PARTE 4: Guard de rate limiting
CREATE OR REPLACE FUNCTION public.guard_pro_creation_rate()
RETURNS void
LANGUAGE plpgsql
AS $$
declare
  v_count int;
begin
  select count(*)
  into v_count
  from public.pros
  where created_at > now() - interval '60 seconds';

  if v_count > 500 then
    raise exception 'PRO creation rate exceeded safety limit (500/min)';
  end if;
end;
$$;

-- Atualizar convert_pro_credits para incluir rate guard
CREATE OR REPLACE FUNCTION public.convert_pro_credits(max_to_convert integer DEFAULT 200)
RETURNS TABLE(converted integer)
LANGUAGE plpgsql
AS $$
declare
  v_total int := 0;
  r record;
  v_take int;
begin
  -- Rate guard
  PERFORM public.guard_pro_creation_rate();

  for r in
    select id, user_id, external_reference, product_key, quantity_remaining
    from public.pro_credits
    where quantity_remaining > 0
    order by created_at asc
  loop
    exit when v_total >= max_to_convert;

    v_take := least(r.quantity_remaining, max_to_convert - v_total);

    insert into public.pro_activations (external_reference, user_id, quantity, collection_point_id)
    values (coalesce(r.external_reference, gen_random_uuid()), r.user_id, v_take, null)
    on conflict (external_reference) do nothing;

    update public.pro_credits
    set quantity_remaining = quantity_remaining - v_take
    where id = r.id;

    v_total := v_total + v_take;
  end loop;

  converted := v_total;
  return next;
end;
$$;

-- PARTE 5: Índice único para prevenir pagamento duplicado
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_provider_payment_id
ON public.financial_entries(provider_payment_id)
WHERE provider_payment_id IS NOT NULL;

-- PARTE 7: Health check function
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
  -- Pool disponível
  SELECT count(*) INTO v_pool_count
  FROM public.pros
  WHERE user_id = 'b22080a1-ca50-4770-974d-57c9d198a5dd'
    AND status = 'pending';

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
