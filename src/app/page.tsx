import { DemoRolePicker } from '@/components/demo-role-picker';
import { LoginForm } from '@/components/login-form';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="login-page">
      <section className="login-brand">
        <span className="login-brand-mark">N</span>
        <div>
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,.62)' }}>New Economic School</p>
          <h1>One place for teaching and learning.</h1>
          <p>Courses, materials, problem sets, feedback and grades in an interface designed around the way NES courses actually work.</p>
        </div>
        <small>NES Learning · {configured ? 'Secure sign-in' : 'Product prototype'}</small>
      </section>
      <section className="login-panel">
        {configured ? <LoginForm error={params.error} message={params.message} /> : <DemoRolePicker />}
      </section>
    </main>
  );
}
