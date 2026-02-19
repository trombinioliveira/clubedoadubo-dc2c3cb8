
-- ─── 1. Tabela sale_distributions ────────────────────────────────────────────
CREATE TABLE public.sale_distributions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_entry_id      uuid NOT NULL REFERENCES public.financial_entries(id) ON DELETE CASCADE,
  gross_amount            numeric NOT NULL DEFAULT 0,
  amount_to_fifo          numeric NOT NULL DEFAULT 0,
  amount_to_operations    numeric NOT NULL DEFAULT 0,
  pros_paid_count         integer NOT NULL DEFAULT 0,
  fifo_positions_advanced integer NOT NULL DEFAULT 0,
  created_at              timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_sale_distributions_entry_unique
  ON public.sale_distributions (financial_entry_id);

CREATE INDEX idx_sale_distributions_created_at
  ON public.sale_distributions (created_at DESC);

-- ─── 2. Tabela pro_payouts ───────────────────────────────────────────────────
CREATE TABLE public.pro_payouts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id                uuid NOT NULL REFERENCES public.pros(id) ON DELETE CASCADE,
  sale_distribution_id  uuid NOT NULL REFERENCES public.sale_distributions(id) ON DELETE CASCADE,
  amount_paid           numeric NOT NULL DEFAULT 2.00,
  position_at_payment   integer NOT NULL,
  paid_at               timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_pro_payouts_pro_id
  ON public.pro_payouts (pro_id);

CREATE INDEX idx_pro_payouts_sale_distribution_id
  ON public.pro_payouts (sale_distribution_id);

CREATE INDEX idx_pro_payouts_paid_at
  ON public.pro_payouts (paid_at DESC);

-- ─── 3. RLS — sale_distributions ─────────────────────────────────────────────
ALTER TABLE public.sale_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view sale distributions"
  ON public.sale_distributions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sale distributions"
  ON public.sale_distributions FOR ALL
  USING (is_admin(auth.uid()));

-- ─── 4. RLS — pro_payouts ────────────────────────────────────────────────────
ALTER TABLE public.pro_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view pro payouts"
  ON public.pro_payouts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pro payouts"
  ON public.pro_payouts FOR ALL
  USING (is_admin(auth.uid()));

-- ─── 5. View pública de distribuições (sem PII) ───────────────────────────────
CREATE OR REPLACE VIEW public.public_sale_distributions AS
  SELECT
    sd.id,
    sd.financial_entry_id,
    sd.gross_amount,
    sd.amount_to_fifo,
    sd.amount_to_operations,
    sd.pros_paid_count,
    sd.fifo_positions_advanced,
    sd.created_at,
    fe.received_at AS sale_received_at,
    fe.description AS sale_description
  FROM public.sale_distributions sd
  JOIN public.financial_entries fe ON fe.id = sd.financial_entry_id;

-- ─── 6. RPC process_sale_distribution ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.process_sale_distribution(p_financial_entry_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_entry          RECORD;
  v_dist           RECORD;
  v_pro            RECORD;
  v_gross          NUMERIC;
  v_amount_to_fifo NUMERIC;
  v_amount_ops     NUMERIC;
  v_balance        NUMERIC;
  v_pros_paid      INTEGER := 0;
  v_now            TIMESTAMPTZ := now();
  v_dist_id        uuid;
  v_rate_fifo      NUMERIC := 2.0 / 3.0;   -- R$2 de cada R$3 vai para FIFO
  v_pro_value      NUMERIC := 2.00;         -- valor por PRO pago
BEGIN
  -- 1. Buscar entrada financeira
  SELECT * INTO v_entry
    FROM public.financial_entries
   WHERE id = p_financial_entry_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'financial_entry not found: %', p_financial_entry_id;
  END IF;

  -- Somente entradas com valor positivo geram distribuição
  IF v_entry.amount <= 0 THEN
    RETURN json_build_object(
      'skipped', true,
      'reason', 'negative_or_zero_amount'
    );
  END IF;

  -- 2. Evitar duplicidade
  SELECT * INTO v_dist
    FROM public.sale_distributions
   WHERE financial_entry_id = p_financial_entry_id;

  IF FOUND THEN
    RETURN json_build_object(
      'skipped', true,
      'reason', 'already_processed',
      'sale_distribution_id', v_dist.id,
      'pros_paid', v_dist.pros_paid_count
    );
  END IF;

  -- 3. Calcular divisão (R$2 para FIFO, R$1 operações a cada R$3)
  v_gross          := v_entry.amount;
  v_amount_to_fifo := ROUND(v_gross * v_rate_fifo, 2);
  v_amount_ops     := ROUND(v_gross - v_amount_to_fifo, 2);
  v_balance        := v_amount_to_fifo;

  -- 4. Criar sale_distribution
  INSERT INTO public.sale_distributions (
    financial_entry_id, gross_amount, amount_to_fifo, amount_to_operations,
    pros_paid_count, fifo_positions_advanced
  ) VALUES (
    p_financial_entry_id, v_gross, v_amount_to_fifo, v_amount_ops, 0, 0
  ) RETURNING id INTO v_dist_id;

  -- 5. Pagar PROs em ordem FIFO enquanto houver saldo
  FOR v_pro IN
    SELECT fq.id AS queue_id, fq.position, fq.pro_id, p.id AS pro_db_id
      FROM public.fifo_queue fq
      JOIN public.pros p ON p.id = fq.pro_id
     WHERE fq.status = 'sold'
       AND p.status  = 'sold'
     ORDER BY fq.position ASC
  LOOP
    EXIT WHEN v_balance < v_pro_value;

    -- Registrar payout individual
    INSERT INTO public.pro_payouts (
      pro_id, sale_distribution_id, amount_paid, position_at_payment, paid_at
    ) VALUES (
      v_pro.pro_db_id, v_dist_id, v_pro_value, v_pro.position, v_now
    );

    -- Marcar PRO como pago
    UPDATE public.pros
       SET status = 'paid', paid_at = v_now
     WHERE id = v_pro.pro_db_id;

    -- Marcar fila como pago
    UPDATE public.fifo_queue
       SET status = 'paid', paid_at = v_now
     WHERE id = v_pro.queue_id;

    v_balance    := v_balance - v_pro_value;
    v_pros_paid  := v_pros_paid + 1;
  END LOOP;

  -- 6. Atualizar sale_distribution com totais reais
  UPDATE public.sale_distributions
     SET pros_paid_count         = v_pros_paid,
         fifo_positions_advanced  = v_pros_paid
   WHERE id = v_dist_id;

  -- 7. Atualizar financial_entry
  UPDATE public.financial_entries
     SET is_distributed = true,
         distributed_at  = v_now,
         pros_paid       = pros_paid + v_pros_paid
   WHERE id = p_financial_entry_id;

  RETURN json_build_object(
    'success',              true,
    'sale_distribution_id', v_dist_id,
    'pros_paid',            v_pros_paid,
    'fifo_advanced',        v_pros_paid,
    'amount_used',          v_pros_paid * v_pro_value,
    'amount_to_fifo',       v_amount_to_fifo,
    'amount_to_operations', v_amount_ops,
    'gross_amount',         v_gross
  );
END;
$$;

-- Permitir anon chamar a view pública
GRANT SELECT ON public.public_sale_distributions TO anon, authenticated;
