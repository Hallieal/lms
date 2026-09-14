import { notFound } from 'next/navigation';
import { AssignmentDetail } from '@/components/assignment-detail';
import { assignments } from '@/lib/mock-data';

export default async function AssignmentPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const assignment = assignments.find((item) => item.id === Number(assignmentId));
  if (!assignment) notFound();
  return <AssignmentDetail assignment={assignment} />;
}
