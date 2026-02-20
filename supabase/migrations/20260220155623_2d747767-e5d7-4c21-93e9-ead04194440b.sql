
-- 1. notification_preferences
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  whatsapp_enabled boolean NOT NULL DEFAULT false,
  notify_purchase boolean NOT NULL DEFAULT true,
  notify_pro_credited boolean NOT NULL DEFAULT true,
  notify_pro_paid boolean NOT NULL DEFAULT true,
  notify_fifo_moved boolean NOT NULL DEFAULT true,
  notify_dream_milestones boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all preferences"
  ON public.notification_preferences FOR ALL
  USING (public.is_admin(auth.uid()));

-- Auto-create preferences on profile creation
CREATE OR REPLACE FUNCTION public.initialize_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_init_notification_prefs
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_notification_preferences();

-- 2. notification_events
CREATE TABLE public.notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  template text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  payload jsonb NOT NULL DEFAULT '{}',
  idempotency_key text UNIQUE NOT NULL,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notification_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
  ON public.notification_events FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can view all notifications"
  ON public.notification_events FOR SELECT
  USING (public.is_staff(auth.uid()));

CREATE INDEX idx_notification_events_status ON public.notification_events(status);
CREATE INDEX idx_notification_events_user ON public.notification_events(user_id);
CREATE INDEX idx_notification_events_idempotency ON public.notification_events(idempotency_key);
