import { notFound } from 'next/navigation';
import { AssignmentDetail } from '@/components/assignment-detail';
import { getAssignmentData } from '@/lib/data';

export default async function AssignmentPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const assignment = await getAssignmentData(assignmentId);
  if (!assignment) notFound();
  return <AssignmentDetail assignment={assignment} />;
}
