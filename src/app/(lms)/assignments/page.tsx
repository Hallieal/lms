import { AssignmentsView } from '@/components/assignments-view';
import { getDashboardData } from '@/lib/data';

export default async function AssignmentsPage() {
  const { assignments } = await getDashboardData();
  return <AssignmentsView assignments={assignments} />;
}
