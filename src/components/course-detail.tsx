'use client';

import Link from 'next/link';
import type { Assignment, Course, CourseModule } from '@/lib/types';
import { AssignmentRow, Metric } from './ui';
import { useRole } from './role-context';

export function CourseDetail({
  course,
  assignments,
  modules,
}: {
  course: Course;
  assignments: Assignment[];
  modules: CourseModule[];
}) {
  const { isStaff, role } = useRole();

  return (
    <>
      <section className="course-hero" style={{ '--course-color': course.color } as React.CSSProperties}>
        <div className="course-hero-head">
          <div><p className="eyebrow">{course.code} · Fall 2026</p><h1>{course.title}</h1><p className="page-subtitle">{course.professor}{course.students ? ` · ${course.students} students` : ''}</p></div>
          {isStaff ? <button className="button">Manage course</button> : <button className="button-secondary">Course syllabus</button>}
        </div>
        <div className="course-tabs"><span className="active">Overview</span><span>Materials</span><span>Assignments</span><span>{isStaff ? 'Gradebook' : 'Grades'}</span><span>People</span></div>
      </section>
      <div style={{ height: 22 }} />
      {isStaff && <div className="metric-grid"><Metric value={course.students ? String(course.students) : '—'} label="Students" detail="Enrolled" /><Metric value={String(assignments.length)} label="Assignments" detail="Current term" /><Metric value={assignments.length ? `${Math.round(assignments.reduce((sum, item) => sum + item.submitted, 0) / Math.max(assignments.reduce((sum, item) => sum + item.total, 0), 1) * 100)}%` : '—'} label="Submission rate" detail="Across course" /><Metric value={role === 'instructor' ? 'Published' : 'Staff'} label="Course status" detail="Visible to students" /></div>}
      <div className="dashboard-grid">
        <section className="section-card">
          <div className="section-heading"><div><h2>Course materials</h2><p>Organized by teaching week</p></div>{isStaff && <button className="button-secondary">Add module</button>}</div>
          <div className="module-list">
            {modules.length ? modules.map((module) => <article className="module-card" key={module.id}><div className="module-head"><div className="module-number">{module.id}</div><div><h3>{module.title}</h3><p>{module.subtitle}</p></div></div>{module.resources.map((resource) => <div className="resource-row" key={`${module.id}-${resource.title}`}><span>{resource.title}</span><span className="resource-kind">{resource.kind}</span></div>)}</article>) : <p className="empty-state">No course materials have been published yet.</p>}
          </div>
        </section>
        <aside className="stack">
          <section className="section-card"><div className="section-heading"><div><h2>{isStaff ? 'Course health' : 'Course progress'}</h2><p>{course.progress ? `${course.progress}% complete` : 'Progress tracking will appear here'}</p></div></div><div className="progress-track" style={{ height: 9 }}><span style={{ width: `${course.progress}%`, background: course.color }} /></div></section>
          <section className="section-card"><div className="section-heading"><div><h2>Assignments</h2><p>{isStaff ? 'Submission activity' : 'Work for this course'}</p></div><Link href="/assignments" className="button-secondary">View all</Link></div><div className="assignment-list">{assignments.length ? assignments.map((assignment) => <AssignmentRow key={assignment.id} assignment={assignment} staff={isStaff} />) : <p className="empty-state">No assignments available.</p>}</div></section>
        </aside>
      </div>
    </>
  );
}
