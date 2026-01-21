import { createSlice } from '@reduxjs/toolkit';
import { IAppointmentTrends, IAppointmentStats } from '@/types/analytics.interface';
import { getHospitalAppointmentTrends, getHospitalAppointmentStatsByDateRange } from './analyticsThunk';
import { showErrorToast } from '@/lib/utils';

interface AnalyticsState {
  trends: IAppointmentTrends | null;
  stats: IAppointmentStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  trends: null,
  stats: null,
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.trends = null;
      state.stats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get trends
      .addCase(getHospitalAppointmentTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getHospitalAppointmentTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && !showErrorToast(action.payload) && 'rows' in action.payload) {
          state.trends = action.payload as IAppointmentTrends;
        }
      })
      .addCase(getHospitalAppointmentTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch trends';
      })
      // Get stats
      .addCase(getHospitalAppointmentStatsByDateRange.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getHospitalAppointmentStatsByDateRange.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && !showErrorToast(action.payload) && 'total' in action.payload) {
          state.stats = action.payload as IAppointmentStats;
        }
      })
      .addCase(getHospitalAppointmentStatsByDateRange.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch stats';
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
