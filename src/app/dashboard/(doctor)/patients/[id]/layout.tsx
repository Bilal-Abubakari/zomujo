import React, { ReactNode, JSX } from 'react';
import PatientView from '@/app/dashboard/(doctor)/_components/PatientView';

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return <PatientView>{children}</PatientView>;
}
