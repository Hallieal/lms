-- Keep RLS execution efficient and add indexes for foreign-key lookups.

create index announcements_created_by_idx on public.announcements(created_by);
create index assignments_created_by_idx on public.assignments(created_by);
create index assignments_module_idx on public.assignments(module_id);
create index calendar_events_created_by_idx on public.calendar_events(created_by);
create index courses_created_by_idx on public.courses(created_by);
create index grades_graded_by_idx on public.grades(graded_by);
create index grades_student_idx on public.grades(student_id);
create index materials_created_by_idx on public.materials(created_by);
create index materials_module_idx on public.materials(module_id);

drop policy if exists memberships_manage_instructors on public.course_members;
create policy memberships_insert_instructors on public.course_members for insert to authenticated
with check (app_private.is_course_instructor(course_id));
create policy memberships_update_instructors on public.course_members for update to authenticated
using (app_private.is_course_instructor(course_id))
with check (app_private.is_course_instructor(course_id));
create policy memberships_delete_instructors on public.course_members for delete to authenticated
using (app_private.is_course_instructor(course_id));

drop policy if exists modules_manage_staff on public.modules;
create policy modules_insert_staff on public.modules for insert to authenticated
with check (app_private.is_course_staff(course_id));
create policy modules_update_staff on public.modules for update to authenticated
using (app_private.is_course_staff(course_id))
with check (app_private.is_course_staff(course_id));
create policy modules_delete_staff on public.modules for delete to authenticated
using (app_private.is_course_staff(course_id));

drop policy if exists materials_manage_staff on public.materials;
create policy materials_insert_staff on public.materials for insert to authenticated
with check (app_private.is_course_staff(course_id));
create policy materials_update_staff on public.materials for update to authenticated
using (app_private.is_course_staff(course_id))
with check (app_private.is_course_staff(course_id));
create policy materials_delete_staff on public.materials for delete to authenticated
using (app_private.is_course_staff(course_id));

drop policy if exists assignments_manage_staff on public.assignments;
create policy assignments_insert_staff on public.assignments for insert to authenticated
with check (app_private.is_course_staff(course_id));
create policy assignments_update_staff on public.assignments for update to authenticated
using (app_private.is_course_staff(course_id))
with check (app_private.is_course_staff(course_id));
create policy assignments_delete_staff on public.assignments for delete to authenticated
using (app_private.is_course_staff(course_id));

drop policy if exists grades_manage_staff on public.grades;
create policy grades_insert_staff on public.grades for insert to authenticated
with check (app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id)));
create policy grades_update_staff on public.grades for update to authenticated
using (app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id)))
with check (app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id)));
create policy grades_delete_staff on public.grades for delete to authenticated
using (app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id)));

drop policy if exists announcements_manage_staff on public.announcements;
create policy announcements_insert_staff on public.announcements for insert to authenticated
with check (app_private.is_course_staff(course_id));
create policy announcements_update_staff on public.announcements for update to authenticated
using (app_private.is_course_staff(course_id))
with check (app_private.is_course_staff(course_id));
create policy announcements_delete_staff on public.announcements for delete to authenticated
using (app_private.is_course_staff(course_id));

drop policy if exists calendar_manage_staff on public.calendar_events;
create policy calendar_insert_staff on public.calendar_events for insert to authenticated
with check (course_id is not null and app_private.is_course_staff(course_id));
create policy calendar_update_staff on public.calendar_events for update to authenticated
using (course_id is not null and app_private.is_course_staff(course_id))
with check (course_id is not null and app_private.is_course_staff(course_id));
create policy calendar_delete_staff on public.calendar_events for delete to authenticated
using (course_id is not null and app_private.is_course_staff(course_id));

drop policy if exists submissions_update_owner on public.submissions;
drop policy if exists submissions_update_staff on public.submissions;
create policy submissions_update_owner_or_staff on public.submissions for update to authenticated
using (
  app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id))
  or (
    student_id = (select auth.uid())
    and exists (
      select 1 from public.assignments a
      where a.id = assignment_id
        and (a.due_at is null or a.due_at >= now() or a.allow_late)
        and (submissions.status = 'draft' or a.allow_resubmission)
    )
  )
)
with check (
  app_private.is_course_staff((select a.course_id from public.assignments a where a.id = assignment_id))
  or (
    student_id = (select auth.uid())
    and exists (
      select 1 from public.assignments a
      where a.id = assignment_id
        and a.published
        and (a.release_at is null or a.release_at <= now())
        and (a.due_at is null or a.due_at >= now() or a.allow_late)
    )
  )
);
