create schema if not exists "api";

create table "api"."onboarding_responses" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "email" text not null,
    "mindset" text,
    "job_list_plan" text,
    "outreach_style" text,
    "salary_range" text,
    "beta_interest" boolean default false,
    "beta_click_count" integer default 0,
    "created_at" timestamp with time zone default now()
);


alter table "api"."onboarding_responses" enable row level security;

CREATE UNIQUE INDEX onboarding_responses_pkey ON api.onboarding_responses USING btree (id);

alter table "api"."onboarding_responses" add constraint "onboarding_responses_pkey" PRIMARY KEY using index "onboarding_responses_pkey";

alter table "api"."onboarding_responses" add constraint "onboarding_responses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "api"."onboarding_responses" validate constraint "onboarding_responses_user_id_fkey";

create policy "Jobrani.io - Security"
on "api"."onboarding_responses"
as restrictive
for all
to authenticated, anon
using (false)
with check (false);



create table "public"."approved_prospects" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "company" text not null,
    "job_title" text not null,
    "industry" text not null,
    "contact_type" text not null default 'linkedin'::text,
    "job_opening" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."approved_prospects" enable row level security;

create table "public"."beta_waitlist" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "user_id" uuid,
    "source" text default 'toast'::text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."beta_waitlist" enable row level security;

create table "public"."daily_generation_limits" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "generation_date" date not null default CURRENT_DATE,
    "messages_generated" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."daily_generation_limits" enable row level security;

create table "public"."generated_messages" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "prospect_id" uuid not null,
    "message_content" text not null,
    "custom_instructions" text,
    "generation_date" date not null default CURRENT_DATE,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "platform_type" text,
    "custom_instruction" text
);


alter table "public"."generated_messages" enable row level security;

create table "public"."linkedin_saved_jobs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "job_title" text not null,
    "company_name" text not null,
    "location" text,
    "posted_date" text,
    "job_url" text,
    "status" text default 'ready-to-complete'::text,
    "scraped_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "linkedin_job_id" text not null
);


alter table "public"."linkedin_saved_jobs" enable row level security;

create table "public"."plan_features" (
    "id" uuid not null default gen_random_uuid(),
    "plan_type" text not null,
    "feature_name" text not null,
    "weekly_limit" integer,
    "enabled" boolean not null default true,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."plan_features" enable row level security;

create table "public"."preferred_matches" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "job_id" text not null,
    "selected_match" jsonb not null,
    "preferred_at" timestamp with time zone not null default now()
);


alter table "public"."preferred_matches" enable row level security;

create table "public"."profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "email" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "job_search_mindset" text,
    "target_jobs" text,
    "target_jobs_custom" text,
    "outreach_style" text,
    "salary_range" text,
    "onboarding_completed" boolean not null default false,
    "linkedin_connected" boolean default false,
    "linkedin_last_scraped" timestamp with time zone,
    "linkedin_scraping_status" text default 'idle'::text,
    "resume_info" jsonb
);


alter table "public"."profiles" enable row level security;

create table "public"."prospect_matches" (
    "id" uuid not null default gen_random_uuid(),
    "job_id" text not null,
    "user_id" uuid not null,
    "matches" jsonb not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."prospect_matches" enable row level security;

create table "public"."saved_prospects" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "prospect_id" text not null,
    "company" text not null,
    "job_title" text not null,
    "location" text,
    "posted_on" text,
    "saved_date" timestamp with time zone not null default now(),
    "url" text
);


alter table "public"."saved_prospects" enable row level security;

create table "public"."subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "plan_type" text not null,
    "status" text not null default 'active'::text,
    "billing_cycle" text not null default 'weekly'::text,
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "current_period_start" timestamp with time zone not null default now(),
    "current_period_end" timestamp with time zone not null default (now() + '7 days'::interval),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."subscriptions" enable row level security;

create table "public"."usage_tracking" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "week_start" date not null,
    "jobs_searched" integer not null default 0,
    "prospects_found" integer not null default 0,
    "messages_generated" integer not null default 0,
    "outreach_sent" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."usage_tracking" enable row level security;

create table "public"."user_resumes" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "file_name" text not null,
    "content" text not null,
    "highlights" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."user_resumes" enable row level security;

CREATE UNIQUE INDEX approved_prospects_pkey ON public.approved_prospects USING btree (id);

CREATE UNIQUE INDEX beta_waitlist_pkey ON public.beta_waitlist USING btree (id);

