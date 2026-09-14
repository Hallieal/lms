import { courses } from '@/lib/mock-data';
import { CourseCard, PageHeader } from '@/components/ui';

export default function CoursesPage() {
  return (
    <>
      <PageHeader eyebrow="Fall 2026" title="Courses" subtitle="Everything you are enrolled in or teaching this term." />
      <section className="section-card"><div className="course-grid">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div></section>
    </>
  );
}
