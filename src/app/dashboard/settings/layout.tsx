import React, { ReactNode } from 'react';
import { Navbar, SidebarLayout } from '../_components/sidebar/sidebarLayout';
import { SidebarType } from '@/types/shared.enum';

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>): React.JSX.Element {
  return (
    <div className="relative -ml-6 flex h-full flex-col">
      <div className="flex items-center justify-between bg-white px-6 sm:h-[97px]">
        <h2 className="py-2 text-xl font-bold sm:py-0 sm:text-[32px]">Settings</h2>
      </div>
      <Navbar />
      <div className="relative flex h-[calc(100vh-99px)] overflow-hidden">
        <SidebarLayout
          type={SidebarType.Settings}
          sidebarClassName="absolute left-0"
          sidebarContentClassName="bg-gray-100  border-r"
          sidebarTabClassName="data-[active=true]/menu-action:before:opacity-0"
        />
        <div className="w-full overflow-y-scroll bg-gray-50 px-8 pt-8">{children}</div>
      </div>
    </div>
  );
}
