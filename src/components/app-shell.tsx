'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/auth/actions';
import { courses } from '@/lib/mock-data';
import { useRole } from './role-context';
import type { Role } from '@/lib/types';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { href: '/courses', label: 'Courses', icon: '▦' },
  { href: '/assignments', label: 'Assignments', icon: '✓' },
  { href: '/calendar', label: 'Calendar', icon: '□' },
  { href: '/grades', label: 'Grades', icon: '↗' },
];

const people: Record<Role, { initials: string; name: string; subtitle: string }> = {
  student: { initials: 'AS', name: 'A. Student', subtitle: 'MAE · Year 2' },
  ta: { initials: 'TA', name: 'Teaching Assistant', subtitle: 'Course staff' },
  instructor: { initials: 'IN', name: 'Instructor', subtitle: 'Faculty' },
};

export function AppShell({
  children,
  authenticated = false,
}: {
  children: React.ReactNode;
  authenticated?: boolean;
}) {
  const pathname = usePathname();
  const { role, setRole } = useRole();
  const person = authenticated
    ? { initials: 'N', name: 'NES account', subtitle: 'Authenticated session' }
    : people[role];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <span className="brand-mark">N</span>
          <span><strong>NES</strong><small>Learning</small></span>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href === '/courses' && pathname.startsWith('/courses/'));
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-section">
          <p className="sidebar-label">Current courses</p>
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="course-mini">
              <span className="course-dot" style={{ background: course.color }} />
              <span>{course.title}</span>
            </Link>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="profile-card">
            <span className="avatar">{person.initials}</span>
            <span className="profile-meta"><strong>{person.name}</strong><small>{person.subtitle}</small></span>
          </div>
          {authenticated ? (
            <form action={signOut}>
              <button type="submit" className="signout-button">Sign out</button>
            </form>
          ) : null}
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <span className="breadcrumbs">Fall 2026</span>
          <div className="topbar-actions">
            {!authenticated ? (
              <label className="role-switcher">
                <span>Preview as</span>
                <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                  <option value="student">Student</option>
                  <option value="ta">Teaching Assistant</option>
                  <option value="instructor">Instructor</option>
                </select>
              </label>
            ) : null}
            <button className="icon-button" aria-label="Notifications">♢<i /></button>
          </div>
        </header>
        <section className="content">{children}</section>
      </main>
    </div>
  );
}
