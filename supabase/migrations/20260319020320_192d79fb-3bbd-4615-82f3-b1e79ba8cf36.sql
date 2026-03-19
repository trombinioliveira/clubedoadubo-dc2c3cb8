ALTER TABLE public.referral_logs DROP CONSTRAINT referral_logs_event_type_check;

ALTER TABLE public.referral_logs ADD CONSTRAINT referral_logs_event_type_check CHECK (
  event_type = ANY (ARRAY[
    'direct_pro_generated',
    'recurring_pro_generated',
    'global_pro_received',
    'goal_completed',
    'level_changed',
    'commission_paid',
    'commission_credited',
    'preference_changed',
    'admin_adjustment'
  ]::text[])
);