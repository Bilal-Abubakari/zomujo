'use client';

import { selectUserRole } from '@/lib/features/auth/authSelector';
import { useAppSelector } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { JSX, ReactNode, useEffect } from 'react';
import { Role } from '@/types/shared.enum';

export function RoleProvider({
  children,
  role,
}: Readonly<{ children: ReactNode; role: Role }>): JSX.Element {
  const userRole = useAppSelector(selectUserRole);
  const router = useRouter();

  useEffect(() => {
    if (userRole !== role) {
      router.push('/dashboard');
    }
  }, [userRole, role]);

  return <>{children}</>;
}
