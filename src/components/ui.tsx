import Link from 'next/link';
import type { Assignment, Course } from '@/lib/types';

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>{action}</div>;
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`} className="course-card">
      <span className="course-accent" style={{ background: course.color }} />
      <span className="course-code">{course.code}</span>
      <h3>{course.title}</h3>
      <p>{course.professor}</p>
      <div className="progress-meta"><span>Course progress</span><span>{course.progress}%</span></div>
      <div className="progress-track"><span style={{ width: `${course.progress}%`, background: course.color }} /></div>
    </Link>
  );
}

export function AssignmentRow({ assignment, staff = false }: { assignment: Assignment; staff?: boolean }) {
  const status = staff ? `${assignment.submitted}/${assignment.total} submitted` : assignment.status;
  return (
    <Link href={`/assignments/${assignment.id}`} className="assignment-row">
      <div className="assignment-date"><strong>{assignment.due.slice(4, 6).trim()}</strong><span>SEP</span></div>
      <div><strong>{assignment.title}</strong><small>{assignment.course} · {assignment.points} pts · Due {assignment.due}</small></div>
      <span className={`status status-${assignment.status}`}>{status}</span>
    </Link>
  );
}

export function Metric({ value, label, detail }: { value: string; label: string; detail: string }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>;
}
