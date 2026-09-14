import { CourseCard, PageHeader } from '@/components/ui';
import { getViewerContext } from '@/lib/data';
import { getPlatformAdminContext } from '@/lib/admin';
import { createCourse } from './actions';

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const viewer = await getViewerContext();
  const admin = await getPlatformAdminContext();
  const courses = admin.isAdmin ? admin.courses : viewer.courses;

  return (
    <>
      <PageHeader eyebrow="Fall 2026" title="Courses" subtitle="Everything you are enrolled in or teaching this term." />

      {admin.isAdmin ? (
        <section className="section-card" style={{ marginBottom: 24 }}>
          <div className="section-heading">
            <div><h2>Create course</h2><p>Platform administrator · new courses start as drafts</p></div>
          </div>
          {params.error ? <div className="auth-error">{params.error}</div> : null}
          <form action={createCourse} className="course-create-grid">
            <label className="field-label"><span>Course code</span><input name="code" required placeholder="MAE 202" /></label>
            <label className="field-label"><span>Course title</span><input name="title" required placeholder="Econometrics II" /></label>
            <label className="field-label"><span>Term</span><select name="term" defaultValue="Fall"><option>Fall</option><option>Winter</option><option>Spring</option><option>Summer</option></select></label>
            <label className="field-label"><span>Academic year</span><input name="academicYear" type="number" min="2000" max="2100" defaultValue="2026" required /></label>
            <label className="field-label course-create-description"><span>Description</span><input name="description" placeholder="Optional course description" /></label>
            <button className="button course-create-submit" type="submit">Create draft course</button>
          </form>
        </section>
      ) : null}

      <section className="section-card">
        <div className="course-grid">
          {courses.length ? courses.map((course) => <CourseCard key={course.id} course={course} />) : <p className="empty-state">No active courses.</p>}
        </div>
      </section>
    </>
  );
}
