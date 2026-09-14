import { CourseCard, PageHeader } from '@/components/ui';
import { getViewerContext } from '@/lib/data';

export default async function CoursesPage() {
  const { courses } = await getViewerContext();

  return (
    <>
      <PageHeader eyebrow="Fall 2026" title="Courses" subtitle="Everything you are enrolled in or teaching this term." />
      <section className="section-card">
        <div className="course-grid">
          {courses.length ? courses.map((course) => <CourseCard key={course.id} course={course} />) : <p className="empty-state">No active courses.</p>}
        </div>
      </section>
    </>
  );
}
