import { createClient } from '@/lib/supabase/server';
import type { Course } from '@/lib/types';

const palette = ['#2f6f9f', '#9a5c44', '#467b63', '#745d9d', '#9a7a36', '#526c80'];

export async function getPlatformAdminContext(): Promise<{
  userId: string | null;
  isAdmin: boolean;
  courses: Course[];
}> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === 'string' ? claimsData.claims.sub : null;
  if (!userId) return { userId: null, isAdmin: false, courses: [] };

  const { data: adminRow } = await supabase
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!adminRow) return { userId, isAdmin: false, courses: [] };

  const [{ data: courseRows }, { data: studentRows }] = await Promise.all([
    supabase.from('courses').select('id, code, title').order('code'),
    supabase.from('course_members').select('course_id').eq('role', 'student'),
  ]);

  const counts = new Map<string, number>();
  for (const row of studentRows ?? []) {
    counts.set(row.course_id, (counts.get(row.course_id) ?? 0) + 1);
  }

  const courses: Course[] = (courseRows ?? []).map((row, index) => ({
    id: row.id,
    code: row.code,
    title: row.title,
    professor: 'Course staff',
    color: palette[index % palette.length],
    progress: 0,
    students: counts.get(row.id) ?? 0,
  }));

  return { userId, isAdmin: true, courses };
}
