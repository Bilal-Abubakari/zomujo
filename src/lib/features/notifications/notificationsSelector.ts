import { RootState } from '@/lib/store';
import { createSelector } from '@reduxjs/toolkit';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectNotifications = ({ notifications }: RootState) => notifications;

export const selectUserNotifications = createSelector(
  selectNotifications,
  ({ notifications }) => notifications,
);

export const selectNotificationsLoading = createSelector(
  selectNotifications,
  ({ isLoading }) => isLoading,
);

export const selectUnReadNotificationCount = createSelector(
  selectNotifications,
  ({ unreadCount }) => unreadCount,
);

export const selectTotalPages = createSelector(selectNotifications, ({ totalPages }) => totalPages);
