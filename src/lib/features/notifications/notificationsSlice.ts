import { INotification } from '@/types/notification.interface';
import { createSlice } from '@reduxjs/toolkit';
import { previousNotifications } from '@/lib/features/notifications/notificationsThunk';

interface NotificationState {
  notifications: INotification[];
  isLoading: boolean;
  totalPages: number;
}

const initialState: NotificationState = {
  notifications: [],
  isLoading: false,
  totalPages: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    updateNotifications: (state, { payload }) => {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(previousNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(previousNotifications.fulfilled, (state, { payload }) => {
        if ('rows' in payload) {
          state.notifications = [...state.notifications, ...payload.rows];
          state.totalPages = payload.totalPages;
        }
        state.isLoading = false;
      })
      .addCase(previousNotifications.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { updateNotifications, markNotificationAsRead, unmarkNotificationAsRead } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
