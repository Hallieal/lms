import { CalendarView } from '@/components/calendar-view';
import { getCalendarData } from '@/lib/calendar-data';

export default async function CalendarPage() {
  const items = await getCalendarData();
  return <CalendarView items={items} />;
}
