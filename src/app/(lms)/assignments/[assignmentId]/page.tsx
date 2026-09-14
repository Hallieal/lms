import { notFound } from 'next/navigation';
import { AssignmentDetail } from '@/components/assignment-detail';
import { getAssignmentData } from '@/lib/data';

export default async function AssignmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ assignmentId: string }>;
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const { assignmentId } = await params;
  const query = await searchParams;
  const assignment = await getAssignmentData(assignmentId);
  if (!assignment) notFound();

  return (
    <AssignmentDetail
      assignment={assignment}
      error={query.error}
      submitted={query.submitted === '1'}
    />
  );
}
