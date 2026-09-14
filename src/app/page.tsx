'use client';

import { useRouter } from 'next/navigation';
import { useRole } from '@/components/role-context';
import type { Role } from '@/lib/types';

const options: Array<{ role: Role; title: string; detail: string }> = [
  { role: 'student', title: 'Continue as Student', detail: 'Courses, assignments, calendar and grades' },
  { role: 'ta', title: 'Preview Teaching Assistant', detail: 'Submissions, grading queue and course materials' },
  { role: 'instructor', title: 'Preview Instructor', detail: 'Course administration, publishing and gradebook' },
];

export default function SignInPage() {
  const router = useRouter();
  const { setRole } = useRole();

  function enter(role: Role) {
    setRole(role);
    router.push('/dashboard');
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <span className="login-brand-mark">N</span>
        <div>
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,.62)' }}>New Economic School</p>
          <h1>One place for teaching and learning.</h1>
          <p>Courses, materials, problem sets, feedback and grades in an interface designed around the way NES courses actually work.</p>
        </div>
        <small>NES Learning · Product prototype</small>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <p className="eyebrow">Fall 2026</p>
          <h2>Welcome back</h2>
          <p>Authentication will be connected to Supabase in the backend phase. For now, choose a role to preview its permissions and workflow.</p>
          <div className="login-options">
            {options.map((option) => (
              <button key={option.role} className="login-option" onClick={() => enter(option.role)}>
                <strong>{option.title}</strong><small>{option.detail}</small>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
