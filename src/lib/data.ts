import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  announcements as demoAnnouncements,
  assignments as demoAssignments,
  courses as demoCourses,
  modules as demoModules,
} from '@/lib/mock-data';
import type {
  Announcement,
  Assignment,
  AssignmentStatus,
  Course,
  CourseModule,
  Role,
} from '@/lib/types';

const palette = ['#2f6f9f', '#9a5c44', '#467b63', '#745d9d', '#9a7a36', '#526c80'];

function strongestRole(roles: Role[]): Role {
  if (roles.includes('instructor')) return 'instructor';
  if (roles.includes('ta')) return 'ta';
  return 'student';
}

function formatDue(value: string | null) {
  if (!value) return 'No deadline';
  const date = new Date(value);
  const month = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'America/Toronto' }).format(date);
  const day = new Intl.DateTimeFormat('en', { day: '2-digit', timeZone: 'America/Toronto' }).format(date);
  const time = new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Toronto',
  }).format(date);
  return `${month} ${day} · ${time}`;
}

function relativeTime(value: string | null) {
  if (!value) return 'Recently';
  const timestamp = new Date(value).getTime();
  const diffHours = Math.max(0, Math.round((Date.now() - timestamp) / 3_600_000));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export type ViewerContext = {
  userId: string | null;
  role: Role;
  courses: Course[];
};

export async function getViewerContext(): Promise<ViewerContext> {
  if (!isSupabaseConfigured()) {
    return { userId: null, role: 'student', courses: demoCourses };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === 'string' ? claimsData.claims.sub : null;
  if (!userId) return { userId: null, role: 'student', courses: [] };

  const { data: memberships, error: membershipError } = await supabase
    .from('course_members')
    .select('course_id, role')
    .eq('user_id', userId);

  if (membershipError || !memberships?.length) {
    return { userId, role: 'student', courses: [] };
  }

  const typedMemberships = memberships as Array<{ course_id: string; role: Role }>;
  const courseIds = typedMemberships.map((item) => item.course_id);
  const role = strongestRole(typedMemberships.map((item) => item.role));

  const [{ data: courseRows }, { data: studentRows }] = await Promise.all([
    supabase.from('courses').select('id, code, title').in('id', courseIds).order('code'),
    role === 'student'
      ? Promise.resolve({ data: [] as Array<{ course_id: string }> })
      : supabase.from('course_members').select('course_id').in('course_id', courseIds).eq('role', 'student'),
  ]);

  const counts = new Map<string, number>();
  for (const row of (studentRows ?? []) as Array<{ course_id: string }>) {
    counts.set(row.course_id, (counts.get(row.course_id) ?? 0) + 1);
  }

  const courses: Course[] = ((courseRows ?? []) as Array<{ id: string; code: string; title: string }>).map((row, index) => ({
    id: row.id,
    code: row.code,
    title: row.title,
    professor: 'Course staff',
    color: palette[index % palette.length],
    progress: 0,
    students: counts.get(row.id) ?? 0,
  }));

  return { userId, role, courses };
}

export async function getDashboardData() {
  if (!isSupabaseConfigured()) {
    return {
      viewer: { userId: null, role: 'student' as Role, courses: demoCourses },
      courses: demoCourses,
      assignments: demoAssignments,
      announcements: demoAnnouncements,
    };
  }

  const viewer = await getViewerContext();
  if (!viewer.userId || !viewer.courses.length) {
    return { viewer, courses: viewer.courses, assignments: [] as Assignment[], announcements: [] as Announcement[] };
  }

  const supabase = await createClient();
  const courseIds = viewer.courses.map((course) => course.id);
  const courseById = new Map(viewer.courses.map((course) => [course.id, course]));

  const { data: assignmentRows } = await supabase
    .from('assignments')
    .select('id, course_id, title, max_points, due_at')
    .in('course_id', courseIds)
    .order('due_at', { ascending: true, nullsFirst: false });

  const rawAssignments = (assignmentRows ?? []) as Array<{
    id: string;
    course_id: string;
    title: string;
    max_points: number | string;
    due_at: string | null;
  }>;
  const assignmentIds = rawAssignments.map((item) => item.id);

  const [submissionResult, gradeResult, announcementResult] = await Promise.all([
    assignmentIds.length
      ? supabase.from('submissions').select('assignment_id, student_id, status').in('assignment_id', assignmentIds)
      : Promise.resolve({ data: [] }),
    assignmentIds.length
      ? supabase.from('grades').select('assignment_id, student_id, status').in('assignment_id', assignmentIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from('announcements')
      .select('course_id, title, body, publish_at, created_at')
      .in('course_id', courseIds)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const submissions = (submissionResult.data ?? []) as Array<{
    assignment_id: string;
    student_id: string;
    status: 'draft' | 'submitted' | 'late';
  }>;
  const grades = (gradeResult.data ?? []) as Array<{
    assignment_id: string;
    student_id: string;
    status: 'draft' | 'ready' | 'published';
  }>;

  const assignments: Assignment[] = rawAssignments.map((row) => {
    const course = courseById.get(row.course_id);
    const assignmentSubmissions = submissions.filter((item) => item.assignment_id === row.id);
    const assignmentGrades = grades.filter((item) => item.assignment_id === row.id);
    const ownSubmission = assignmentSubmissions.find((item) => item.student_id === viewer.userId);
    const ownGrade = assignmentGrades.find((item) => item.student_id === viewer.userId && item.status === 'published');
    let status: AssignmentStatus = 'open';

    if (viewer.role === 'student') {
      if (ownGrade) status = 'graded';
      else if (ownSubmission?.status === 'late') status = 'late';
      else if (ownSubmission?.status === 'submitted') status = 'submitted';
    } else if (course?.students && assignmentGrades.length >= course.students) {
      status = 'graded';
    }

    return {
      id: row.id,
      title: row.title,
      course: course?.title ?? 'Course',
      courseId: row.course_id,
      due: formatDue(row.due_at),
      points: Number(row.max_points),
      status,
      submitted: assignmentSubmissions.filter((item) => item.status !== 'draft').length,
      graded: assignmentGrades.length,
      total: course?.students ?? (viewer.role === 'student' ? 1 : 0),
    };
  });

  const announcements: Announcement[] = ((announcementResult.data ?? []) as Array<{
    course_id: string;
    title: string;
    body: string;
    publish_at: string | null;
    created_at: string;
  }>).map((row) => ({
    course: courseById.get(row.course_id)?.title ?? 'Course',
    title: row.title,
    text: row.body,
    time: relativeTime(row.publish_at ?? row.created_at),
  }));

  return { viewer, courses: viewer.courses, assignments, announcements };
}

export async function getCourseData(courseId: string) {
  const dashboard = await getDashboardData();
  const course = dashboard.courses.find((item) => item.id === courseId) ?? null;
  const assignments = dashboard.assignments.filter((item) => item.courseId === courseId);

  if (!course) return { course: null, assignments, modules: [] as CourseModule[] };
  if (!isSupabaseConfigured()) {
    return { course, assignments, modules: demoModules[courseId] ?? [] };
  }

  const supabase = await createClient();
  const [{ data: moduleRows }, { data: materialRows }] = await Promise.all([
    supabase.from('modules').select('id, title, description, position').eq('course_id', courseId).order('position'),
    supabase.from('materials').select('id, module_id, title, kind, position').eq('course_id', courseId).order('position'),
  ]);

  const rawMaterials = (materialRows ?? []) as Array<{
    id: string;
    module_id: string | null;
    title: string;
    kind: 'file' | 'link' | 'text' | 'code' | 'data';
    position: number;
  }>;
  const kindMap: Record<string, CourseModule['resources'][number]['kind']> = {
    file: 'PDF',
    link: 'WEB',
    text: 'PDF',
    code: 'CODE',
    data: 'DATA',
  };

  const modules: CourseModule[] = ((moduleRows ?? []) as Array<{
    id: string;
    title: string;
    description: string | null;
    position: number;
  }>).map((row, index) => ({
    id: String(index + 1).padStart(2, '0'),
    title: row.title,
    subtitle: row.description ?? `Module ${index + 1}`,
    resources: rawMaterials
      .filter((item) => item.module_id === row.id)
      .map((item) => ({ title: item.title, kind: kindMap[item.kind] ?? 'PDF' })),
  }));

  return { course, assignments, modules };
}

export async function getAssignmentData(assignmentId: string) {
  const dashboard = await getDashboardData();
  return dashboard.assignments.find((item) => item.id === assignmentId) ?? null;
}
