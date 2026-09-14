insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('course-materials', 'course-materials', false, 52428800, array['application/pdf','text/plain','text/csv','application/zip','application/x-zip-compressed','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('submissions', 'submissions', false, 52428800, array['application/pdf','application/zip','application/x-zip-compressed','text/plain','text/csv'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy course_materials_read_members on storage.objects for select to authenticated
using (
  bucket_id = 'course-materials'
  and cardinality(storage.foldername(name)) >= 1
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and app_private.is_course_member(((storage.foldername(name))[1])::uuid)
);
create policy course_materials_insert_staff on storage.objects for insert to authenticated
with check (
  bucket_id = 'course-materials'
  and cardinality(storage.foldername(name)) >= 1
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and app_private.is_course_staff(((storage.foldername(name))[1])::uuid)
);
create policy course_materials_update_staff on storage.objects for update to authenticated
using (
  bucket_id = 'course-materials'
  and cardinality(storage.foldername(name)) >= 1
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and app_private.is_course_staff(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'course-materials'
  and cardinality(storage.foldername(name)) >= 1
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and app_private.is_course_staff(((storage.foldername(name))[1])::uuid)
);
create policy course_materials_delete_staff on storage.objects for delete to authenticated
using (
  bucket_id = 'course-materials'
  and cardinality(storage.foldername(name)) >= 1
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and app_private.is_course_staff(((storage.foldername(name))[1])::uuid)
);

create policy submissions_files_read_owner_or_staff on storage.objects for select to authenticated
using (
  bucket_id = 'submissions'
  and cardinality(storage.foldername(name)) >= 2
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (
    ((storage.foldername(name))[2])::uuid = (select auth.uid())
    or app_private.is_course_staff((select a.course_id from public.assignments a where a.id = ((storage.foldername(name))[1])::uuid))
  )
);
create policy submissions_files_insert_owner on storage.objects for insert to authenticated
with check (
  bucket_id = 'submissions'
  and cardinality(storage.foldername(name)) >= 2
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and ((storage.foldername(name))[2])::uuid = (select auth.uid())
  and exists (
    select 1 from public.assignments a
    where a.id = ((storage.foldername(name))[1])::uuid
      and a.published
      and (a.release_at is null or a.release_at <= now())
      and (a.due_at is null or a.due_at >= now() or a.allow_late)
      and app_private.course_role_for(a.course_id) = 'student'
  )
);
create policy submissions_files_update_owner on storage.objects for update to authenticated
using (
  bucket_id = 'submissions'
  and cardinality(storage.foldername(name)) >= 2
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and ((storage.foldername(name))[2])::uuid = (select auth.uid())
  and exists (
    select 1 from public.assignments a
    where a.id = ((storage.foldername(name))[1])::uuid
      and (a.due_at is null or a.due_at >= now() or a.allow_late)
      and a.allow_resubmission
  )
)
with check (
  bucket_id = 'submissions'
  and cardinality(storage.foldername(name)) >= 2
  and ((storage.foldername(name))[2])::uuid = (select auth.uid())
);
create policy submissions_files_delete_owner on storage.objects for delete to authenticated
using (
  bucket_id = 'submissions'
  and cardinality(storage.foldername(name)) >= 2
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and ((storage.foldername(name))[2])::uuid = (select auth.uid())
  and exists (
    select 1 from public.assignments a
    where a.id = ((storage.foldername(name))[1])::uuid
      and (a.due_at is null or a.due_at >= now() or a.allow_late)
      and a.allow_resubmission
  )
);
