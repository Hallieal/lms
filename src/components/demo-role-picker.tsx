'use client';

import { useRouter } from 'next/navigation';
import { useRole } from '@/components/role-context';
import type { Role } from '@/lib/types';

const options: Array<{ role: Role; title: string; detail: string }> = [
  { role: 'student', title: 'Continue as Student', detail: 'Courses, assignments, calendar and grades' },
  { role: 'ta', title: 'Preview Teaching Assistant', detail: 'Submissions, grading queue and course materials' },
  { role: 'instructor', title: 'Preview Instructor', detail: 'Course administration, publishing and gradebook' },
];

export function DemoRolePicker() {
  const router = useRouter();
  const { setRole } = useRole();

  function enter(role: Role) {
    setRole(role);
    router.push('/dashboard');
  }

  return (
    <div className="login-card">
      <p className="eyebrow">Demo mode</p>
      <h2>Preview the LMS</h2>
      <p>Supabase credentials are not configured in this environment, so the app is using local demonstration data.</p>
      <div className="login-options">
        {options.map((option) => (
          <button key={option.role} className="login-option" onClick={() => enter(option.role)}>
            <strong>{option.title}</strong>
            <small>{option.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
