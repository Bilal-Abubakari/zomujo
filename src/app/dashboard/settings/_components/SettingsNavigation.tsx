'use client';

import { JSX } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib/hooks';
import { selectUserRole } from '@/lib/features/auth/authSelector';
import { SidebarType } from '@/types/shared.enum';
import { getSidebarByRole } from '@/app/dashboard/_components/sidebar/sidebarLayout';

const SettingsNavigation = (): JSX.Element => {
  const pathname = usePathname();
  const role = useAppSelector(selectUserRole);
  const sidebar = getSidebarByRole(role, SidebarType.Settings);
  
  // Flatten all menu items from all groups
  const menuItems = sidebar.sidebarGroup.flatMap((group) => 
    group.menu.filter((item) => !item.only || item.only === role)
  );

  return (
    <nav className="border-b bg-white">
      <div className="flex overflow-x-auto">
        <div className="flex min-w-full items-center gap-1 px-4 sm:px-8">
          {menuItems.map(({ title, url, Icon, relatedUrl }) => {
            const isActive = 
              pathname === url || 
              (relatedUrl && pathname.includes(relatedUrl));
            
            return (
              <Link
                key={title}
                href={url}
                className={cn(
                  'relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-gray-300'
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span>{title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default SettingsNavigation;
