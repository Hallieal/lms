import { notFound } from 'next/navigation';
import { CourseDetail } from '@/components/course-detail';
import { courses } from '@/lib/mock-data';

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courses.find((item) => item.id === courseId);
  if (!course) notFound();
  return <CourseDetail course={course} />;
}
