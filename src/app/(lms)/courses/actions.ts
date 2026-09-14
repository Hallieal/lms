'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function fail(message: string): never {
  redirect(`/courses?error=${encodeURIComponent(message)}`);
}

export async function createCourse(formData: FormData) {
  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  const title = String(formData.get('title') ?? '').trim();
  const term = String(formData.get('term') ?? 'Fall').trim();
  const academicYear = Number(formData.get('academicYear') ?? new Date().getFullYear());
  const description = String(formData.get('description') ?? '').trim() || null;

  if (!code || !title) fail('Course code and title are required.');
  if (!Number.isInteger(academicYear) || academicYear < 2000 || academicYear > 2100) fail('Academic year is invalid.');

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === 'string' ? claimsData.claims.sub : null;
  if (!userId) redirect('/');

  const { data: adminRow } = await supabase
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!adminRow) fail('Platform administrator access is required.');

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      code,
      title,
      term,
      academic_year: academicYear,
      description,
      status: 'draft',
      created_by: userId,
    })
    .select('id')
    .single();

  if (courseError || !course) fail(courseError?.message ?? 'Could not create the course.');

  const { error: membershipError } = await supabase.from('course_members').insert({
    course_id: course.id,
    user_id: userId,
    role: 'instructor',
  });

  if (membershipError) {
    await supabase.from('courses').delete().eq('id', course.id);
    fail(membershipError.message);
  }

  revalidatePath('/courses');
  revalidatePath('/dashboard');
  redirect(`/courses/${course.id}`);
}
