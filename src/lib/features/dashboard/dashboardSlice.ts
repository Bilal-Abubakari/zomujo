import { createSlice } from '@reduxjs/toolkit';
import {
  IPaymentStats,
  IRecentTransaction,
  IUserStats,
  IActiveUsers,
  IAppointmentStat,
} from '@/types/dashboard.interface';
import { showErrorToast } from '@/lib/utils';
import {
  getPaymentStats,
  getRecentTransactions,
  getUserStats,
  getActiveUsers,
  getAppointmentStat,
} from '@/lib/features/dashboard/dashboardThunk';

interface DashboardState {
  paymentStats: IPaymentStats | null;
  recentTransactions: IRecentTransaction[];
  userStats: IUserStats | null;
  activeUsers: IActiveUsers | null;
  appointmentStat: IAppointmentStat | null;
  isLoadingPaymentStats: boolean;
  isLoadingRecentTransactions: boolean;
  isLoadingUserStats: boolean;
  isLoadingActiveUsers: boolean;
  isLoadingAppointmentStat: boolean;
}

const initialState: DashboardState = {
  paymentStats: null,
  recentTransactions: [],
  userStats: null,
  activeUsers: null,
  appointmentStat: null,
  isLoadingPaymentStats: false,
  isLoadingRecentTransactions: false,
  isLoadingUserStats: false,
  isLoadingActiveUsers: false,
  isLoadingAppointmentStat: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentStats.pending, (state) => {
        state.isLoadingPaymentStats = true;
      })
      .addCase(getPaymentStats.fulfilled, (state, { payload }) => {
        state.isLoadingPaymentStats = false;
        if (!showErrorToast(payload)) {
          state.paymentStats = payload as IPaymentStats;
        }
      })
      .addCase(getPaymentStats.rejected, (state) => {
        state.isLoadingPaymentStats = false;
      })

      .addCase(getRecentTransactions.pending, (state) => {
        state.isLoadingRecentTransactions = true;
      })
      .addCase(getRecentTransactions.fulfilled, (state, { payload }) => {
        state.isLoadingRecentTransactions = false;
        if (!showErrorToast(payload)) {
          state.recentTransactions = payload as IRecentTransaction[];
        }
      })
      .addCase(getRecentTransactions.rejected, (state) => {
        state.isLoadingRecentTransactions = false;
      })

      .addCase(getUserStats.pending, (state) => {
        state.isLoadingUserStats = true;
      })
      .addCase(getUserStats.fulfilled, (state, { payload }) => {
        state.isLoadingUserStats = false;
        if (!showErrorToast(payload)) {
          state.userStats = payload as IUserStats;
        }
      })
      .addCase(getUserStats.rejected, (state) => {
        state.isLoadingUserStats = false;
      })

      .addCase(getActiveUsers.pending, (state) => {
        state.isLoadingActiveUsers = true;
      })
      .addCase(getActiveUsers.fulfilled, (state, { payload }) => {
        state.isLoadingActiveUsers = false;
        if (!showErrorToast(payload)) {
          state.activeUsers = payload as IActiveUsers;
        }
      })
      .addCase(getActiveUsers.rejected, (state) => {
        state.isLoadingActiveUsers = false;
      })

      .addCase(getAppointmentStat.pending, (state) => {
        state.isLoadingAppointmentStat = true;
      })
      .addCase(getAppointmentStat.fulfilled, (state, { payload }) => {
        state.isLoadingAppointmentStat = false;
        if (!showErrorToast(payload)) {
          state.appointmentStat = payload as IAppointmentStat;
        }
      })
      .addCase(getAppointmentStat.rejected, (state) => {
        state.isLoadingAppointmentStat = false;
      });
  },
});

export default dashboardSlice.reducer;
