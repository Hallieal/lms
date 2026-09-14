'use client';

import { announcements, assignments, courses } from '@/lib/mock-data';
import { AssignmentRow, CourseCard, Metric, PageHeader } from '@/components/ui';
import { useRole } from '@/components/role-context';

export default function DashboardPage() {
  const { isStaff, role } = useRole();
  const open = assignments.filter((assignment) => assignment.status === 'open' || assignment.status === 'submitted');

  if (isStaff) {
    return (
      <>
        <PageHeader eyebrow="Teaching workspace" title={role === 'instructor' ? 'Instructor dashboard' : 'TA dashboard'} subtitle="Review course activity, submissions and grading progress." />
        <div className="metric-grid">
          <Metric value="4" label="Active courses" detail="Fall 2026" />
          <Metric value="168" label="Submissions" detail="Across open work" />
          <Metric value="52" label="Awaiting grading" detail="Needs attention" />
          <Metric value="96%" label="On-time rate" detail="Current term" />
        </div>
        <div className="dashboard-grid">
          <section className="section-card">
            <div className="section-heading"><div><h2>Grading queue</h2><p>Assignments with work waiting for review</p></div></div>
            <div className="assignment-list">{open.map((assignment) => <AssignmentRow key={assignment.id} assignment={assignment} staff />)}</div>
          </section>
          <aside className="stack">
            <section className="section-card"><div className="section-heading"><div><h2>Your courses</h2><p>Teaching this term</p></div></div><div className="course-grid" style={{ gridTemplateColumns: '1fr' }}>{courses.slice(0, 2).map((course) => <CourseCard key={course.id} course={course} />)}</div></section>
            <section className="section-card"><div className="section-heading"><div><h2>Recent activity</h2><p>Course updates</p></div></div>{announcements.map((item) => <article className="announcement" key={item.title}><h3>{item.title}</h3><p>{item.text}</p><small>{item.course} · {item.time}</small></article>)}</section>
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
          <section className="hero-card"><small>Next deadline</small><h2>Problem Set 3: Instrumental Variables</h2><div className="hero-meta"><span>Econometrics II</span><span>Due Sep 18 · 23:59</span><span>20 points</span></div></section>
          <section className="section-card"><div className="section-heading"><div><h2>Upcoming assignments</h2><p>Your next deadlines across all courses</p></div></div><div className="assignment-list">{open.map((assignment) => <AssignmentRow key={assignment.id} assignment={assignment} />)}</div></section>
          <section className="section-card"><div className="section-heading"><div><h2>Your courses</h2><p>Four active courses this term</p></div></div><div className="course-grid">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div></section>
        </div>
        <aside className="stack">
          <section className="section-card"><div className="section-heading"><div><h2>This term</h2><p>At a glance</p></div></div><div className="metric-grid" style={{ gridTemplateColumns: '1fr' }}><Metric value="4" label="Courses" detail="Active" /><Metric value="3" label="Open tasks" detail="Due soon" /><Metric value="92%" label="Submitted" detail="On time" /></div></section>
          <section className="section-card"><div className="section-heading"><div><h2>Announcements</h2><p>Latest course updates</p></div></div>{announcements.map((item) => <article className="announcement" key={item.title}><h3>{item.title}</h3><p>{item.text}</p><small>{item.course} · {item.time}</small></article>)}</section>
        </aside>
      </div>
    </>
  );
}
