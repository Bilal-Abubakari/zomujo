import { createAsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';
import { axiosErrorHandler, axiosFornix } from '@/lib/axios';
import { IResponse } from '@/types/shared.interface';
import { IVoiceSummaryResponse } from '@/types/ai.interface';

export const generateVoiceSummary = createAsyncThunk(
  'ai/generate-voice-summary',
  async (file: File): Promise<Toast | IVoiceSummaryResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axiosFornix.post<IResponse<IVoiceSummaryResponse>>(
        '/external/diagnosis/summary/voice',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
