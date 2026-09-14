'use client';

import { PageHeader } from '@/components/ui';
import { useRole } from '@/components/role-context';

const events: Record<number, string> = {
  18: 'Econometrics PS 3',
  20: 'Microeconomics PS 2',
  22: 'Algorithms assignment',
  27: 'Trade replication',
};

export default function CalendarPage() {
  const { isStaff } = useRole();
  const days = Array.from({ length: 35 }, (_, index) => index - 1);
  return (
    <>
      <PageHeader eyebrow="September 2026" title="Calendar" subtitle={isStaff ? 'Teaching sessions, office hours and assessment deadlines.' : 'Lectures, seminars and deadlines in one view.'} action={<button className="button-secondary">Today</button>} />
      <div className="calendar-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div className="calendar-head" key={day}>{day}</div>)}
        {days.map((day, index) => <div className="calendar-day" key={`${day}-${index}`}><div className="calendar-date">{day > 0 && day <= 30 ? day : ''}</div>{events[day] && <div className="calendar-event">{events[day]}</div>}</div>)}
      </div>
    </>
  );
}
