'use client';

import { assignments } from '@/lib/mock-data';
import { AssignmentRow, PageHeader } from '@/components/ui';
import { useRole } from '@/components/role-context';

export default function AssignmentsPage() {
  const { isStaff } = useRole();
  return (
    <>
      <PageHeader eyebrow="Coursework" title="Assignments" subtitle={isStaff ? 'Review submission activity and grading progress across your courses.' : 'Track everything due across your current courses.'} action={isStaff ? <button className="button">Create assignment</button> : undefined} />
      <section className="section-card"><div className="assignment-list">{assignments.map((assignment) => <AssignmentRow key={assignment.id} assignment={assignment} staff={isStaff} />)}</div></section>
    </>
  );
}
