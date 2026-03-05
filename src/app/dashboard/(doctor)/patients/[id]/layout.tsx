import React, { ReactNode, JSX } from 'react';

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return <>{children}</>;
}
