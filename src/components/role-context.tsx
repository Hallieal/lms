'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Role } from '@/lib/types';

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  isStaff: boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('student');

  useEffect(() => {
    const saved = window.localStorage.getItem('nes-lms-role') as Role | null;
    if (saved === 'student' || saved === 'ta' || saved === 'instructor') setRoleState(saved);
  }, []);

  function setRole(nextRole: Role) {
    setRoleState(nextRole);
    window.localStorage.setItem('nes-lms-role', nextRole);
  }

  const value = useMemo(() => ({ role, setRole, isStaff: role !== 'student' }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const value = useContext(RoleContext);
  if (!value) throw new Error('useRole must be used inside RoleProvider');
  return value;
}
