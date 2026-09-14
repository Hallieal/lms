-- Automatically mirror Supabase Auth users into public.profiles.
-- This trigger function is SECURITY DEFINER because auth.users is owned by the
-- auth subsystem, but it lives in a non-exposed schema and is not callable by
-- public API roles.

create schema if not exists app_private;
revoke all on schema app_private from public;

grant usage on schema app_private to authenticated;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, programme, cohort)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'NES User'
    ),
    nullif(new.raw_user_meta_data ->> 'programme', ''),
    nullif(new.raw_user_meta_data ->> 'cohort', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function app_private.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure app_private.handle_new_user();

-- Backfill profiles for users that existed before this migration.
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'display_name', ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'NES User'
  )
from auth.users u
on conflict (id) do nothing;
