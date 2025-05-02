import { createAsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { IResponse } from '@/types/shared.interface';
import { fetchSystemSymptoms } from './fetchSystemSymptoms';

export const getComplaintSuggestions = createAsyncThunk(
  'consultation/complaint-suggestions',
  async (): Promise<Toast | string[]> => {
    try {
      const {
        data: { data },
      } = await axios.get<IResponse<{ name: string }[]>>(`consultation/complaint-suggestions`);
      return data.map(({ name }) => name);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getSystemSymptoms = createAsyncThunk('consultation/system-symptoms', async () =>
  fetchSystemSymptoms(),
);
