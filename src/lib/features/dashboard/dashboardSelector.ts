import { RootState } from '@/lib/store';
import { createSelector } from '@reduxjs/toolkit';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectDashboard = ({ dashboard }: RootState) => dashboard;

export const selectPaymentStats = createSelector(
  selectDashboard,
  ({ paymentStats }) => paymentStats,
);

export const selectRecentTransactions = createSelector(
  selectDashboard,
  ({ recentTransactions }) => recentTransactions,
);

export const selectUserStats = createSelector(selectDashboard, ({ userStats }) => userStats);

export const selectActiveUsers = createSelector(selectDashboard, ({ activeUsers }) => activeUsers);

export const selectAppointmentStat = createSelector(
  selectDashboard,
  ({ appointmentStat }) => appointmentStat,
);

export const selectIsLoadingPaymentStats = createSelector(
  selectDashboard,
  ({ isLoadingPaymentStats }) => isLoadingPaymentStats,
);

export const selectIsLoadingRecentTransactions = createSelector(
  selectDashboard,
  ({ isLoadingRecentTransactions }) => isLoadingRecentTransactions,
);

export const selectRecentPayments = createSelector(
  selectDashboard,
  ({ recentPayments }) => recentPayments,
);

export const selectIsLoadingRecentPayments = createSelector(
  selectDashboard,
  ({ isLoadingRecentPayments }) => isLoadingRecentPayments,
);

export const selectIsLoadingUserStats = createSelector(
  selectDashboard,
  ({ isLoadingUserStats }) => isLoadingUserStats,
);

export const selectIsLoadingActiveUsers = createSelector(
  selectDashboard,
  ({ isLoadingActiveUsers }) => isLoadingActiveUsers,
);

export const selectIsLoadingAppointmentStat = createSelector(
  selectDashboard,
  ({ isLoadingAppointmentStat }) => isLoadingAppointmentStat,
);
