import axios, { axiosErrorHandler } from '@/lib/axios';
import {
  IDoctor,
  DoctorPersonalInfo,
  NotificationInfo,
  IInviteDoctors,
} from '@/types/doctor.interface';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import { IDoctorCountResponse } from '@/types/stats.interface';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { generateSuccessToast, getValidQueryString } from '@/lib/utils';
import { Toast } from '@/hooks/use-toast';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { IDoctorIdentification } from '@/types/auth.interface';
import { updateExtra } from '../auth/authSlice';
import { INearByQueryParams } from '@/types/hospital.interface';

export const getAllDoctors = createAsyncThunk(
  'doctors/allDoctors',
  async ({
    pageSize,
    ...rest
  }: IQueryParams<AcceptDeclineStatus | ''>): Promise<IPagination<IDoctor> | Toast> => {
    try {
      const { data } = await axios.get<
        IResponse<IPagination<IDoctor>>
      >(`doctors?${getValidQueryString(rest)}&pageSize=${pageSize || 10}
        `);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const approveDoctorRequest = createAsyncThunk(
  'doctors/approveDoctorsRequest',
  async (id: string): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse>(`admins/verify-doctor/${id}`);

      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const declineDoctor = createAsyncThunk(
  'doctors/declineDoctor',
  async (id: string): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.delete<IResponse>(`admins/decline-doctor/${id}`);

      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const countAllDoctors = createAsyncThunk(
  'dashboard/countDoctors',
  async (): Promise<Toast | IDoctorCountResponse> => {
    try {
      const { data } = await axios.get<IResponse<IDoctorCountResponse>>(`dashboard/doctor-count`);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const uploadDoctorId = createAsyncThunk(
  'settings/uploadDoctorId',
  async (doctorIdentification: IDoctorIdentification): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>('doctors/upload-id', doctorIdentification, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const updateDoctorProfile = createAsyncThunk(
  'doctors/profile',
  async (
    doctorInfo: DoctorPersonalInfo | NotificationInfo,
    { dispatch },
  ): Promise<Toast | IResponse<IDoctor>> => {
    try {
      const { data } = await axios.patch<IResponse<IDoctor>>(`doctors/me`, doctorInfo);
      dispatch(updateExtra(data.data));
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const inviteDoctors = createAsyncThunk(
  'doctor/inviteDoctors',
  async (inviteDoctors: IInviteDoctors): Promise<Toast> => {
    try {
      const { data } = await axios.post<IResponse>(`admins/invite-doctors`, inviteDoctors);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const doctorInfo = createAsyncThunk(
  'doctor/info',
  async (id: string): Promise<IDoctor | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IDoctor>>(`doctors/${id}`);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const suggestedDoctors = createAsyncThunk(
  'doctor/suggestedDoctors',
  async ({ long, lat }: Omit<INearByQueryParams, 'radius'>): Promise<IDoctor | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IDoctor>>(
        `doctors/suggested?lat=${lat}&long=${long}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
