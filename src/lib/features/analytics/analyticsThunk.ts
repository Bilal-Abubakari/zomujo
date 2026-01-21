import { createAsyncThunk } from '@reduxjs/toolkit';
import { IResponse } from '@/types/shared.interface';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { Toast } from '@/hooks/use-toast';
import { IAppointmentTrends, IAppointmentStats } from '@/types/analytics.interface';

export const getHospitalAppointmentTrends = createAsyncThunk(
  'analytics/getHospitalAppointmentTrends',
  async (params?: { startDate?: string; endDate?: string }): Promise<Toast | IAppointmentTrends> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      const queryString = queryParams.toString();
      const url = `dashboard/hospital/appointment-trends${queryString ? `?${queryString}` : ''}`;
      const { data } = await axios.get<IResponse<IAppointmentTrends>>(url);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getHospitalAppointmentStatsByDateRange = createAsyncThunk(
  'analytics/getHospitalAppointmentStatsByDateRange',
  async (params: { startDate: string; endDate: string }): Promise<Toast | IAppointmentStats> => {
    try {
      const queryParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
      });
      const { data } = await axios.get<IResponse<IAppointmentStats>>(
        `dashboard/hospital/appointment-stats?${queryParams.toString()}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
