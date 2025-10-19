CREATE OR REPLACE FUNCTION public.create_weekly_usage_track()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$

INSERT INTO usage_tracking(user_id, week_start)
SELECT p.user_id, date_trunc('week', now())
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1
    FROM usage_tracking ut
    WHERE ut.user_id = p.user_id
    AND ut.week_start >= date_trunc('week', now())
);

$function$;