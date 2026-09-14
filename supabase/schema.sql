-- NES Learning: production schema
-- Target: Supabase/PostgreSQL
-- Authorization is enforced by RLS. Helper functions that bypass RLS live in
-- a non-exposed schema and derive identity only from auth.uid().

create extension if not exists pgcrypto;

create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;

create type public.course_role as enum ('student', 'ta', 'instructor');
create type public.course_status as enum ('draft', 'active', 'archived');
create type public.material_kind as enum ('file', 'link', 'text', 'code', 'data');
create type public.submission_status as enum ('draft', 'submitted', 'late');
create type public.grade_status as enum ('draft', 'ready', 'published');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  programme text,
  cohort text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  term text not null,
  academic_year integer not null,
  status public.course_status not null default 'draft',
  description text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (code, term, academic_year)
);

create table public.course_members (
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.course_role not null,
  joined_at timestamptz not null default now(),
  primary key (course_id, user_id)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  release_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  title text not null,
  kind public.material_kind not null,
  body text,
  storage_key text,
  external_url text,
  position integer not null default 0,
  published boolean not null default false,
  release_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind = 'file' and storage_key is not null)
    or (kind = 'link' and external_url is not null)
    or (kind in ('text', 'code', 'data'))
  )
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  title text not null,
  instructions text,
  max_points numeric(8,2) not null check (max_points >= 0),
  release_at timestamptz,
  due_at timestamptz,
  published boolean not null default false,
  allow_resubmission boolean not null default true,
  allow_late boolean not null default false,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_at is null or release_at is null or due_at > release_at)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status public.submission_status not null default 'draft',
  storage_key text,
  text_response text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(8,2),
  feedback text,
  status public.grade_status not null default 'draft',
  graded_by uuid references public.profiles(id),
  graded_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id),
  check (score is null or score >= 0)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  body text not null,
  published boolean not null default false,
  publish_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  event_type text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create index course_members_user_idx on public.course_members(user_id);
create index modules_course_idx on public.modules(course_id, position);
create index materials_course_idx on public.materials(course_id, module_id, position);
create index assignments_course_due_idx on public.assignments(course_id, due_at);
create index submissions_assignment_idx on public.submissions(assignment_id, status);
create index submissions_student_idx on public.submissions(student_id);
create index grades_assignment_idx on public.grades(assignment_id, status);
create index announcements_course_idx on public.announcements(course_id, publish_at);
create index calendar_events_course_start_idx on public.calendar_events(course_id, starts_at);

-- Internal authorization helpers. SECURITY DEFINER is required here specifically
-- to inspect course_members without recursively invoking its own RLS policies.
-- The schema is not exposed through the Data API and the functions always bind
-- authorization to auth.uid().

create or replace function app_private.course_role_for(target_course uuid)
returns public.course_role
language sql
stable
security definer
set search_path = ''
as $$
  select cm.role
  from public.course_members cm
  where cm.course_id = target_course
    and cm.user_id = (select auth.uid())
  limit 1;
$$;

