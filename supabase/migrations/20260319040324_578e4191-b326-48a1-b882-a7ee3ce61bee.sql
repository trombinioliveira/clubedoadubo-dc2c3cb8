
SELECT cron.schedule(
  'auto-generate-pros-job',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://himgmfvanxftyxbzxjsu.supabase.co/functions/v1/auto-generate-pros',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWdtZnZhbnhmdHl4Ynp4anN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzODQ0OTEsImV4cCI6MjA4NDk2MDQ5MX0.CFiQuaAWiuKDJ8qMlLHdCwrLqZp6yySI68nB9p5zuf8"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);
