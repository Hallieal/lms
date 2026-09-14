-- NES Learning: initial production schema draft
-- Target: Supabase/PostgreSQL
-- This file is intentionally explicit about authorization boundaries.

create extension if not exists pgcrypto;

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

-- Authorization helpers run as the function owner so RLS policies can safely
-- inspect membership without recursively invoking course_members policies.

create or replace function public.is_course_member(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.course_members cm
    where cm.course_id = target_course
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.course_role_for(target_course uuid)
returns public.course_role
language sql
stable
security definer
set search_path = public
as $$
  select cm.role
  from public.course_members cm
  where cm.course_id = target_course
    and cm.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_course_staff(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.course_role_for(target_course) in ('ta', 'instructor'), false);
$$;

create or replace function public.is_course_instructor(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.course_role_for(target_course) = 'instructor', false);
$$;

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

-- Profiles
create policy profiles_read_self_or_course_peers
on public.profiles for select
using (
  id = auth.uid()
  or exists (
    select 1
    from public.course_members mine
    join public.course_members theirs on theirs.course_id = mine.course_id
    where mine.user_id = auth.uid()
      and theirs.user_id = profiles.id
  )
);

create policy profiles_update_self
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- Courses
create policy courses_read_members
on public.courses for select
using (public.is_course_member(id));

create policy courses_update_instructors
on public.courses for update
using (public.is_course_instructor(id))
with check (public.is_course_instructor(id));

-- Memberships
create policy memberships_read_self_or_staff
on public.course_members for select
using (user_id = auth.uid() or public.is_course_staff(course_id));

create policy memberships_manage_instructors
on public.course_members for all
using (public.is_course_instructor(course_id))
with check (public.is_course_instructor(course_id));

-- Modules
create policy modules_read_members
on public.modules for select
using (public.is_course_member(course_id));

create policy modules_manage_staff
on public.modules for all
using (public.is_course_staff(course_id))
with check (public.is_course_staff(course_id));

-- Materials
create policy materials_read_members
on public.materials for select
using (
  public.is_course_staff(course_id)
  or (
    public.is_course_member(course_id)
    and published
    and (release_at is null or release_at <= now())
  )
);

create policy materials_manage_staff
on public.materials for all
using (public.is_course_staff(course_id))
with check (public.is_course_staff(course_id));

-- Assignments
create policy assignments_read_members
on public.assignments for select
using (
  public.is_course_staff(course_id)
  or (
    public.is_course_member(course_id)
    and published
    and (release_at is null or release_at <= now())
  )
);

create policy assignments_manage_staff
on public.assignments for all
using (public.is_course_staff(course_id))
with check (public.is_course_staff(course_id));

-- Submissions
create policy submissions_read_owner_or_staff
on public.submissions for select
using (
  student_id = auth.uid()
  or public.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id))
);

create policy submissions_insert_owner
on public.submissions for insert
with check (
  student_id = auth.uid()
  and public.course_role_for((select a.course_id from public.assignments a where a.id = assignment_id)) = 'student'
  and exists (
    select 1 from public.assignments a
    where a.id = assignment_id
      and a.published
      and (a.release_at is null or a.release_at <= now())
  )
);

create policy submissions_update_owner_or_staff
on public.submissions for update
using (
  student_id = auth.uid()
  or public.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id))
)
with check (
  student_id = auth.uid()
  or public.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id))
);

-- Grades
create policy grades_read_published_owner_or_staff
on public.grades for select
using (
  public.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id))
  or (student_id = auth.uid() and status = 'published')
);

create policy grades_manage_staff
on public.grades for all
using (public.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id)))
with check (public.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id)));

-- Announcements
create policy announcements_read_members
on public.announcements for select
using (
  public.is_course_staff(course_id)
  or (
    public.is_course_member(course_id)
    and published
    and (publish_at is null or publish_at <= now())
  )
);

create policy announcements_manage_staff
on public.announcements for all
using (public.is_course_staff(course_id))
with check (public.is_course_staff(course_id));

-- Calendar
create policy calendar_read_members
on public.calendar_events for select
using (course_id is null or public.is_course_member(course_id));

create policy calendar_manage_staff
on public.calendar_events for all
using (course_id is not null and public.is_course_staff(course_id))
with check (course_id is not null and public.is_course_staff(course_id));

-- Important production follow-ups:
-- 1. Add immutable audit/version tables for submissions and grade publication.
-- 2. Add server-side deadline enforcement for submission updates.
-- 3. Add configurable TA capabilities rather than treating all staff equally.
-- 4. Add storage bucket policies matching the database permissions above.
-- 5. Add an institutional admin role outside the per-course role enum.
