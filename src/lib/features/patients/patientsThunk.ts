import { createAsyncThunk } from '@reduxjs/toolkit';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { IPatient } from '@/types/patient.interface';
import { IDoctorCountResponse } from '@/types/stats.interface';
import { getValidQueryString } from '@/lib/utils';

export const getAllPatients = createAsyncThunk(
  'patients/allPatients',
  async (query: IQueryParams<AcceptDeclineStatus | ''>): Promise<IPagination<IPatient> | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<IPatient>>>(
        `patients?${getValidQueryString(query)}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const patientsStats = createAsyncThunk(
  'patients/stats',
  async (): Promise<Toast | IDoctorCountResponse> => {
    try {
      const { data } = await axios.get<IResponse<IDoctorCountResponse>>(`dashboard/patient-count`);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
