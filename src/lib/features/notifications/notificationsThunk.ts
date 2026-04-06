import { createAsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { IPagination, IResponse } from '@/types/shared.interface';
import { INotification } from '@/types/notification.interface';
import {
  markNotificationAsRead,
  removeNotification,
  unmarkNotificationAsRead,
} from '@/lib/features/notifications/notificationsSlice';
import { generateSuccessToast } from '@/lib/utils';
const commonPath = 'common/' as const;
export const previousNotifications = createAsyncThunk(
  'notifications/previous',
  async (page: number): Promise<Toast | IPagination<INotification>> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<INotification>>>(
        `${commonPath}notifications?page=${page}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: number, { dispatch }) => {
    try {
      dispatch(markNotificationAsRead(id));
      await axios.patch<IResponse<IPagination<INotification>>>(`${commonPath}mark-as-read/${id}`);
    } catch {
      dispatch(unmarkNotificationAsRead(id));
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async (): Promise<Toast | number> => {
    try {
      const { data } = await axios.get<IResponse<{ count: number }>>(
        `${commonPath}notifications/unread-count`,
      );
      return data.data.count;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notification: INotification, { dispatch }) => {
    try {
      await axios.delete(`${commonPath}notifications/${notification.id}`);
      dispatch(removeNotification(notification.id));
      dispatch(fetchUnreadCount());
      return generateSuccessToast('Notification deleted successfully');
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
