import { useRef, useCallback, JSX } from 'react';
import { getFormattedDate } from '@/lib/date';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  selectNotificationsLoading,
  selectTotalPages,
  selectUserNotifications,
} from '@/lib/features/notifications/notificationsSelector';
import { AvatarComp } from '@/components/ui/avatar';
import { Logo } from '@/assets/images';
import { CheckCheck, EyeIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markAsRead } from '@/lib/features/notifications/notificationsThunk';

export type NotificationsProps = {
  loadMore: () => void;
  page: number;
};

const Notifications = ({ loadMore, page }: NotificationsProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectUserNotifications);
  const isLoading = useAppSelector(selectNotificationsLoading);
  const totalPages = useAppSelector(selectTotalPages);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastNotificationRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) {
        return;
      }
      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          loadMore();
        }
      });
      if (node) {
        observer.current.observe(node);
      }
    },
    [isLoading, page, totalPages, loadMore],
  );

  const style =
    'flex w-full min-w-[250px] flex-col items-center px-8 gap-4 min-[450px]:min-w-[350px] min-[500px]:min-w-[400px] min-[550px]:min-w-[450px]';

  return (
    <div className="flex max-h-[70vh] flex-col gap-8 overflow-y-scroll py-8">
      {isLoading && !notifications.length ? (
        <div className={cn(style)}>
          <Loader2 className="animate-spin" />
          <span>Loading...</span>
        </div>
      ) : !notifications.length ? (
        <div className={cn(style)}>
          <div>Quite here...</div>
          <div>Nothing to show</div>
        </div>
      ) : (
        notifications.map(({ id, payload, createdAt, read }, index) => (
          <div
            ref={notifications.length === index + 1 ? lastNotificationRef : null}
            className={cn('flex flex-col rounded-xl p-4', !read && 'bg-gray-200')}
            key={id}
          >
            <div className="flex gap-4">
              <AvatarComp name="" imageSrc={Logo.src} imageAlt="notification" />
              <div className="flex w-full justify-between">
                <div>
                  <h3 className="font-bold">{payload.topic}</h3>
                  <span className="text-sm text-gray-400">{getFormattedDate(createdAt)}</span>
                </div>
                {!read && (
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                )}
              </div>
            </div>
            <div>
              <div className="mt-4 max-w-sm rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                {payload.message}
              </div>
            </div>
            {!read && (
              <div className="mt-2 flex justify-between">
                <button
                  onClick={() => dispatch(markAsRead(id))}
                  className="hover:text-primaryDark flex items-center gap-2 text-sm text-gray-500"
                >
                  <CheckCheck /> <span>Mark as Read</span>
                </button>
                <button className="hover:text-primaryDark flex items-center gap-2 text-sm text-gray-500">
                  <EyeIcon /> <span>View</span>
                </button>
              </div>
            )}
          </div>
        ))
      )}
      {isLoading && notifications.length && (
        <div className={cn(style)}>
          <span>Loading more...</span>
        </div>
      )}
    </div>
  );
};

export default Notifications;
