import { createAsyncThunk } from '@reduxjs/toolkit';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { Toast } from '@/hooks/use-toast';
import { ISlot, ISlotPattern, SlotStatus } from '@/types/appointment';
import { generateSuccessToast } from '@/lib/utils';

export const createAppointmentSlot = createAsyncThunk(
  'appointments/createSlot',
  async (pattern: ISlotPattern): Promise<Toast> => {
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
  async ({ page }: IQueryParams<SlotStatus | ''>): Promise<Toast | IPagination<ISlot>> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<ISlot>>>(
        `appointments/slots?page=${page}&orderDirection=asc`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
