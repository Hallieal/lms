import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default async function LmsLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();

  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    if (!data?.claims) {
      redirect('/');
    }
  }

  return <AppShell authenticated={configured}>{children}</AppShell>;
}
