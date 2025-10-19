alter table "public"."profiles"
  add column google_user_id text null,
  add column google_access_token text null,
  add column google_refresh_token text null,
  add column google_expires_at timestamp with time zone null,
  add column gmail_access boolean default false;

