create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null
);

alter table public.platform_admins enable row level security;
revoke all on public.platform_admins from anon;
grant select on public.platform_admins to authenticated;

create policy platform_admins_read_self
on public.platform_admins for select
to authenticated
using (user_id = (select auth.uid()));

create or replace function app_private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins pa
    where pa.user_id = (select auth.uid())
  );
$$;

revoke all on function app_private.is_platform_admin() from public;
grant execute on function app_private.is_platform_admin() to authenticated;

create or replace function app_private.is_course_member(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_platform_admin()
  or exists (
    select 1 from public.course_members cm
    where cm.course_id = target_course
      and cm.user_id = (select auth.uid())
  );
$$;

create or replace function app_private.is_course_staff(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_platform_admin()
    or coalesce(app_private.course_role_for(target_course) in ('ta', 'instructor'), false);
$$;

create or replace function app_private.is_course_instructor(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_platform_admin()
    or coalesce(app_private.course_role_for(target_course) = 'instructor', false);
$$;

create policy courses_insert_admin
on public.courses for insert
to authenticated
with check (app_private.is_platform_admin() and created_by = (select auth.uid()));

create policy courses_delete_admin
on public.courses for delete
to authenticated
using (app_private.is_platform_admin());
