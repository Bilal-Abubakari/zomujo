import { Bell, Menu } from 'lucide-react';
import { JSX, useEffect, useState } from 'react';
import Notifications from '@/app/dashboard/_components/notifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { previousNotifications } from '@/lib/features/notifications/notificationsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUnReadNotificationCount } from '@/lib/features/notifications/notificationsSelector';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AvatarComp } from '@/components/ui/avatar';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { logout } from '@/lib/features/auth/authThunk';
import { useRouter } from 'next/navigation';

const Toolbar = (): JSX.Element => {
  const [notificationPage, setNotificationPage] = useState(1);
  const dispatch = useAppDispatch();
  const unreadNotifications = useAppSelector(selectUnReadNotificationCount);
  const userName = useAppSelector(selectUserName);
  const router = useRouter();

  const logoutHandler = async (): Promise<void> => {
    await dispatch(logout());
    router.refresh();
  };

  useEffect(() => {
    dispatch(previousNotifications(notificationPage));
  }, [notificationPage]);

  return (
    <div className="flex items-center justify-end gap-y-4 py-5">
      <SidebarTrigger className="me:hidden mr-auto" child={<Menu />} />
      <div className="flex items-center gap-x-3">
        <Popover>
          <PopoverTrigger className="outline-hidden">
            <div className="relative cursor-pointer rounded-full border border-gray-200 bg-white p-2">
              <Bell className="text-grayscale-500" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 p-2.5 text-xs text-white">
                  {unreadNotifications}
                </span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="z-1000 w-full">
            <Notifications
              page={notificationPage}
              loadMore={() => setNotificationPage((prev) => prev + 1)}
            />
          </PopoverContent>
        </Popover>
        <div className="me:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex cursor-pointer flex-col items-center justify-center">
                <AvatarComp name={userName} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem>
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logoutHandler()}>
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
export default Toolbar;