create or replace function app_private.is_course_member(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.course_members cm
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
  select coalesce(app_private.course_role_for(target_course) in ('ta', 'instructor'), false);
$$;

create or replace function app_private.is_course_instructor(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(app_private.course_role_for(target_course) = 'instructor', false);
$$;

create or replace function app_private.shares_course_with(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.course_members mine
    join public.course_members theirs on theirs.course_id = mine.course_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = target_user
  );
$$;

revoke all on function app_private.course_role_for(uuid) from public;
revoke all on function app_private.is_course_member(uuid) from public;
revoke all on function app_private.is_course_staff(uuid) from public;
revoke all on function app_private.is_course_instructor(uuid) from public;
revoke all on function app_private.shares_course_with(uuid) from public;
grant execute on function app_private.course_role_for(uuid) to authenticated;
grant execute on function app_private.is_course_member(uuid) to authenticated;
grant execute on function app_private.is_course_staff(uuid) to authenticated;
grant execute on function app_private.is_course_instructor(uuid) to authenticated;
grant execute on function app_private.shares_course_with(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_members enable row level security;
alter table public.modules enable row level security;
alter table public.materials enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.grades enable row level security;
alter table public.announcements enable row level security;
alter table public.calendar_events enable row level security;

-- Explicit Data API privileges. anon receives no domain-table privileges. RLS is
-- still the authorization boundary for every authenticated operation.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Profiles
create policy profiles_read_self_or_course_peers
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or app_private.shares_course_with(id)
);

create policy profiles_update_self
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Courses
create policy courses_read_members
on public.courses for select
to authenticated
using (app_private.is_course_member(id));

create policy courses_update_instructors
on public.courses for update
to authenticated
using (app_private.is_course_instructor(id))
with check (app_private.is_course_instructor(id));

-- Memberships
create policy memberships_read_self_or_staff
on public.course_members for select
to authenticated
using (user_id = (select auth.uid()) or app_private.is_course_staff(course_id));

create policy memberships_manage_instructors
on public.course_members for all
to authenticated
using (app_private.is_course_instructor(course_id))
with check (app_private.is_course_instructor(course_id));

-- Modules
create policy modules_read_members
on public.modules for select
to authenticated
using (
  app_private.is_course_staff(course_id)
  or (
    app_private.is_course_member(course_id)
    and (release_at is null or release_at <= now())
  )
);

create policy modules_manage_staff
on public.modules for all
to authenticated
using (app_private.is_course_staff(course_id))
with check (app_private.is_course_staff(course_id));

-- Materials
create policy materials_read_members
on public.materials for select
to authenticated
using (
  app_private.is_course_staff(course_id)
  or (
    app_private.is_course_member(course_id)
    and published
    and (release_at is null or release_at <= now())
  )
);

create policy materials_manage_staff
on public.materials for all
to authenticated
using (app_private.is_course_staff(course_id))
with check (app_private.is_course_staff(course_id));

-- Assignments
create policy assignments_read_members
on public.assignments for select
to authenticated
using (
  app_private.is_course_staff(course_id)
  or (
    app_private.is_course_member(course_id)
    and published
    and (release_at is null or release_at <= now())
  )
);

create policy assignments_manage_staff
on public.assignments for all
to authenticated
using (app_private.is_course_staff(course_id))
with check (app_private.is_course_staff(course_id));

-- Submissions
create policy submissions_read_owner_or_staff
on public.submissions for select
to authenticated
using (
  student_id = (select auth.uid())
  or app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id))
);

create policy submissions_insert_owner
on public.submissions for insert
to authenticated
with check (
  student_id = (select auth.uid())
  and app_private.course_role_for((select a.course_id from public.assignments a where a.id = assignment_id)) = 'student'
  and exists (
    select 1
    from public.assignments a
    where a.id = assignment_id
      and a.published
      and (a.release_at is null or a.release_at <= now())
      and (a.due_at is null or a.due_at >= now() or a.allow_late)
  )
);

create policy submissions_update_owner
on public.submissions for update
to authenticated
using (
  student_id = (select auth.uid())
  and exists (
    select 1
    from public.assignments a
    where a.id = assignment_id
      and (a.due_at is null or a.due_at >= now() or a.allow_late)
      and (submissions.status = 'draft' or a.allow_resubmission)
  )
)
with check (
  student_id = (select auth.uid())
  and exists (
    select 1
    from public.assignments a
    where a.id = assignment_id
      and a.published
      and (a.release_at is null or a.release_at <= now())
      and (a.due_at is null or a.due_at >= now() or a.allow_late)
  )
);

create policy submissions_update_staff
on public.submissions for update
to authenticated
using (app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id)))
with check (app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id)));

-- Grades
create policy grades_read_published_owner_or_staff
on public.grades for select
to authenticated
using (
  app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id))
  or (student_id = (select auth.uid()) and status = 'published')
);

create policy grades_manage_staff
on public.grades for all
to authenticated
using (app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id)))
with check (app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id)));

-- Announcements
create policy announcements_read_members
on public.announcements for select
to authenticated
using (
  app_private.is_course_staff(course_id)
  or (
    app_private.is_course_member(course_id)
    and published
    and (publish_at is null or publish_at <= now())
  )
);

create policy announcements_manage_staff
on public.announcements for all
to authenticated
using (app_private.is_course_staff(course_id))
with check (app_private.is_course_staff(course_id));

-- Calendar
create policy calendar_read_members
on public.calendar_events for select
to authenticated
using (course_id is null or app_private.is_course_member(course_id));

create policy calendar_manage_staff
on public.calendar_events for all
to authenticated
using (course_id is not null and app_private.is_course_staff(course_id))
with check (course_id is not null and app_private.is_course_staff(course_id));

-- Auth profile bootstrap. raw_user_meta_data is used only for display/profile
-- fields, never for authorization decisions.
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

-- Production follow-ups:
-- 1. Add immutable audit/version tables for submissions and grade publication.
-- 2. Add Storage buckets and storage.objects policies matching these RLS rules.
-- 3. Add configurable TA capabilities rather than treating all staff equally.
-- 4. Add an institutional admin role outside the per-course role enum.
