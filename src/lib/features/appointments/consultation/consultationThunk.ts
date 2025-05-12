import { createAsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { IResponse } from '@/types/shared.interface';
import { fetchSystemSymptoms } from './fetchSystemSymptoms';
import { generateSuccessToast } from '@/lib/utils';
import { IConsultationSymptoms, IDiagnosisRequest } from '@/types/consultation.interface';
import { IAppointment } from '@/types/appointment.interface';
import { setAppointment, updateSymptoms } from '@/lib/features/appointments/appointmentsSlice';
import { ILaboratoryRequestWithRecordId } from '@/types/labs.interface';

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

export const addConsultationSymptom = createAsyncThunk(
  'consultation/add-consultation-symptom',
  async (consultationSymptoms: IConsultationSymptoms, { dispatch }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.put<IResponse>(`consultation/save-symptoms`, consultationSymptoms);
      dispatch(updateSymptoms(consultationSymptoms));
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getConsultationAppointment = createAsyncThunk(
  'consultation/get-consultation-appointment',
  async (id: string, { dispatch }): Promise<Toast> => {
    try {
      const {
        data: { message, data },
      } = await axios.get<IResponse<IAppointment>>(`appointments/${id}`);
      dispatch(setAppointment(data));
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const addLabRequests = createAsyncThunk(
  'consultation/lab-request',
  async (labRequests: ILaboratoryRequestWithRecordId): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`consultation/request-labs`, labRequests);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const addDiagnosisAndPrescription = createAsyncThunk(
  'consultation/add-diagnosis-prescription',
  async (diagnosisRequest: IDiagnosisRequest): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`consultation/add-diagnosis`, diagnosisRequest);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
