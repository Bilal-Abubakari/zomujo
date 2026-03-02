import React, { ReactNode } from 'react';
import SettingsNavigation from './_components/SettingsNavigation';

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>): React.JSX.Element {
  return (
    <div className="relative -ml-6 flex h-full flex-col">
      <div className="flex items-center justify-between px-6">
        <h2 className="text-xl font-bold sm:py-0 sm:text-[32px]">Settings</h2>
      </div>
      <SettingsNavigation />
      <div className="relative flex-1 overflow-y-auto bg-gray-50 px-6 pt-8 pb-16 sm:px-12 sm:pb-20 lg:px-16 lg:pb-24">
        {children}
      </div>
    </div>
  );
}
