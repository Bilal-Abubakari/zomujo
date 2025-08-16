import { Bell } from 'lucide-react';
import { JSX, useEffect, useState } from 'react';
import Notifications from '@/app/dashboard/_components/notifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { previousNotifications } from '@/lib/features/notifications/notificationsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUnReadNotificationCount } from '@/lib/features/notifications/notificationsSelector';

const Toolbar = (): JSX.Element => {
  const [notificationPage, setNotificationPage] = useState(1);
  const dispatch = useAppDispatch();
  const unreadNotifications = useAppSelector(selectUnReadNotificationCount);

  useEffect(() => {
    dispatch(previousNotifications(notificationPage));
  }, [notificationPage]);

  return (
    <div className="flex justify-between gap-y-4 py-5 max-md:flex-wrap">
      <div className="w-full"></div>
      <div className="flex gap-x-3">
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
      </div>
    </div>
  );
};
export default Toolbar;