CREATE UNIQUE INDEX daily_generation_limits_pkey ON public.daily_generation_limits USING btree (id);

CREATE UNIQUE INDEX daily_generation_limits_user_id_generation_date_key ON public.daily_generation_limits USING btree (user_id, generation_date);

CREATE UNIQUE INDEX generated_messages_pkey ON public.generated_messages USING btree (id);

CREATE INDEX idx_linkedin_saved_jobs_company ON public.linkedin_saved_jobs USING btree (company_name);

CREATE INDEX idx_linkedin_saved_jobs_scraped_at ON public.linkedin_saved_jobs USING btree (scraped_at);

CREATE INDEX idx_linkedin_saved_jobs_status ON public.linkedin_saved_jobs USING btree (status);

CREATE UNIQUE INDEX idx_linkedin_saved_jobs_unique ON public.linkedin_saved_jobs USING btree (user_id, job_url) WHERE (job_url IS NOT NULL);

CREATE INDEX idx_linkedin_saved_jobs_user_id ON public.linkedin_saved_jobs USING btree (user_id);

CREATE INDEX idx_preferred_matches_job_id ON public.preferred_matches USING btree (job_id);

CREATE INDEX idx_preferred_matches_user_id ON public.preferred_matches USING btree (user_id);

CREATE INDEX idx_prospect_matches_job_id ON public.prospect_matches USING btree (job_id);

CREATE INDEX idx_prospect_matches_user_id ON public.prospect_matches USING btree (user_id);

CREATE INDEX idx_saved_prospects_job_id ON public.saved_prospects USING btree (prospect_id);

CREATE INDEX idx_saved_prospects_user_id ON public.saved_prospects USING btree (user_id);

CREATE UNIQUE INDEX linkedin_saved_jobs_pkey ON public.linkedin_saved_jobs USING btree (id);

CREATE UNIQUE INDEX plan_features_pkey ON public.plan_features USING btree (id);

CREATE UNIQUE INDEX plan_features_plan_type_feature_name_key ON public.plan_features USING btree (plan_type, feature_name);

CREATE UNIQUE INDEX preferred_matches_pkey ON public.preferred_matches USING btree (id);

CREATE UNIQUE INDEX preferred_matches_user_id_job_id_key ON public.preferred_matches USING btree (user_id, job_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);

CREATE UNIQUE INDEX prospect_matches_pkey ON public.prospect_matches USING btree (id);

CREATE UNIQUE INDEX prospect_matches_user_id_job_id_key ON public.prospect_matches USING btree (user_id, job_id);

CREATE UNIQUE INDEX saved_prospects_pkey ON public.saved_prospects USING btree (id);

CREATE UNIQUE INDEX saved_prospects_user_id_job_id_key ON public.saved_prospects USING btree (user_id, prospect_id);

