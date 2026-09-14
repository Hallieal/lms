import { getViewerContext } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export type CalendarItem = {
  id: string;
  day: number;
  title: string;
  kind: 'event' | 'deadline';
};

const demoItems: CalendarItem[] = [
  { id: 'demo-18', day: 18, title: 'Econometrics PS 3', kind: 'deadline' },
  { id: 'demo-20', day: 20, title: 'Microeconomics PS 2', kind: 'deadline' },
  { id: 'demo-22', day: 22, title: 'Algorithms assignment', kind: 'deadline' },
  { id: 'demo-27', day: 27, title: 'Trade replication', kind: 'deadline' },
];

export async function getCalendarData(year = 2026, month = 9): Promise<CalendarItem[]> {
  if (!isSupabaseConfigured()) return demoItems;

  const viewer = await getViewerContext();
  if (!viewer.userId || !viewer.courses.length) return [];

  const supabase = await createClient();
  const courseIds = viewer.courses.map((course) => course.id);
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const end = new Date(Date.UTC(year, month, 1)).toISOString();

  const [{ data: events }, { data: assignments }] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('id, title, starts_at')
      .in('course_id', courseIds)
      .gte('starts_at', start)
      .lt('starts_at', end)
      .order('starts_at'),
    supabase
      .from('assignments')
      .select('id, title, due_at')
      .in('course_id', courseIds)
      .not('due_at', 'is', null)
      .gte('due_at', start)
      .lt('due_at', end)
      .order('due_at'),
  ]);

  const eventItems: CalendarItem[] = ((events ?? []) as Array<{ id: string; title: string; starts_at: string }>).map((row) => ({
    id: `event-${row.id}`,
    day: new Date(row.starts_at).getDate(),
    title: row.title,
    kind: 'event',
  }));
  const deadlineItems: CalendarItem[] = ((assignments ?? []) as Array<{ id: string; title: string; due_at: string }>).map((row) => ({
    id: `deadline-${row.id}`,
    day: new Date(row.due_at).getDate(),
    title: row.title,
    kind: 'deadline',
  }));

  return [...eventItems, ...deadlineItems].sort((a, b) => a.day - b.day || a.title.localeCompare(b.title));
}
