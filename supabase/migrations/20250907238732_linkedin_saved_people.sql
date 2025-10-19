create table "public"."linkedin_saved_people" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "linkedin_id" text not null,
    "name" text not null,
    "title" text not null,
    "company" text not null,
    "profile_url" text not null,
    "status" text default 'ready-to-complete'::text,
    "updated_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now()
);

alter table "public"."linkedin_saved_people" enable row level security;

CREATE INDEX idx_linkedin_saved_people_user_id ON public.linkedin_saved_people USING btree (user_id);

CREATE UNIQUE INDEX linkedin_saved_people_pkey ON public.linkedin_saved_people USING btree (id);

CREATE INDEX idx_linkedin_saved_people_company ON public.linkedin_saved_people USING btree (company);

CREATE INDEX idx_linkedin_saved_people_status ON public.linkedin_saved_people USING btree (status);

CREATE UNIQUE INDEX idx_linkedin_saved_people_unique ON public.linkedin_saved_people USING btree (user_id, linkedin_id) WHERE (linkedin_id IS NOT NULL);

alter table "public"."linkedin_saved_people" add constraint "linkedin_saved_people_pkey" PRIMARY KEY using index "linkedin_saved_people_pkey";

alter table "public"."linkedin_saved_people" add constraint "linkedin_saved_people_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."linkedin_saved_people" validate constraint "linkedin_saved_people_user_id_fkey";

alter table "public"."linkedin_saved_people" add constraint "linkedin_saved_people_status_check" CHECK ((status = ANY (ARRAY['ready-to-complete'::text, 'completed'::text, 'archived'::text]))) not valid;

alter table "public"."linkedin_saved_people" validate constraint "linkedin_saved_people_status_check";

create policy "Users can delete their own saved people"
on "public"."linkedin_saved_people"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own saved people"
on "public"."linkedin_saved_people"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own saved people"
on "public"."linkedin_saved_people"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own saved people"
on "public"."linkedin_saved_people"
as permissive
for select
to public
using ((auth.uid() = user_id));


grant delete on table "public"."linkedin_saved_people" to "anon";

grant insert on table "public"."linkedin_saved_people" to "anon";

grant references on table "public"."linkedin_saved_people" to "anon";

grant select on table "public"."linkedin_saved_people" to "anon";

grant trigger on table "public"."linkedin_saved_people" to "anon";

grant truncate on table "public"."linkedin_saved_people" to "anon";

grant update on table "public"."linkedin_saved_people" to "anon";

grant delete on table "public"."linkedin_saved_people" to "authenticated";

grant insert on table "public"."linkedin_saved_people" to "authenticated";

grant references on table "public"."linkedin_saved_people" to "authenticated";

grant select on table "public"."linkedin_saved_people" to "authenticated";

grant trigger on table "public"."linkedin_saved_people" to "authenticated";

grant truncate on table "public"."linkedin_saved_people" to "authenticated";

grant update on table "public"."linkedin_saved_people" to "authenticated";

grant delete on table "public"."linkedin_saved_people" to "service_role";

grant insert on table "public"."linkedin_saved_people" to "service_role";

grant references on table "public"."linkedin_saved_people" to "service_role";

grant select on table "public"."linkedin_saved_people" to "service_role";

grant trigger on table "public"."linkedin_saved_people" to "service_role";

grant truncate on table "public"."linkedin_saved_people" to "service_role";

grant update on table "public"."linkedin_saved_people" to "service_role";

CREATE TRIGGER update_linkedin_saved_people_updated_at BEFORE UPDATE ON public.linkedin_saved_people FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();