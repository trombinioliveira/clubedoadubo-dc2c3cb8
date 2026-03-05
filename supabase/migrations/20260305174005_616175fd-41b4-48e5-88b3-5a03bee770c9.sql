
-- 1. Update create_user_pros_from_confirmed_payment to log subscription_credit
CREATE OR REPLACE FUNCTION public.create_user_pros_from_confirmed_payment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
declare
  qty int;
  cp_id uuid;
  pk text;
begin
  if new.status <> 'confirmed' then
    return new;
  end if;

  pk := new.product_key;

  if pk = 'pro_avulso' then
    qty := new.amount::int;
  elsif pk = 'plano_semente' then
    qty := 10;
  elsif pk = 'plano_muda' then
    qty := 25;
  elsif pk = 'plano_arvore' then
    qty := 50;
  else
    return new;
  end if;

  cp_id := null;
  if new.attribution ? 'collection_point_id' then
    cp_id := (new.attribution->>'collection_point_id')::uuid;
  end if;

  if pk = 'pro_avulso' then
    insert into public.pro_activations
      (external_reference, user_id, quantity, collection_point_id)
    values
      (new.external_reference::uuid, new.user_id, qty, cp_id)
    on conflict (external_reference) do nothing;
  else
    -- Create credits
    insert into public.pro_credits
      (user_id, source, subscription_id, external_reference, product_key, quantity_total, quantity_remaining)
    values
      (new.user_id, 'subscription', null, new.external_reference::uuid, pk, qty, qty)
    on conflict do nothing;

    -- LEDGER: subscription_credit
    perform public.ledger_event(
      'subscription_credit',
      new.external_reference::uuid,
      new.user_id,
      qty::numeric,
      jsonb_build_object('product_key', pk)
    );
  end if;

  return new;
end;
$$;

-- 2. Update consume_pro_activations to log pro_activated
CREATE OR REPLACE FUNCTION public.consume_pro_activations()
RETURNS void
LANGUAGE plpgsql
AS $$
declare
  act record;
  pro_record record;
begin
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

      -- LEDGER: pro_activated
      perform public.ledger_event(
        'pro_activated',
        pro_record.id,
        act.user_id,
        1,
        '{}'::jsonb
      );
    end loop;

    update public.pro_activations
    set consumed_at = now()
    where external_reference = act.external_reference;
  end loop;
end;
$$;

-- 3. Trigger for adubo_sale on financial_entries
CREATE OR REPLACE FUNCTION public.ledger_log_adubo_sale()
RETURNS trigger
LANGUAGE plpgsql
AS $$
begin
  if new.status = 'confirmed' and new.amount > 0 then
    perform public.ledger_event(
      'adubo_sale',
      new.id,
      new.user_id,
      new.amount,
      '{}'::jsonb
    );
  end if;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_ledger_adubo_sale ON public.financial_entries;
CREATE TRIGGER trg_ledger_adubo_sale
  AFTER INSERT ON public.financial_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.ledger_log_adubo_sale();

-- 4. Trigger for pro_paid on pro_payouts
CREATE OR REPLACE FUNCTION public.ledger_log_pro_paid()
RETURNS trigger
LANGUAGE plpgsql
AS $$
declare
  v_user_id uuid;
begin
  select user_id into v_user_id from public.pros where id = new.pro_id;

  perform public.ledger_event(
    'pro_paid',
    new.pro_id,
    v_user_id,
    new.amount_paid,
    '{}'::jsonb
  );
  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_ledger_pro_paid ON public.pro_payouts;
CREATE TRIGGER trg_ledger_pro_paid
  AFTER INSERT ON public.pro_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.ledger_log_pro_paid();
