
-- Backfill notification_preferences for profiles that don't have them
INSERT INTO public.notification_preferences (user_id)
SELECT p.user_id FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.notification_preferences np WHERE np.user_id = p.user_id
)
ON CONFLICT (user_id) DO NOTHING;
