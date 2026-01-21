import { createAsyncThunk } from '@reduxjs/toolkit';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { Toast } from '@/hooks/use-toast';
import { generateSuccessToast, getValidQueryString } from '@/lib/utils';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { IAppointment, IAppointmentDoctorId } from '@/types/appointment.interface';
import {
  AppointmentDate,
  AppointmentSlots,
  IPatternException,
  ISlotPattern,
  ISlotPatternBase,
  SlotStatus,
} from '@/types/slots.interface';
import { updateExtra } from '@/lib/features/auth/authSlice';

export const createAppointmentSlot = createAsyncThunk(
  'appointments/createSlot',
  async (pattern: ISlotPatternBase, { dispatch }): Promise<Toast> => {
    try {
      const { data } = await axios.post<IResponse>(`appointments/slot-pattern`, pattern);
      dispatch(updateExtra({ hasSlot: true }));
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getAppointmentSlots = createAsyncThunk(
  'appointments/getSlots',
  async (
    queryParams: IQueryParams<SlotStatus | ''>,
  ): Promise<Toast | IPagination<AppointmentDate>> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<AppointmentDate>>>(
        `appointments/slots?${getValidQueryString(queryParams)}&orderDirection=asc`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getAppointmentSlotsDates = createAsyncThunk(
  'appointments/getSlotsDates',
  async (
    queryParams: IQueryParams<SlotStatus | ''>,
  ): Promise<Toast | IPagination<AppointmentDate>> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<AppointmentDate>>>(
        `appointments/slots-dates?${getValidQueryString(queryParams)}&orderDirection=asc`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getAppointmentSlot = createAsyncThunk(
  'appointments/getSlot',
  async (id: string): Promise<Toast | AppointmentSlots> => {
    try {
      const { data } = await axios.get<IResponse<AppointmentSlots>>(`appointments/slots/${id}`);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getAppointmentSlotsByDate = createAsyncThunk(
  'appointments/getSlotsByDate',
  async (
    queryParams: Pick<IQueryParams, 'date' | 'doctorId' | 'orgId'>,
  ): Promise<Toast | AppointmentSlots[]> => {
    try {
      const { data } = await axios.get<IResponse<AppointmentSlots[]>>(
        `appointments/slots-by-date?${getValidQueryString(queryParams)}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getAppointmentSlotsByMonth = createAsyncThunk(
  'appointments/getSlotsByMonth',
  async (
    queryParams: Pick<IQueryParams<SlotStatus>, 'status' | 'month' | 'orgId' | 'doctorId'>,
  ): Promise<Toast | AppointmentSlots[]> => {
    try {
      const { data } = await axios.get<IResponse<AppointmentSlots[]>>(
        `appointments/slots-by-month?${getValidQueryString(queryParams)}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const deleteSlot = createAsyncThunk(
  'appointments/deleteSlot',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.delete<IResponse>(`appointments/slots/${id}`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const deletePattern = createAsyncThunk(
  'appointments/deletePattern',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.delete<IResponse>(`appointments/slot-pattern/${id}`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getSlotPatterns = createAsyncThunk(
  'appointments/slotPatterns',
  async (): Promise<Toast | ISlotPattern> => {
    try {
      const { data } = await axios.get<IResponse<ISlotPattern>>('appointments/slot-patterns');
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const createPatternException = createAsyncThunk(
  'appointments/createPatternException',
  async (exception: IPatternException): Promise<Toast> => {
    try {
      const { data } = await axios.post<IResponse>(`appointments/slot-exception`, exception);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getAppointments = createAsyncThunk(
  'appointments/getAppointments',
  async (
    queryParams: IQueryParams<AppointmentStatus | ''>,
  ): Promise<Toast | IPagination<IAppointment>> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<IAppointment>>>(
        `appointments?${getValidQueryString(queryParams)}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const acceptAppointment = createAsyncThunk(
  'appointment/acceptRequest',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse>(`appointments/accept/${id}`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const declineAppointment = createAsyncThunk(
  'appointment/declineRequest',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.delete<IResponse>(`appointments/decline/${id}`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const assignAppointment = createAsyncThunk(
  'appointment/assignRequest',
  async (appointment: IAppointmentDoctorId): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse>(`appointments/assign`, appointment);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const rescheduleAppointment = createAsyncThunk(
  'appointment/reschedule',
  async (payload: { slotId: string; appointmentId: string }): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse>(`appointments/reschedule`, payload);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const reopenAppointment = createAsyncThunk(
  'appointment/reopen',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse>(`appointments/reopen/${id}`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
