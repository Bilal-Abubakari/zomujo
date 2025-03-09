import { createAsyncThunk } from '@reduxjs/toolkit';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { Toast } from '@/hooks/use-toast';
import {
  IPatternException,
  ISlot,
  ISlotPattern,
  ISlotPatternBase,
  SlotStatus,
} from '@/types/appointment';
import { generateSuccessToast, getValidQueryString } from '@/lib/utils';

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
  async (queryParams: IQueryParams<SlotStatus | ''>): Promise<Toast | IPagination<ISlot>> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<ISlot>>>(
        `appointments/slots?${getValidQueryString(queryParams)}&orderDirection=asc`,
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
