'use client';

import { selectDoctorMustCompleteOnboarding, selectUser } from '@/lib/features/auth/authSelector';
import { useAppSelector } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { JSX, ReactNode, useEffect } from 'react';

export function DashboardProvider({ children }: { children: ReactNode }): JSX.Element {
  const user = useAppSelector(selectUser);
  const mustCompleteOnboarding = useAppSelector(selectDoctorMustCompleteOnboarding);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    if (mustCompleteOnboarding) {
      router.push('/onboarding');
    }
  }, [user, mustCompleteOnboarding]);

  return <>{children}</>;
}
