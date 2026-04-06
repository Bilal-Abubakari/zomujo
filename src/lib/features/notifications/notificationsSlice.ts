import { INotification } from '@/types/notification.interface';
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUnreadCount,
  previousNotifications,
} from '@/lib/features/notifications/notificationsThunk';

interface NotificationState {
  notifications: INotification[];
  isLoading: boolean;
  totalPages: number;
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  isLoading: false,
  totalPages: 0,
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    updateNotifications: (state, { payload }) => {
      if (state.notifications.some((n) => n.id === payload.id)) {
        return;
      }
      state.notifications = [payload, ...state.notifications];
    },
    markNotificationAsRead: (state, { payload }) => {
      state.notifications = state.notifications.map((notification) =>
        notification.id === payload ? { ...notification, read: true } : notification,
      );
    },
    unmarkNotificationAsRead: (state, { payload }) => {
      state.notifications = state.notifications.map((notification) =>
        notification.id === payload ? { ...notification, read: false } : notification,
      );
    },
    removeNotification: (state, { payload }) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(previousNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(previousNotifications.fulfilled, (state, { payload }) => {
        if ('rows' in payload) {
          const existingIds = new Set(state.notifications.map((n) => n.id));
          const newNotifications = payload.rows.filter((n) => !existingIds.has(n.id));
          state.notifications = [...state.notifications, ...newNotifications];
          state.totalPages = payload.totalPages;
        }
        state.isLoading = false;
      })
      .addCase(previousNotifications.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, { payload }) => {
        if (typeof payload === 'number') {
          state.unreadCount = payload;
        }
      });
  },
});

export const {
  updateNotifications,
  markNotificationAsRead,
  unmarkNotificationAsRead,
  removeNotification,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
