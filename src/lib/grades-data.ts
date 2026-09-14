import { getDashboardData, getViewerContext } from '@/lib/data';
import { gradeRows } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export type StudentGradeRow = {
  course: string;
  assessment: string;
  score: string;
  result: string;
};

export type GradebookRow = {
  studentId: string;
  name: string;
  score: string;
  submitted: string;
  status: 'graded' | 'missing';
};

export type GradesData = {
  studentRows: StudentGradeRow[];
  gradebook: {
    title: string;
    course: string;
    maxPoints: number;
    rows: GradebookRow[];
    submitted: number;
    graded: number;
    mean: number | null;
    median: number | null;
  } | null;
};

const demoGradebook: NonNullable<GradesData['gradebook']> = {
  title: 'Problem Set 2: Panel Data',
  course: 'Econometrics II',
  maxPoints: 20,
  submitted: 5,
  graded: 5,
  mean: 18.6,
  median: 18.5,
  rows: [
    { studentId: 'demo-1', name: 'Anna Petrova', score: '19.0', submitted: 'Sep 11 · 19:42', status: 'graded' },
    { studentId: 'demo-2', name: 'Mikhail Sokolov', score: '18.5', submitted: 'Sep 11 · 21:04', status: 'graded' },
    { studentId: 'demo-3', name: 'Daria Volkova', score: '20.0', submitted: 'Sep 10 · 23:18', status: 'graded' },
    { studentId: 'demo-4', name: 'Ivan Morozov', score: '17.5', submitted: 'Sep 11 · 22:51', status: 'graded' },
    { studentId: 'demo-5', name: 'Sofia Lebedeva', score: '18.0', submitted: 'Sep 11 · 20:16', status: 'graded' },
    { studentId: 'demo-6', name: 'Nikita Orlov', score: '', submitted: 'Missing', status: 'missing' },
  ],
};

function formatTimestamp(value: string | null) {
  if (!value) return 'Missing';
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

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export async function getGradesData(): Promise<GradesData> {
  if (!isSupabaseConfigured()) {
    return {
      studentRows: gradeRows.map((row) => ({ course: row[0], assessment: row[1], score: row[2], result: row[3] })),
      gradebook: demoGradebook,
    };
  }

  const viewer = await getViewerContext();
  const dashboard = await getDashboardData();
  if (!viewer.userId) return { studentRows: [], gradebook: null };

  const supabase = await createClient();
  const assignmentById = new Map(dashboard.assignments.map((item) => [item.id, item]));

  const { data: ownGrades } = await supabase
    .from('grades')
    .select('assignment_id, score, status')
    .eq('student_id', viewer.userId)
    .eq('status', 'published');

  const studentRows: StudentGradeRow[] = ((ownGrades ?? []) as Array<{
    assignment_id: string;
    score: number | string | null;
    status: string;
  }>).flatMap((row) => {
    const assignment = assignmentById.get(row.assignment_id);
    if (!assignment || row.score === null) return [];
    const score = Number(row.score);
    const pct = assignment.points ? Math.round((score / assignment.points) * 1000) / 10 : 0;
    return [{
      course: assignment.course,
      assessment: assignment.title,
      score: `${score}/${assignment.points}`,
      result: `${pct}%`,
    }];
  });

  if (viewer.role === 'student') return { studentRows, gradebook: null };

  const target = dashboard.assignments.find((item) => item.submitted > 0) ?? dashboard.assignments[0];
  if (!target) return { studentRows, gradebook: null };

  const [{ data: submissions }, { data: grades }] = await Promise.all([
    supabase
      .from('submissions')
      .select('student_id, submitted_at, status')
      .eq('assignment_id', target.id),
    supabase
      .from('grades')
      .select('student_id, score, status')
      .eq('assignment_id', target.id),
  ]);

  const submissionRows = (submissions ?? []) as Array<{
    student_id: string;
    submitted_at: string | null;
    status: string;
  }>;
  const gradeRowsRaw = (grades ?? []) as Array<{
    student_id: string;
    score: number | string | null;
    status: string;
  }>;
  const studentIds = Array.from(new Set([...submissionRows.map((row) => row.student_id), ...gradeRowsRaw.map((row) => row.student_id)]));

  const { data: profiles } = studentIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', studentIds)
    : { data: [] };
  const names = new Map(((profiles ?? []) as Array<{ id: string; display_name: string }>).map((row) => [row.id, row.display_name]));
  const gradeByStudent = new Map(gradeRowsRaw.map((row) => [row.student_id, row]));
  const submissionByStudent = new Map(submissionRows.map((row) => [row.student_id, row]));

  const rows: GradebookRow[] = studentIds.map((studentId) => {
    const grade = gradeByStudent.get(studentId);
    const submission = submissionByStudent.get(studentId);
    return {
      studentId,
      name: names.get(studentId) ?? `Student ${studentId.slice(0, 8)}`,
      score: grade?.score === null || grade?.score === undefined ? '' : String(grade.score),
      submitted: formatTimestamp(submission?.submitted_at ?? null),
      status: grade?.score === null || grade?.score === undefined ? 'missing' : 'graded',
    };
  });

  const scores = gradeRowsRaw.flatMap((row) => row.score === null ? [] : [Number(row.score)]).filter(Number.isFinite);
  const mean = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null;

  return {
    studentRows,
    gradebook: {
      title: target.title,
      course: target.course,
      maxPoints: target.points,
      rows,
      submitted: submissionRows.filter((row) => row.status !== 'draft').length,
      graded: scores.length,
      mean,
      median: median(scores),
    },
  };
}
