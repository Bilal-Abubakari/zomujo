import { createAsyncThunk } from '@reduxjs/toolkit';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { Toast } from '@/hooks/use-toast';
import { generateSuccessToast, getValidQueryString } from '@/lib/utils';
import { AppointmentStatus } from '@/types/shared.enum';
import { IAppointment, IAppointmentDoctorId } from '@/types/appointment.interface';
import {
  AppointmentDate,
  AppointmentSlots,
  IPatternException,
  ISlotPattern,
  ISlotPatternBase,
  SlotStatus,
} from '@/types/slots.interface';

export const createAppointmentSlot = createAsyncThunk(
  'appointments/createSlot',
  async (pattern: ISlotPatternBase): Promise<Toast> => {
    try {
      const { data } = await axios.post<IResponse>(`appointments/slot-pattern`, pattern);
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
