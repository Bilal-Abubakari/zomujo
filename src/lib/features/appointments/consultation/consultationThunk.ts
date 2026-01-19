import { createAsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { IResponse } from '@/types/shared.interface';
import { fetchSystemSymptoms } from './fetchSystemSymptoms';
import { generateSuccessToast } from '@/lib/utils';
import {
  IConsultationDetails,
  IConsultationSymptoms,
  IDiagnosisRequest,
} from '@/types/consultation.interface';
import { IAppointment } from '@/types/appointment.interface';
import {
  setAppointment,
  updateAppointmentNotes,
  updateAppointmentHistoryNotes,
  updateSymptoms,
} from '@/lib/features/appointments/appointmentsSlice';
import { ILab, ILaboratoryRequestWithRecordId, IUploadLab } from '@/types/labs.interface';
import { IRadiology, IRadiologyRequestWithRecordId } from '@/types/radiology.interface';

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

export const getConsultationLabs = createAsyncThunk(
  'consultation/get-consultation-appointment',
  async (id: string): Promise<Toast | ILab[]> => {
    try {
      const {
        data: { data },
      } = await axios.get<IResponse<ILab[]>>(`consultation/labs?appointmentId=${id}`);
      return data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getConsultationRadiology = createAsyncThunk(
  'consultation/get-consultation-radiology',
  async (id: string): Promise<Toast | IRadiology[]> => {
    try {
      const {
        data: { data },
      } = await axios.get<IResponse<IRadiology[]>>(
        `consultation/radiology-labs?appointmentId=${id}`,
      );
      return data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getConsultationDetail = createAsyncThunk(
  'consultation/get-consultation-appointment',
  async (id: string): Promise<Toast | IConsultationDetails> => {
    try {
      const {
        data: { data },
      } = await axios.get<IResponse<IConsultationDetails>>(`consultation/details/${id}`);
      return data;
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

export const addRadiologyRequests = createAsyncThunk(
  'consultation/radiology-request',
  async (radiologyRequests: IRadiologyRequestWithRecordId): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`consultation/radiology-request`, radiologyRequests);
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

export const generatePrescription = createAsyncThunk(
  'consultation/generate-prescription',
  async ({ appointmentId, notes }: { appointmentId: string; notes: string }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`consultation/generate-prescription`, {
        appointmentId,
        notes,
      });
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const startConsultation = createAsyncThunk(
  'consultation/start-consultation',
  async (id: string): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse>(`consultation/start/${id}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const endConsultation = createAsyncThunk(
  'consultation/end-consultation',
  async (id: string): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse>(`consultation/end/${id}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const addLabFile = createAsyncThunk(
  'consultation/add-lab-file',
  async ({ file, labId }: IUploadLab): Promise<Toast | string> => {
    try {
      const {
        data: { data },
      } = await axios.post<IResponse<string>>(
        `consultation/add-lab-file/${labId}`,
        { file },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const addRadiologyFile = createAsyncThunk(
  'consultation/add-radiology-file',
  async ({
    file,
    radiologyId,
    testName,
  }: {
    file: File;
    radiologyId: string;
    testName: string;
  }): Promise<Toast | string> => {
    try {
      const {
        data: { data },
      } = await axios.post<IResponse<string>>(
        `consultation/radiology-lab-file`,
        { labFile: file, testName, id: radiologyId },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const joinConsultation = createAsyncThunk(
  'consultation/join-consultation',
  async (appointmentId: string): Promise<Toast | string> => {
    try {
      const {
        data: { data },
      } = await axios.get<IResponse<string>>(`consultation/join/${appointmentId}`);
      return data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const saveConsultationSummary = createAsyncThunk(
  'consultation/save-summary',
  async ({
    appointmentId,
    summary,
  }: {
    appointmentId: string;
    summary: string;
  }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`consultation/save-summary`, { appointmentId, summary });
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const downloadLabRequestPdf = createAsyncThunk(
  'consultation/download-lab-pdf',
  async (consultationId: string): Promise<Toast | Blob> => {
    try {
      const { data } = await axios.get<Blob>(`consultation/download-lab-pdf/${consultationId}`, {
        responseType: 'blob',
      });
      return data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const downloadRadiologyRequestPdf = createAsyncThunk(
  'consultation/download-radiology-pdf',
  async (consultationId: string): Promise<Toast | Blob> => {
    try {
      const { data } = await axios.get<Blob>(
        `consultation/download-radiology-pdf/${consultationId}`,
        {
          responseType: 'blob',
        },
      );
      return data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const updateNotes = createAsyncThunk(
  'consultation/update-notes',
  async (
    { appointmentId, notes }: { appointmentId: string; notes: string },
    { dispatch },
  ): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.put<IResponse>(`consultation/update-notes`, {
        appointmentId,
        notes,
      });
      dispatch(updateAppointmentNotes(notes));
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const updateHistoryNotes = createAsyncThunk(
  'consultation/update-history-notes',
  async (
    { appointmentId, notes }: { appointmentId: string; notes: string },
    { dispatch },
  ): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.put<IResponse>(`consultation/update-history-notes`, {
        appointmentId,
        notes,
      });
      dispatch(updateAppointmentHistoryNotes(notes));
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
