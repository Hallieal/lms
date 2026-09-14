import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { getViewerContext } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default async function LmsLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const viewer = await getViewerContext();

  if (configured && !viewer.userId) {
    redirect('/');
  }

  return (
    <AppShell
      authenticated={configured}
      authenticatedRole={viewer.role}
      courses={viewer.courses}
    >
      {children}
    </AppShell>
  );
}
