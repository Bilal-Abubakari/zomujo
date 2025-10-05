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
import { CheckCheck, EyeIcon, Loader2, Bell } from 'lucide-react';
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

  const loadingContainerStyle =
    'flex w-full flex-col items-center justify-center px-4 py-8 gap-3 min-h-[200px]';

  return (
    <div className="flex max-h-[70vh] w-full flex-col overflow-hidden">
      <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 flex-1 overflow-y-auto">
        <div className="p-2 sm:p-4 lg:p-6">
          {isLoading && !notifications.length ? (
            <div className={cn(loadingContainerStyle)}>
              <Loader2 className="h-6 w-6 animate-spin text-gray-400 sm:h-8 sm:w-8" />
              <span className="text-xs text-gray-500 sm:text-sm">Loading notifications...</span>
            </div>
          ) : !notifications.length ? (
            <div className={cn(loadingContainerStyle)}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 sm:h-16 sm:w-16">
                <Bell className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-medium text-gray-900 sm:text-lg">All caught up!</h3>
                <p className="text-xs text-gray-500 sm:text-sm">No notifications to show</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {notifications.map(({ id, payload, createdAt, read }, index) => (
                <div
                  ref={notifications.length === index + 1 ? lastNotificationRef : null}
                  className={cn(
                    'group relative w-full rounded-lg border transition-all duration-200 hover:shadow-md',
                    read
                      ? 'border-gray-200 bg-white hover:border-gray-300'
                      : 'border-[#067458]/20 bg-[#067458]/5 hover:border-[#067458]/30',
                  )}
                  key={id}
                >
                  <div className="w-full p-2 sm:p-3 lg:p-4">
                    {/* Header section */}
                    <div className="flex w-full gap-2 sm:gap-3 lg:gap-4">
                      <div className="flex-shrink-0">
                        <AvatarComp
                          name=""
                          imageSrc={Logo.src}
                          imageAlt="notification"
                          className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
                        />
                      </div>

                      <div className="w-0 min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs leading-tight font-semibold break-words text-gray-900 sm:text-sm lg:text-base">
                              {payload.topic}
                            </h3>
                            <time className="mt-0.5 block text-xs text-gray-500">
                              {getFormattedDate(createdAt)}
                            </time>
                          </div>

                          {!read && (
                            <span className="mt-1 inline-flex max-w-fit items-center rounded-full bg-[#067458]/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-[#067458] sm:mt-0">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Message content - Fixed responsiveness */}
                    <div className="mt-2 w-full sm:mt-3">
                      <div className="w-full max-w-full rounded-lg bg-gray-50 p-2 sm:p-3">
                        <p className="overflow-wrap-anywhere text-xs leading-relaxed break-words whitespace-pre-wrap text-gray-700 sm:text-sm">
                          {payload.message}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {!read && (
                      <div className="mt-2 flex w-full flex-row gap-2 sm:mt-3 sm:gap-3">
                        <button
                          onClick={() => dispatch(markAsRead(id))}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-[#067458] sm:justify-start sm:text-sm"
                        >
                          <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Mark as Read</span>
                        </button>
                        <button className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#067458] px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#067458]/90 focus:ring-2 focus:ring-[#067458] sm:justify-start sm:text-sm">
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading more indicator */}
          {isLoading && notifications.length > 0 && (
            <div className="flex items-center justify-center py-4 sm:py-6">
              <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                <span>Loading more notifications...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
