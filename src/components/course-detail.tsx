'use client';

import Link from 'next/link';
import { assignments, modules } from '@/lib/mock-data';
import type { Course } from '@/lib/types';
import { AssignmentRow, Metric } from './ui';
import { useRole } from './role-context';

export function CourseDetail({ course }: { course: Course }) {
  const { isStaff, role } = useRole();
  const courseAssignments = assignments.filter((assignment) => assignment.courseId === course.id);
  const courseModules = modules[course.id] ?? [];

  return (
    <>
      <section className="course-hero" style={{ '--course-color': course.color } as React.CSSProperties}>
        <div className="course-hero-head">
          <div><p className="eyebrow">{course.code} · Fall 2026</p><h1>{course.title}</h1><p className="page-subtitle">{course.professor} · {course.students} students</p></div>
          {isStaff ? <button className="button">Manage course</button> : <button className="button-secondary">Course syllabus</button>}
        </div>
        <div className="course-tabs"><span className="active">Overview</span><span>Materials</span><span>Assignments</span><span>{isStaff ? 'Gradebook' : 'Grades'}</span><span>People</span></div>
      </section>
      <div style={{ height: 22 }} />
      {isStaff && <div className="metric-grid"><Metric value={String(course.students)} label="Students" detail="Enrolled" /><Metric value={String(courseAssignments.length)} label="Assignments" detail="Current term" /><Metric value="94%" label="Submission rate" detail="Across course" /><Metric value={role === 'instructor' ? 'Published' : 'Staff'} label="Course status" detail="Visible to students" /></div>}
      <div className="dashboard-grid">
        <section className="section-card">
          <div className="section-heading"><div><h2>Course materials</h2><p>Organized by teaching week</p></div>{isStaff && <button className="button-secondary">Add module</button>}</div>
          <div className="module-list">
            {courseModules.map((module) => <article className="module-card" key={module.id}><div className="module-head"><div className="module-number">{module.id}</div><div><h3>{module.title}</h3><p>{module.subtitle}</p></div></div>{module.resources.map((resource) => <div className="resource-row" key={`${module.id}-${resource.title}`}><span>{resource.title}</span><span className="resource-kind">{resource.kind}</span></div>)}</article>)}
          </div>
        </section>
        <aside className="stack">
          <section className="section-card"><div className="section-heading"><div><h2>{isStaff ? 'Course health' : 'Course progress'}</h2><p>{course.progress}% complete</p></div></div><div className="progress-track" style={{ height: 9 }}><span style={{ width: `${course.progress}%`, background: course.color }} /></div></section>
          <section className="section-card"><div className="section-heading"><div><h2>Assignments</h2><p>{isStaff ? 'Submission activity' : 'Work for this course'}</p></div><Link href="/assignments" className="button-secondary">View all</Link></div><div className="assignment-list">{courseAssignments.map((assignment) => <AssignmentRow key={assignment.id} assignment={assignment} staff={isStaff} />)}</div></section>
        </aside>
      </div>
    </>
  );
}
