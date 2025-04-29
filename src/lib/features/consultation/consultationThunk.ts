import { createAsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { IResponse } from '@/types/shared.interface';
import { fetchSystemSymptoms } from './fetchSystemSymptoms';

export const getComplaintSuggestions = createAsyncThunk(
  'consultation/complaint-suggestions',
  async (): Promise<Toast | string[]> => {
    try {
      await axios.get<IResponse<string[]>>(`consultation/complaint-suggestions`);
      // TODO: Remove as as soon backend seed is added
      return [
        'Headache',
        'Stomach pain',
        'Cold/Flu',
        'Rash',
        'Depression',
        'Sore throat',
        'Heartburn',
        'Diarrhea',
        'Insomnia',
        'Fatigue',
        'Cough',
        'Fever',
        'Back pain',
        'Chest pain',
        'Shortness of breath',
        'Nausea',
        'Vomiting',
        'Dizziness',
        'Joint pain',
        'Constipation',
        'Runny nose',
        'Muscle aches',
        'Loss of appetite',
        'Swelling',
        'Urinary issues',
        'Menstrual irregularities',
        'Itching',
      ];
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getSystemSymptoms = createAsyncThunk('consultation/system-symptoms', async () =>
  fetchSystemSymptoms(),
);
