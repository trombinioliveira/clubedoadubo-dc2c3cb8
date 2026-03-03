
-- 1) ALTER subscriptions table to match new schema
-- Add plan_key column
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_key text;
-- Add last_payment_id column
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS last_payment_id uuid REFERENCES public.financial_entries(id);

-- Backfill plan_key from plan_type for existing rows
UPDATE public.subscriptions SET plan_key = plan_type WHERE plan_key IS NULL;

-- Make plan_key NOT NULL after backfill
ALTER TABLE public.subscriptions ALTER COLUMN plan_key SET NOT NULL;

-- Add unique constraint on user_id (drop if exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_key'
  ) THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END$$;

-- Drop old RLS policies and create new ones
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Staff and admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;

-- Users can only SELECT their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage subscriptions"
ON public.subscriptions FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Staff can view
CREATE POLICY "Staff can view subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (is_staff(auth.uid()));

-- 2) CREATE RPC get_user_dashboard_summary
CREATE OR REPLACE FUNCTION public.get_user_dashboard_summary(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result json;
  v_pros_in_cycle integer;
  v_pros_sold integer;
  v_pros_paid integer;
  v_total_received numeric;
  v_today_sales integer;
  v_today_pros_paid integer;
  v_month_sales integer;
  v_month_pros_paid integer;
  v_active_dreams integer;
  v_completed_dreams integer;
  v_has_subscription boolean;
  v_plan_key text;
  v_today date := current_date;
  v_month_start date := date_trunc('month', current_date)::date;
BEGIN
  -- Only allow the user themselves or admin/staff
  IF p_user_id != auth.uid() AND NOT is_admin(auth.uid()) AND NOT is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- A) PROs by status group
  SELECT
    COUNT(*) FILTER (WHERE status IN ('pending','processing','ready')),
    COUNT(*) FILTER (WHERE status = 'sold'),
    COUNT(*) FILTER (WHERE status = 'paid')
  INTO v_pros_in_cycle, v_pros_sold, v_pros_paid
  FROM public.pros WHERE user_id = p_user_id;

  -- B) Total received from payouts
  SELECT COALESCE(SUM(pp.amount_paid), 0)
  INTO v_total_received
  FROM public.pro_payouts pp
  JOIN public.pros p ON p.id = pp.pro_id
  WHERE p.user_id = p_user_id;

  -- C) Global movement - today
  SELECT COUNT(*)
  INTO v_today_sales
  FROM public.financial_entries
  WHERE status = 'confirmed' AND received_at::date = v_today;

  SELECT COALESCE(SUM(sd.pros_paid_count), 0)
  INTO v_today_pros_paid
  FROM public.sale_distributions sd
  JOIN public.financial_entries fe ON fe.id = sd.financial_entry_id
  WHERE fe.status = 'confirmed' AND sd.created_at::date = v_today;

  -- C) Global movement - month
  SELECT COUNT(*)
  INTO v_month_sales
  FROM public.financial_entries
  WHERE status = 'confirmed' AND received_at::date >= v_month_start;

  SELECT COALESCE(SUM(sd.pros_paid_count), 0)
  INTO v_month_pros_paid
  FROM public.sale_distributions sd
  JOIN public.financial_entries fe ON fe.id = sd.financial_entry_id
  WHERE fe.status = 'confirmed' AND sd.created_at::date >= v_month_start;

  -- D) Dreams
  SELECT
    COUNT(*) FILTER (WHERE is_completed = false),
    COUNT(*) FILTER (WHERE is_completed = true)
  INTO v_active_dreams, v_completed_dreams
  FROM public.dreams WHERE user_id = p_user_id;

  -- E) Subscription
  SELECT true, sub.plan_key
  INTO v_has_subscription, v_plan_key
  FROM public.subscriptions sub
  WHERE sub.user_id = p_user_id AND sub.status = 'active'
  LIMIT 1;

  v_has_subscription := COALESCE(v_has_subscription, false);

  v_result := json_build_object(
    'pros_in_cycle', v_pros_in_cycle,
    'pros_sold', v_pros_sold,
    'pros_paid', v_pros_paid,
    'total_received', v_total_received,
    'today_sales_count', v_today_sales,
    'today_pros_paid', v_today_pros_paid,
    'month_sales_count', v_month_sales,
    'month_pros_paid', v_month_pros_paid,
    'active_dreams_count', v_active_dreams,
    'completed_dreams_count', v_completed_dreams,
    'has_active_subscription', v_has_subscription,
    'active_plan_key', v_plan_key
  );

  RETURN v_result;
END;
$function$;