CREATE UNIQUE INDEX saved_prospects_user_prospect_unique ON public.saved_prospects USING btree (user_id, prospect_id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX usage_tracking_pkey ON public.usage_tracking USING btree (id);

CREATE UNIQUE INDEX usage_tracking_user_id_week_start_key ON public.usage_tracking USING btree (user_id, week_start);

CREATE UNIQUE INDEX user_resumes_pkey ON public.user_resumes USING btree (id);

alter table "public"."approved_prospects" add constraint "approved_prospects_pkey" PRIMARY KEY using index "approved_prospects_pkey";

alter table "public"."beta_waitlist" add constraint "beta_waitlist_pkey" PRIMARY KEY using index "beta_waitlist_pkey";

alter table "public"."daily_generation_limits" add constraint "daily_generation_limits_pkey" PRIMARY KEY using index "daily_generation_limits_pkey";

alter table "public"."generated_messages" add constraint "generated_messages_pkey" PRIMARY KEY using index "generated_messages_pkey";

alter table "public"."linkedin_saved_jobs" add constraint "linkedin_saved_jobs_pkey" PRIMARY KEY using index "linkedin_saved_jobs_pkey";

alter table "public"."plan_features" add constraint "plan_features_pkey" PRIMARY KEY using index "plan_features_pkey";

alter table "public"."preferred_matches" add constraint "preferred_matches_pkey" PRIMARY KEY using index "preferred_matches_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."prospect_matches" add constraint "prospect_matches_pkey" PRIMARY KEY using index "prospect_matches_pkey";

alter table "public"."saved_prospects" add constraint "saved_prospects_pkey" PRIMARY KEY using index "saved_prospects_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."usage_tracking" add constraint "usage_tracking_pkey" PRIMARY KEY using index "usage_tracking_pkey";

alter table "public"."user_resumes" add constraint "user_resumes_pkey" PRIMARY KEY using index "user_resumes_pkey";

alter table "public"."beta_waitlist" add constraint "beta_waitlist_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."beta_waitlist" validate constraint "beta_waitlist_user_id_fkey";

alter table "public"."daily_generation_limits" add constraint "daily_generation_limits_user_id_generation_date_key" UNIQUE using index "daily_generation_limits_user_id_generation_date_key";

alter table "public"."generated_messages" add constraint "generated_messages_prospect_id_fkey" FOREIGN KEY (prospect_id) REFERENCES approved_prospects(id) ON DELETE CASCADE not valid;

alter table "public"."generated_messages" validate constraint "generated_messages_prospect_id_fkey";

alter table "public"."linkedin_saved_jobs" add constraint "linkedin_saved_jobs_status_check" CHECK ((status = ANY (ARRAY['ready-to-complete'::text, 'completed'::text, 'archived'::text]))) not valid;

alter table "public"."linkedin_saved_jobs" validate constraint "linkedin_saved_jobs_status_check";

alter table "public"."linkedin_saved_jobs" add constraint "linkedin_saved_jobs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."linkedin_saved_jobs" validate constraint "linkedin_saved_jobs_user_id_fkey";

alter table "public"."plan_features" add constraint "plan_features_plan_type_check" CHECK ((plan_type = ANY (ARRAY['free'::text, 'pro'::text, 'premium'::text]))) not valid;

alter table "public"."plan_features" validate constraint "plan_features_plan_type_check";

alter table "public"."plan_features" add constraint "plan_features_plan_type_feature_name_key" UNIQUE using index "plan_features_plan_type_feature_name_key";

alter table "public"."preferred_matches" add constraint "preferred_matches_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."preferred_matches" validate constraint "preferred_matches_user_id_fkey";

alter table "public"."preferred_matches" add constraint "preferred_matches_user_id_job_id_key" UNIQUE using index "preferred_matches_user_id_job_id_key";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_key" UNIQUE using index "profiles_user_id_key";

alter table "public"."prospect_matches" add constraint "prospect_matches_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."prospect_matches" validate constraint "prospect_matches_user_id_fkey";

alter table "public"."prospect_matches" add constraint "prospect_matches_user_id_job_id_key" UNIQUE using index "prospect_matches_user_id_job_id_key";

alter table "public"."saved_prospects" add constraint "saved_prospects_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."saved_prospects" validate constraint "saved_prospects_user_id_fkey";

alter table "public"."saved_prospects" add constraint "saved_prospects_user_id_job_id_key" UNIQUE using index "saved_prospects_user_id_job_id_key";

alter table "public"."subscriptions" add constraint "subscriptions_billing_cycle_check" CHECK ((billing_cycle = ANY (ARRAY['weekly'::text, 'monthly'::text]))) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_billing_cycle_check";

alter table "public"."subscriptions" add constraint "subscriptions_plan_type_check" CHECK ((plan_type = ANY (ARRAY['free'::text, 'pro'::text, 'premium'::text]))) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_plan_type_check";

alter table "public"."subscriptions" add constraint "subscriptions_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'canceled'::text, 'past_due'::text, 'unpaid'::text]))) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_status_check";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

alter table "public"."usage_tracking" add constraint "usage_tracking_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."usage_tracking" validate constraint "usage_tracking_user_id_fkey";

alter table "public"."usage_tracking" add constraint "usage_tracking_user_id_week_start_key" UNIQUE using index "usage_tracking_user_id_week_start_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_week_start(input_date date DEFAULT CURRENT_DATE)
 RETURNS date
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  -- Calculate the start of the week (Monday)
  RETURN input_date - INTERVAL '1 day' * ((EXTRACT(DOW FROM input_date)::integer + 6) % 7);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.initialize_user_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Create default subscription (free plan)
  INSERT INTO public.subscriptions (
    user_id, 
    plan_type, 
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.user_id, 
    'free',
    now(),
    now() + INTERVAL '7 days'
  );
  
  -- Create initial usage tracking for current week
  INSERT INTO public.usage_tracking (
    user_id,
    week_start
  ) VALUES (
    NEW.user_id,
    public.get_week_start()
  );
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_linkedin_connection_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update profiles table when jobs are scraped
    UPDATE profiles 
    SET 
        linkedin_connected = TRUE,
        linkedin_last_scraped = NEW.scraped_at,
        linkedin_scraping_status = 'completed'
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."approved_prospects" to "anon";

grant insert on table "public"."approved_prospects" to "anon";

grant references on table "public"."approved_prospects" to "anon";

grant select on table "public"."approved_prospects" to "anon";

grant trigger on table "public"."approved_prospects" to "anon";

grant truncate on table "public"."approved_prospects" to "anon";

grant update on table "public"."approved_prospects" to "anon";

grant delete on table "public"."approved_prospects" to "authenticated";

grant insert on table "public"."approved_prospects" to "authenticated";

grant references on table "public"."approved_prospects" to "authenticated";

grant select on table "public"."approved_prospects" to "authenticated";

grant trigger on table "public"."approved_prospects" to "authenticated";

grant truncate on table "public"."approved_prospects" to "authenticated";

grant update on table "public"."approved_prospects" to "authenticated";

grant delete on table "public"."approved_prospects" to "service_role";

grant insert on table "public"."approved_prospects" to "service_role";

grant references on table "public"."approved_prospects" to "service_role";

grant select on table "public"."approved_prospects" to "service_role";

grant trigger on table "public"."approved_prospects" to "service_role";

grant truncate on table "public"."approved_prospects" to "service_role";

grant update on table "public"."approved_prospects" to "service_role";

grant delete on table "public"."beta_waitlist" to "anon";

grant insert on table "public"."beta_waitlist" to "anon";

grant references on table "public"."beta_waitlist" to "anon";

grant select on table "public"."beta_waitlist" to "anon";

grant trigger on table "public"."beta_waitlist" to "anon";

grant truncate on table "public"."beta_waitlist" to "anon";

grant update on table "public"."beta_waitlist" to "anon";

grant delete on table "public"."beta_waitlist" to "authenticated";

grant insert on table "public"."beta_waitlist" to "authenticated";

grant references on table "public"."beta_waitlist" to "authenticated";

grant select on table "public"."beta_waitlist" to "authenticated";

grant trigger on table "public"."beta_waitlist" to "authenticated";

grant truncate on table "public"."beta_waitlist" to "authenticated";

grant update on table "public"."beta_waitlist" to "authenticated";

grant delete on table "public"."beta_waitlist" to "service_role";

grant insert on table "public"."beta_waitlist" to "service_role";

grant references on table "public"."beta_waitlist" to "service_role";

grant select on table "public"."beta_waitlist" to "service_role";

grant trigger on table "public"."beta_waitlist" to "service_role";

grant truncate on table "public"."beta_waitlist" to "service_role";

grant update on table "public"."beta_waitlist" to "service_role";

grant delete on table "public"."daily_generation_limits" to "anon";

grant insert on table "public"."daily_generation_limits" to "anon";

grant references on table "public"."daily_generation_limits" to "anon";

grant select on table "public"."daily_generation_limits" to "anon";

grant trigger on table "public"."daily_generation_limits" to "anon";

grant truncate on table "public"."daily_generation_limits" to "anon";

grant update on table "public"."daily_generation_limits" to "anon";

grant delete on table "public"."daily_generation_limits" to "authenticated";

grant insert on table "public"."daily_generation_limits" to "authenticated";

grant references on table "public"."daily_generation_limits" to "authenticated";

grant select on table "public"."daily_generation_limits" to "authenticated";

grant trigger on table "public"."daily_generation_limits" to "authenticated";

grant truncate on table "public"."daily_generation_limits" to "authenticated";

grant update on table "public"."daily_generation_limits" to "authenticated";

grant delete on table "public"."daily_generation_limits" to "service_role";

grant insert on table "public"."daily_generation_limits" to "service_role";

grant references on table "public"."daily_generation_limits" to "service_role";

grant select on table "public"."daily_generation_limits" to "service_role";

grant trigger on table "public"."daily_generation_limits" to "service_role";

grant truncate on table "public"."daily_generation_limits" to "service_role";

grant update on table "public"."daily_generation_limits" to "service_role";

grant delete on table "public"."generated_messages" to "anon";

grant insert on table "public"."generated_messages" to "anon";

grant references on table "public"."generated_messages" to "anon";

grant select on table "public"."generated_messages" to "anon";

grant trigger on table "public"."generated_messages" to "anon";

grant truncate on table "public"."generated_messages" to "anon";

grant update on table "public"."generated_messages" to "anon";

grant delete on table "public"."generated_messages" to "authenticated";

grant insert on table "public"."generated_messages" to "authenticated";

grant references on table "public"."generated_messages" to "authenticated";

grant select on table "public"."generated_messages" to "authenticated";

grant trigger on table "public"."generated_messages" to "authenticated";

grant truncate on table "public"."generated_messages" to "authenticated";

grant update on table "public"."generated_messages" to "authenticated";

grant delete on table "public"."generated_messages" to "service_role";

grant insert on table "public"."generated_messages" to "service_role";

grant references on table "public"."generated_messages" to "service_role";

grant select on table "public"."generated_messages" to "service_role";

grant trigger on table "public"."generated_messages" to "service_role";

grant truncate on table "public"."generated_messages" to "service_role";

grant update on table "public"."generated_messages" to "service_role";

grant delete on table "public"."linkedin_saved_jobs" to "anon";

grant insert on table "public"."linkedin_saved_jobs" to "anon";

grant references on table "public"."linkedin_saved_jobs" to "anon";

grant select on table "public"."linkedin_saved_jobs" to "anon";

grant trigger on table "public"."linkedin_saved_jobs" to "anon";

grant truncate on table "public"."linkedin_saved_jobs" to "anon";

grant update on table "public"."linkedin_saved_jobs" to "anon";

grant delete on table "public"."linkedin_saved_jobs" to "authenticated";

grant insert on table "public"."linkedin_saved_jobs" to "authenticated";

grant references on table "public"."linkedin_saved_jobs" to "authenticated";

grant select on table "public"."linkedin_saved_jobs" to "authenticated";

grant trigger on table "public"."linkedin_saved_jobs" to "authenticated";

grant truncate on table "public"."linkedin_saved_jobs" to "authenticated";

grant update on table "public"."linkedin_saved_jobs" to "authenticated";

grant delete on table "public"."linkedin_saved_jobs" to "service_role";

grant insert on table "public"."linkedin_saved_jobs" to "service_role";

grant references on table "public"."linkedin_saved_jobs" to "service_role";

grant select on table "public"."linkedin_saved_jobs" to "service_role";

grant trigger on table "public"."linkedin_saved_jobs" to "service_role";

grant truncate on table "public"."linkedin_saved_jobs" to "service_role";

grant update on table "public"."linkedin_saved_jobs" to "service_role";

grant delete on table "public"."plan_features" to "anon";

grant insert on table "public"."plan_features" to "anon";

grant references on table "public"."plan_features" to "anon";

grant select on table "public"."plan_features" to "anon";

grant trigger on table "public"."plan_features" to "anon";

grant truncate on table "public"."plan_features" to "anon";

grant update on table "public"."plan_features" to "anon";

grant delete on table "public"."plan_features" to "authenticated";

grant insert on table "public"."plan_features" to "authenticated";

grant references on table "public"."plan_features" to "authenticated";

grant select on table "public"."plan_features" to "authenticated";

grant trigger on table "public"."plan_features" to "authenticated";

grant truncate on table "public"."plan_features" to "authenticated";

grant update on table "public"."plan_features" to "authenticated";

grant delete on table "public"."plan_features" to "service_role";

grant insert on table "public"."plan_features" to "service_role";

grant references on table "public"."plan_features" to "service_role";

grant select on table "public"."plan_features" to "service_role";

grant trigger on table "public"."plan_features" to "service_role";

grant truncate on table "public"."plan_features" to "service_role";

grant update on table "public"."plan_features" to "service_role";

grant delete on table "public"."preferred_matches" to "anon";

grant insert on table "public"."preferred_matches" to "anon";

grant references on table "public"."preferred_matches" to "anon";

grant select on table "public"."preferred_matches" to "anon";

grant trigger on table "public"."preferred_matches" to "anon";

grant truncate on table "public"."preferred_matches" to "anon";

grant update on table "public"."preferred_matches" to "anon";

grant delete on table "public"."preferred_matches" to "authenticated";

grant insert on table "public"."preferred_matches" to "authenticated";

grant references on table "public"."preferred_matches" to "authenticated";

grant select on table "public"."preferred_matches" to "authenticated";

grant trigger on table "public"."preferred_matches" to "authenticated";

grant truncate on table "public"."preferred_matches" to "authenticated";

grant update on table "public"."preferred_matches" to "authenticated";

grant delete on table "public"."preferred_matches" to "service_role";

grant insert on table "public"."preferred_matches" to "service_role";

grant references on table "public"."preferred_matches" to "service_role";

grant select on table "public"."preferred_matches" to "service_role";

grant trigger on table "public"."preferred_matches" to "service_role";

grant truncate on table "public"."preferred_matches" to "service_role";

grant update on table "public"."preferred_matches" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."prospect_matches" to "anon";

grant insert on table "public"."prospect_matches" to "anon";

grant references on table "public"."prospect_matches" to "anon";

grant select on table "public"."prospect_matches" to "anon";

grant trigger on table "public"."prospect_matches" to "anon";

grant truncate on table "public"."prospect_matches" to "anon";

grant update on table "public"."prospect_matches" to "anon";

grant delete on table "public"."prospect_matches" to "authenticated";

grant insert on table "public"."prospect_matches" to "authenticated";

grant references on table "public"."prospect_matches" to "authenticated";

grant select on table "public"."prospect_matches" to "authenticated";

grant trigger on table "public"."prospect_matches" to "authenticated";

grant truncate on table "public"."prospect_matches" to "authenticated";

grant update on table "public"."prospect_matches" to "authenticated";

grant delete on table "public"."prospect_matches" to "service_role";

grant insert on table "public"."prospect_matches" to "service_role";

grant references on table "public"."prospect_matches" to "service_role";

grant select on table "public"."prospect_matches" to "service_role";

grant trigger on table "public"."prospect_matches" to "service_role";

grant truncate on table "public"."prospect_matches" to "service_role";

grant update on table "public"."prospect_matches" to "service_role";

grant delete on table "public"."saved_prospects" to "anon";

grant insert on table "public"."saved_prospects" to "anon";

grant references on table "public"."saved_prospects" to "anon";

grant select on table "public"."saved_prospects" to "anon";

grant trigger on table "public"."saved_prospects" to "anon";

grant truncate on table "public"."saved_prospects" to "anon";

grant update on table "public"."saved_prospects" to "anon";

grant delete on table "public"."saved_prospects" to "authenticated";

grant insert on table "public"."saved_prospects" to "authenticated";

grant references on table "public"."saved_prospects" to "authenticated";

grant select on table "public"."saved_prospects" to "authenticated";

grant trigger on table "public"."saved_prospects" to "authenticated";

grant truncate on table "public"."saved_prospects" to "authenticated";

grant update on table "public"."saved_prospects" to "authenticated";

grant delete on table "public"."saved_prospects" to "service_role";

grant insert on table "public"."saved_prospects" to "service_role";

grant references on table "public"."saved_prospects" to "service_role";

grant select on table "public"."saved_prospects" to "service_role";

grant trigger on table "public"."saved_prospects" to "service_role";

grant truncate on table "public"."saved_prospects" to "service_role";

grant update on table "public"."saved_prospects" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."usage_tracking" to "anon";

grant insert on table "public"."usage_tracking" to "anon";

grant references on table "public"."usage_tracking" to "anon";

grant select on table "public"."usage_tracking" to "anon";

grant trigger on table "public"."usage_tracking" to "anon";

grant truncate on table "public"."usage_tracking" to "anon";

grant update on table "public"."usage_tracking" to "anon";

grant delete on table "public"."usage_tracking" to "authenticated";

grant insert on table "public"."usage_tracking" to "authenticated";

grant references on table "public"."usage_tracking" to "authenticated";

grant select on table "public"."usage_tracking" to "authenticated";

grant trigger on table "public"."usage_tracking" to "authenticated";

grant truncate on table "public"."usage_tracking" to "authenticated";

grant update on table "public"."usage_tracking" to "authenticated";

grant delete on table "public"."usage_tracking" to "service_role";

grant insert on table "public"."usage_tracking" to "service_role";

grant references on table "public"."usage_tracking" to "service_role";

grant select on table "public"."usage_tracking" to "service_role";

grant trigger on table "public"."usage_tracking" to "service_role";

grant truncate on table "public"."usage_tracking" to "service_role";

grant update on table "public"."usage_tracking" to "service_role";

grant delete on table "public"."user_resumes" to "anon";

grant insert on table "public"."user_resumes" to "anon";

grant references on table "public"."user_resumes" to "anon";

grant select on table "public"."user_resumes" to "anon";

grant trigger on table "public"."user_resumes" to "anon";

grant truncate on table "public"."user_resumes" to "anon";

grant update on table "public"."user_resumes" to "anon";

grant delete on table "public"."user_resumes" to "authenticated";

grant insert on table "public"."user_resumes" to "authenticated";

grant references on table "public"."user_resumes" to "authenticated";

grant select on table "public"."user_resumes" to "authenticated";

grant trigger on table "public"."user_resumes" to "authenticated";

grant truncate on table "public"."user_resumes" to "authenticated";

grant update on table "public"."user_resumes" to "authenticated";

grant delete on table "public"."user_resumes" to "service_role";

grant insert on table "public"."user_resumes" to "service_role";

grant references on table "public"."user_resumes" to "service_role";

grant select on table "public"."user_resumes" to "service_role";

grant trigger on table "public"."user_resumes" to "service_role";

grant truncate on table "public"."user_resumes" to "service_role";

grant update on table "public"."user_resumes" to "service_role";

create policy "Users can delete their own approved prospects"
on "public"."approved_prospects"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own approved prospects"
on "public"."approved_prospects"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own approved prospects"
on "public"."approved_prospects"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own approved prospects"
on "public"."approved_prospects"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Anyone can insert into beta_waitlist"
on "public"."beta_waitlist"
as permissive
for insert
to public
with check (true);


create policy "Users can view their own waitlist entries"
on "public"."beta_waitlist"
as permissive
for select
to public
using (((auth.uid() = user_id) OR (user_id IS NULL)));


create policy "Users can insert their own generation limits"
on "public"."daily_generation_limits"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own generation limits"
on "public"."daily_generation_limits"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own generation limits"
on "public"."daily_generation_limits"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own generated messages"
on "public"."generated_messages"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own generated messages"
on "public"."generated_messages"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own generated messages"
on "public"."generated_messages"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own generated messages"
on "public"."generated_messages"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own saved jobs"
on "public"."linkedin_saved_jobs"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own saved jobs"
on "public"."linkedin_saved_jobs"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own saved jobs"
on "public"."linkedin_saved_jobs"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own saved jobs"
on "public"."linkedin_saved_jobs"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Anyone can view plan features"
on "public"."plan_features"
as permissive
for select
to public
using (true);


create policy "Service role can manage plan features"
on "public"."plan_features"
as permissive
for all
to public
using (true);


create policy "Users can create their own preferred matches"
on "public"."preferred_matches"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can delete their own preferred matches"
on "public"."preferred_matches"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update their own preferred matches"
on "public"."preferred_matches"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own preferred matches"
on "public"."preferred_matches"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can create their own profile"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can create their own prospect matches"
on "public"."prospect_matches"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can delete their own prospect matches"
on "public"."prospect_matches"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update their own prospect matches"
on "public"."prospect_matches"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own prospect matches"
on "public"."prospect_matches"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can create their own saved prospects"
on "public"."saved_prospects"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can delete their own saved prospects"
on "public"."saved_prospects"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update their own saved prospects"
on "public"."saved_prospects"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own saved prospects"
on "public"."saved_prospects"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Service role can manage subscriptions"
on "public"."subscriptions"
as permissive
for all
to public
using (true);


create policy "Users can update their own subscription"
on "public"."subscriptions"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own subscription"
on "public"."subscriptions"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Service role can manage usage"
on "public"."usage_tracking"
as permissive
for all
to public
using (true);


create policy "Users can update their own usage"
on "public"."usage_tracking"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own usage"
on "public"."usage_tracking"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own resumes"
on "public"."user_resumes"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own resumes"
on "public"."user_resumes"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own resumes"
on "public"."user_resumes"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own resumes"
on "public"."user_resumes"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_beta_waitlist_updated_at BEFORE UPDATE ON public.beta_waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_generation_limits_updated_at BEFORE UPDATE ON public.daily_generation_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_messages_updated_at BEFORE UPDATE ON public.generated_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_connection_status_trigger AFTER INSERT ON public.linkedin_saved_jobs FOR EACH ROW EXECUTE FUNCTION update_linkedin_connection_status();

CREATE TRIGGER update_linkedin_saved_jobs_updated_at BEFORE UPDATE ON public.linkedin_saved_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_profile_created AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION initialize_user_subscription();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON public.usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_resumes_updated_at BEFORE UPDATE ON public.user_resumes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


