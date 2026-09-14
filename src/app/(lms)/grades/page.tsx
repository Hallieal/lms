import { GradesView } from '@/components/grades-view';
import { getGradesData } from '@/lib/grades-data';

export default async function GradesPage() {
  const data = await getGradesData();
  return <GradesView data={data} />;
}
