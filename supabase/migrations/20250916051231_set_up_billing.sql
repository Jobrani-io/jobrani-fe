alter table "public"."plan_features" drop constraint plan_features_plan_type_check;

alter table "public"."subscriptions" drop constraint subscriptions_plan_type_check;

alter table "public"."plan_features" add constraint "plan_features_plan_type_check" CHECK ((plan_type = ANY (ARRAY['free'::text, 'do_it_yourself'::text, 'do_it_for_me'::text, 'do_it_with_me'::text]))) not valid;

alter table "public"."subscriptions" add constraint "subscriptions_plan_type_check" CHECK ((plan_type = ANY (ARRAY['free'::text, 'do_it_yourself'::text, 'do_it_for_me'::text, 'do_it_with_me'::text]))) not valid;

drop trigger if exists on_profile_created on public.profiles;

drop function if exists public.initialize_user_subscription();

drop function if exists public.get_week_start(date);

alter table "public"."usage_tracking" alter column week_start type timestamptz using week_start::timestamptz;

alter table "public"."usage_tracking" drop constraint if exists usage_tracking_user_id_week_start_key;

create unique index if not exists usage_tracking_user_id_week_start_key on public.usage_tracking using btree (user_id, week_start);

alter table "public"."usage_tracking" add constraint "usage_tracking_user_id_week_start_key" UNIQUE using index "usage_tracking_user_id_week_start_key";

CREATE OR REPLACE FUNCTION public.create_weekly_usage_track()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    rec record;
begin
    for rec in
        select u.id
        from users u
        join usage_tracking ut on u.id = ut.user_id
        group by u.id
        having max(ut.week_start) < now() - interval '7 days'
    loop
        insert into usage_tracking(user_id, week_start)
        values (rec.id, now());
    end loop;
end;
$function$;