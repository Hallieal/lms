-- Automatically mirror Supabase Auth users into public.profiles.
-- Course membership and ownership records reference profiles, so this row must
-- exist before an authenticated user can participate in the LMS domain model.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

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
