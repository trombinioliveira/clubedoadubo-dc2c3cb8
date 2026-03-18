
-- Dream milestone notification trigger
-- Fires when a dream crosses 25%, 50%, 75%, or 100% threshold
CREATE OR REPLACE FUNCTION public.notify_dream_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_dream RECORD;
  v_old_pct integer;
  v_new_pct integer;
  v_milestone integer;
  v_thresholds integer[] := ARRAY[25, 50, 75, 100];
BEGIN
  -- Only trigger on status change to 'paid'
  IF NEW.status <> 'paid' OR OLD.status = 'paid' THEN
    RETURN NEW;
  END IF;

  -- Only if PRO is connected to a dream
  IF NEW.dream_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get dream details
  SELECT * INTO v_dream FROM public.dreams WHERE id = NEW.dream_id;
  IF NOT FOUND OR v_dream.target_amount <= 0 THEN
    RETURN NEW;
  END IF;

  -- Calculate old and new percentage (R$2 per paid PRO)
  -- old_amount = current dream amount before this PRO was paid
  -- new_amount = old + 2
  v_old_pct := LEAST(100, FLOOR(((v_dream.current_amount)::numeric / v_dream.target_amount) * 100));
  v_new_pct := LEAST(100, FLOOR(((v_dream.current_amount + 2)::numeric / v_dream.target_amount) * 100));

  -- Check each threshold
  FOREACH v_milestone IN ARRAY v_thresholds LOOP
    IF v_old_pct < v_milestone AND v_new_pct >= v_milestone THEN
      -- Insert notification event with idempotency
      INSERT INTO public.notification_events (
        user_id, template, channel, payload, idempotency_key
      ) VALUES (
        NEW.user_id,
        'dream_milestone',
        'email',
        jsonb_build_object(
          'dream_title', v_dream.title,
          'progress', v_milestone,
          'current_amount', v_dream.current_amount + 2,
          'target_amount', v_dream.target_amount
        ),
        'dream_milestone_' || NEW.dream_id || '_' || v_milestone
      )
      ON CONFLICT DO NOTHING;

      -- Only fire for the highest crossed threshold
      EXIT;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Attach trigger to pros table
DROP TRIGGER IF EXISTS trg_notify_dream_milestone ON public.pros;
CREATE TRIGGER trg_notify_dream_milestone
  AFTER UPDATE OF status ON public.pros
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_dream_milestone();
