import type { Metadata } from 'next';
import './globals.css';
import './auth.css';
import { RoleProvider } from '@/components/role-context';

export const metadata: Metadata = {
  title: 'NES Learning',
  description: 'Learning management system prototype for the New Economic School',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
