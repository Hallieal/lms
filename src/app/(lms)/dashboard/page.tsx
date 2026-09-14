import { DashboardView } from '@/components/dashboard-view';
import { getDashboardData } from '@/lib/data';

export default async function DashboardPage() {
  const { courses, assignments, announcements } = await getDashboardData();
  return <DashboardView courses={courses} assignments={assignments} announcements={announcements} />;
}
