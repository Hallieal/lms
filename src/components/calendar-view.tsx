'use client';

import { PageHeader } from '@/components/ui';
import { useRole } from '@/components/role-context';
import type { CalendarItem } from '@/lib/calendar-data';

export function CalendarView({ items }: { items: CalendarItem[] }) {
  const { isStaff } = useRole();
  const days = Array.from({ length: 35 }, (_, index) => index - 1);
  const byDay = new Map<number, CalendarItem[]>();

  for (const item of items) {
    byDay.set(item.day, [...(byDay.get(item.day) ?? []), item]);
  }

  return (
    <>
      <PageHeader
        eyebrow="September 2026"
        title="Calendar"
        subtitle={isStaff ? 'Teaching sessions, office hours and assessment deadlines.' : 'Lectures, seminars and deadlines in one view.'}
        action={<button className="button-secondary">Today</button>}
      />
      <div className="calendar-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div className="calendar-head" key={day}>{day}</div>)}
        {days.map((day, index) => (
          <div className="calendar-day" key={`${day}-${index}`}>
            <div className="calendar-date">{day > 0 && day <= 30 ? day : ''}</div>
            {(byDay.get(day) ?? []).map((item) => (
              <div className={`calendar-event calendar-${item.kind}`} key={item.id}>{item.title}</div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
