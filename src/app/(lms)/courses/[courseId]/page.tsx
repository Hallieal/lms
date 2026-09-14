import { notFound } from 'next/navigation';
import { CourseDetail } from '@/components/course-detail';
import { getCourseData } from '@/lib/data';

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const { course, assignments, modules } = await getCourseData(courseId);
  if (!course) notFound();
  return <CourseDetail course={course} assignments={assignments} modules={modules} />;
}
