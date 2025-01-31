import axios, { axiosErrorHandler } from '@/lib/axios';
import { IDoctor, DoctorPersonalInfo, NotificationInfo, IInviteDoctors } from '@/types/doctor.interface';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import { IDoctorCountResponse } from '@/types/stats.interface';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { generateSuccessToast } from '@/lib/utils';
import { Toast } from '@/hooks/use-toast';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { IDoctorIdentification } from '@/types/auth.interface';

export const getAllDoctors = createAsyncThunk(
  'doctors/allDoctors',
  async ({
    page,
    search,
    status,
  }: IQueryParams<AcceptDeclineStatus | ''>): Promise<IPagination<IDoctor> | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<IDoctor>>>(
        `doctors?page=${page}&search=${search}&status=${status}`,
      );
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
  'settings/uploadDoctorsId',
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
  ): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse<DoctorPersonalInfo>>(`doctors/me`, doctorInfo, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return generateSuccessToast(message);
    } catch (error) {
           return axiosErrorHandler(error, true) as Toast;
    } 
  })

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