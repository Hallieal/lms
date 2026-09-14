'use client';

import { AssignmentRow, CourseCard, Metric, PageHeader } from '@/components/ui';
import { useRole } from '@/components/role-context';
import type { Announcement, Assignment, Course } from '@/lib/types';

export function DashboardView({
  courses,
  assignments,
  announcements,
}: {
  courses: Course[];
  assignments: Assignment[];
  announcements: Announcement[];
}) {
  const { isStaff, role } = useRole();
  const open = assignments.filter((assignment) => assignment.status === 'open' || assignment.status === 'submitted' || assignment.status === 'late');
  const next = open[0];

  if (isStaff) {
    const submitted = assignments.reduce((sum, item) => sum + item.submitted, 0);
    const graded = assignments.reduce((sum, item) => sum + item.graded, 0);
    const awaiting = Math.max(0, submitted - graded);

    return (
      <>
        <PageHeader eyebrow="Teaching workspace" title={role === 'instructor' ? 'Instructor dashboard' : 'TA dashboard'} subtitle="Review course activity, submissions and grading progress." />
        <div className="metric-grid">
          <Metric value={String(courses.length)} label="Active courses" detail="Current term" />
          <Metric value={String(submitted)} label="Submissions" detail="Across visible work" />
          <Metric value={String(awaiting)} label="Awaiting grading" detail="Needs attention" />
          <Metric value={assignments.length ? `${Math.round((graded / Math.max(submitted, 1)) * 100)}%` : '—'} label="Grading progress" detail="Submitted work" />
        </div>
        <div className="dashboard-grid">
          <section className="section-card">
            <div className="section-heading"><div><h2>Grading queue</h2><p>Assignments with work waiting for review</p></div></div>
            <div className="assignment-list">{open.length ? open.map((assignment) => <AssignmentRow key={assignment.id} assignment={assignment} staff />) : <p className="empty-state">Nothing is waiting for review.</p>}</div>
          </section>
          <aside className="stack">
            <section className="section-card"><div className="section-heading"><div><h2>Your courses</h2><p>Teaching this term</p></div></div><div className="course-grid" style={{ gridTemplateColumns: '1fr' }}>{courses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} />)}</div></section>
            <section className="section-card"><div className="section-heading"><div><h2>Recent activity</h2><p>Course updates</p></div></div>{announcements.map((item) => <article className="announcement" key={`${item.course}-${item.title}`}><h3>{item.title}</h3><p>{item.text}</p><small>{item.course} · {item.time}</small></article>)}</section>
          </aside>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Fall 2026" title="Good morning." subtitle="Here is what is happening across your courses." />
      <div className="dashboard-grid">
        <div className="stack">
          {next ? <section className="hero-card"><small>Next deadline</small><h2>{next.title}</h2><div className="hero-meta"><span>{next.course}</span><span>Due {next.due}</span><span>{next.points} points</span></div></section> : <section className="hero-card"><small>Coursework</small><h2>You are all caught up.</h2><div className="hero-meta"><span>No open assignments</span></div></section>}
          <section className="section-card"><div className="section-heading"><div><h2>Upcoming assignments</h2><p>Your next deadlines across all courses</p></div></div><div className="assignment-list">{open.length ? open.map((assignment) => <AssignmentRow key={assignment.id} assignment={assignment} />) : <p className="empty-state">No upcoming deadlines.</p>}</div></section>
          <section className="section-card"><div className="section-heading"><div><h2>Your courses</h2><p>{courses.length} active {courses.length === 1 ? 'course' : 'courses'} this term</p></div></div><div className="course-grid">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div></section>
        </div>
        <aside className="stack">
          <section className="section-card"><div className="section-heading"><div><h2>This term</h2><p>At a glance</p></div></div><div className="metric-grid" style={{ gridTemplateColumns: '1fr' }}><Metric value={String(courses.length)} label="Courses" detail="Active" /><Metric value={String(open.length)} label="Open tasks" detail="Due soon" /><Metric value={String(assignments.filter((item) => item.status === 'submitted' || item.status === 'graded').length)} label="Submitted" detail="Assignments" /></div></section>
          <section className="section-card"><div className="section-heading"><div><h2>Announcements</h2><p>Latest course updates</p></div></div>{announcements.length ? announcements.map((item) => <article className="announcement" key={`${item.course}-${item.title}`}><h3>{item.title}</h3><p>{item.text}</p><small>{item.course} · {item.time}</small></article>) : <p className="empty-state">No announcements yet.</p>}</section>
        </aside>
      </div>
    </>
  );
}
