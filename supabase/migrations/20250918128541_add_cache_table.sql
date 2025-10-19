create table "public"."json_cache" (
    "key" text primary key,
    "value" jsonb not null,
    "created_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone default (now() + interval '5 minutes')
);

grant delete on table "public"."json_cache" to "anon";

grant insert on table "public"."json_cache" to "anon";

grant references on table "public"."json_cache" to "anon";

grant select on table "public"."json_cache" to "anon";

grant trigger on table "public"."json_cache" to "anon";

grant truncate on table "public"."json_cache" to "anon";

grant update on table "public"."json_cache" to "anon";

grant delete on table "public"."json_cache" to "authenticated";

grant insert on table "public"."json_cache" to "authenticated";

grant references on table "public"."json_cache" to "authenticated";

grant select on table "public"."json_cache" to "authenticated";

grant trigger on table "public"."json_cache" to "authenticated";

grant truncate on table "public"."json_cache" to "authenticated";

grant update on table "public"."json_cache" to "authenticated";

grant delete on table "public"."json_cache" to "service_role";

grant insert on table "public"."json_cache" to "service_role";

grant references on table "public"."json_cache" to "service_role";

grant select on table "public"."json_cache" to "service_role";

grant trigger on table "public"."json_cache" to "service_role";

grant truncate on table "public"."json_cache" to "service_role";

grant update on table "public"."json_cache" to "service_role";