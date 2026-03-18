-- ═══════════════════════════════════════════════════════════════
-- BLOQUEIO 3: Motor real de comissão por indicação
-- Dispara quando financial_entries.status = 'confirmed'
-- Calcula X% do valor total da venda para o indicador
-- Idempotente via system_ledger
-- NÃO altera o motor econômico FIFO
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.credit_referral_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referrer_profile_id uuid;
  v_referrer_user_id uuid;
  v_active_referrals integer;
  v_rate numeric;
  v_commission numeric;
  v_already_credited boolean;
BEGIN
  -- Only trigger on confirmed payments with positive amount
  IF NEW.status <> 'confirmed' OR NEW.amount <= 0 THEN
    RETURN NEW;
  END IF;

  -- Skip if no user_id
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Idempotency: check if commission already credited for this financial entry
  SELECT EXISTS (
    SELECT 1 FROM public.system_ledger
    WHERE event_type = 'referral_commission'
      AND reference_id = NEW.id
  ) INTO v_already_credited;

  IF v_already_credited THEN
    RETURN NEW;
  END IF;

  -- Check if the buyer was referred by someone
  SELECT referred_by INTO v_referrer_profile_id
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  IF v_referrer_profile_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get the referrer's user_id
  SELECT user_id INTO v_referrer_user_id
  FROM public.profiles
  WHERE id = v_referrer_profile_id;

  IF v_referrer_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count referrer's active referrals to determine their level
  v_active_referrals := public.count_active_referrals(v_referrer_user_id);

  -- Get commission rate from the referrer's current level
  SELECT rate_percent INTO v_rate
  FROM public.get_commission_level(v_active_referrals);

  IF v_rate IS NULL THEN
    v_rate := 5; -- default: Iniciante 5%
  END IF;

  -- Calculate commission on the FULL sale amount
  v_commission := ROUND(NEW.amount * v_rate / 100, 2);

  IF v_commission <= 0 THEN
    RETURN NEW;
  END IF;

  -- Credit commission to referral_stats (upsert)
  INSERT INTO public.referral_stats (user_id, commission_earned, total_sales_value, current_level)
  VALUES (v_referrer_user_id, v_commission, NEW.amount, GREATEST(v_active_referrals, 1))
  ON CONFLICT (user_id) DO UPDATE
  SET commission_earned = referral_stats.commission_earned + v_commission,
      total_sales_value = referral_stats.total_sales_value + NEW.amount,
      current_level = (
        SELECT COALESCE(
          (SELECT cl.level_number FROM public.commission_levels cl
           WHERE cl.is_active = true
             AND v_active_referrals >= cl.min_referrals
             AND (cl.max_referrals IS NULL OR v_active_referrals <= cl.max_referrals)
           ORDER BY cl.level_number DESC LIMIT 1),
          1
        )
      ),
      updated_at = now();

  -- Log to system_ledger (audit trail + idempotency anchor)
  PERFORM public.ledger_event(
    'referral_commission',
    NEW.id,
    v_referrer_user_id,
    v_commission,
    jsonb_build_object(
      'buyer_user_id', NEW.user_id,
      'sale_amount', NEW.amount,
      'rate_percent', v_rate,
      'active_referrals', v_active_referrals,
      'product_key', NEW.product_key
    )
  );

  -- Log to referral_logs (visible in Admin > Indicações > Logs)
  INSERT INTO public.referral_logs (user_id, event_type, details)
  VALUES (
    v_referrer_user_id,
    'commission_credited',
    jsonb_build_object(
      'financial_entry_id', NEW.id,
      'buyer_user_id', NEW.user_id,
      'sale_amount', NEW.amount,
      'rate_percent', v_rate,
      'commission_amount', v_commission
    )
  );

  RETURN NEW;
END;
$$;

-- Trigger: fires on every confirmed payment
CREATE TRIGGER trg_credit_referral_commission
  AFTER INSERT OR UPDATE ON public.financial_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_referral_commission();