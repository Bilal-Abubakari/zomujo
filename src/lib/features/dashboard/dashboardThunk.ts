import { createAsyncThunk } from '@reduxjs/toolkit';
import { IResponse } from '@/types/shared.interface';
import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import {
  IPaymentStats,
  IRecentTransaction,
  IUserStats,
  IActiveUsers,
  IAppointmentStat,
} from '@/types/dashboard.interface';

export const getPaymentStats = createAsyncThunk(
  'dashboard/paymentStats',
  async (): Promise<IPaymentStats | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IPaymentStats>>('dashboard/payment-stats');
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getRecentTransactions = createAsyncThunk(
  'dashboard/recentTransactions',
  async (): Promise<IRecentTransaction[] | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IRecentTransaction[]>>(
        'dashboard/recent-transactions',
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getUserStats = createAsyncThunk(
  'dashboard/userStats',
  async (): Promise<IUserStats | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IUserStats>>('dashboard/user-stats');
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getActiveUsers = createAsyncThunk(
  'dashboard/activeUsers',
  async (): Promise<IActiveUsers | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IActiveUsers>>('dashboard/active-users');
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getAppointmentStat = createAsyncThunk(
  'dashboard/appointmentStat',
  async (): Promise<IAppointmentStat | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IAppointmentStat>>('dashboard/appointment-stat');
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
