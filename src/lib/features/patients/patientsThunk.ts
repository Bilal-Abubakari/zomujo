import { createAsyncThunk } from '@reduxjs/toolkit';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { IPatient, IPatientMedicalHistory } from '@/types/patient.interface';
import { IDoctorCountResponse } from '@/types/stats.interface';
import { generateSuccessToast, getValidQueryString } from '@/lib/utils';
import { updateExtra } from '@/lib/features/auth/authSlice';

const patientsPath = 'patients';

export const getAllPatients = createAsyncThunk(
  'patients/allPatients',
  async (query: IQueryParams<AcceptDeclineStatus | ''>): Promise<IPagination<IPatient> | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<IPatient>>>(
        `${patientsPath}?${getValidQueryString(query)}`,
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

export const updatePatient = createAsyncThunk(
  'patients/update',
  async (patientInfo: Partial<IPatient>, { dispatch }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse<IDoctorCountResponse>>(`${patientsPath}/me`, patientInfo);
      dispatch(updateExtra(patientInfo));
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getPatientMedicalHistory = createAsyncThunk(
  'patients/medicalHistory',
  async (): Promise<Toast | IPatientMedicalHistory> => {
    try {
      const { data } = await axios.get<IResponse<IPatientMedicalHistory>>(
        `${patientsPath}/medical-history`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
