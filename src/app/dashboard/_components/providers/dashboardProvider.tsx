'use client';

import { selectDoctorMustCompleteOnboarding, selectUser } from '@/lib/features/auth/authSelector';
import { useAppSelector } from '@/lib/hooks';
import { usePathname, useRouter } from 'next/navigation';
import { JSX, ReactNode, useEffect } from 'react';

export function DashboardProvider({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
  const user = useAppSelector(selectUser);
  const mustCompleteOnboarding = useAppSelector(selectDoctorMustCompleteOnboarding);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      // If the user is accessing a doctor profile page without being logged in,
      // redirect them to the public profile page instead of the login page.
      const doctorProfileMatch = /^\/dashboard\/doctor\/([^/]+)$/.exec(pathname);
      if (doctorProfileMatch) {
        const doctorId = doctorProfileMatch[1];
        router.replace(`/doctor/${doctorId}`);
      } else {
        router.push('/login');
      }
    }
    if (mustCompleteOnboarding) {
      router.push('/onboarding');
    }
  }, [user, mustCompleteOnboarding, pathname, router]);

  return <>{children}</>;
}
