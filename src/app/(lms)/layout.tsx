import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { getViewerContext } from '@/lib/data';
import { getPlatformAdminContext } from '@/lib/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default async function LmsLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const viewer = await getViewerContext();

  if (configured && !viewer.userId) {
    redirect('/');
  }

  const admin = configured ? await getPlatformAdminContext() : { isAdmin: false, courses: [] };

  return (
    <AppShell
      authenticated={configured}
      authenticatedRole={admin.isAdmin ? 'instructor' : viewer.role}
      courses={admin.isAdmin ? admin.courses : viewer.courses}
    >
      {children}
    </AppShell>
  );
}
