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
  IPrescriptionRequest,
  IDiagnosisOnlyRequest,
  IDiagnosisUpdateRequest,
  IInternalReferralRequest,
} from '@/types/consultation.interface';
import { IAppointment, IPostInvestigationData } from '@/types/appointment.interface';
import {
  setAppointment,
  updateAppointmentNotes,
  updateAppointmentHistoryNotes,
  updateSymptoms,
  setIsAuthenticated,
  updatePostInvestigationData,
} from '@/lib/features/appointments/appointmentsSlice';
import { ILab, ILaboratoryRequestWithRecordId, IUploadLab } from '@/types/labs.interface';
import {
  IRadiology,
  IRadiologyRequestWithRecordId,
  IUploadRadiology,
} from '@/types/radiology.interface';

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

export const referPatient = createAsyncThunk(
  'consultation/refer-patient',
  async (referralData: IInternalReferralRequest): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>('common/refer-patient', referralData);
      return generateSuccessToast(message);
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
      } = await axios.put<IResponse>(`consultation/request-labs`, labRequests);

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
      } = await axios.put<IResponse>(`consultation/radiology-request`, radiologyRequests);
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

export const savePrescriptions = createAsyncThunk(
  'consultation/save-prescriptions',
  async (prescriptionRequest: IPrescriptionRequest): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`consultation/prescriptions`, prescriptionRequest);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const saveDiagnosis = createAsyncThunk(
  'consultation/save-diagnosis',
  async (diagnosisRequest: IDiagnosisOnlyRequest): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`consultation/diagnosis`, diagnosisRequest);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const deleteDiagnosis = createAsyncThunk(
  'consultation/delete-diagnosis',
  async (id: string): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.delete<IResponse>(`consultation/diagnosis/${id}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const generatePrescription = createAsyncThunk(
  'consultation/generate-prescription',
  async ({
    appointmentId,
    notes,
  }: {
    appointmentId: string;
    notes: string;
  }): Promise<Toast | string> => {
    try {
      const {
        data: { data },
      } = await axios.post<IResponse<string>>(`consultation/generate-prescription`, {
        appointmentId,
        notes,
      });
      return data;
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

export const authenticateConsultation = createAsyncThunk(
  'consultation/authenticate-consultation',
  async (
    { appointmentId, code }: { appointmentId: string; code: string },
    { dispatch },
  ): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.put<IResponse>(`consultation/authenticate`, {
        appointmentId,
        code,
      });
      dispatch(setIsAuthenticated(true));
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const endConsultation = createAsyncThunk(
  'consultation/end-consultation',
  async ({
    appointmentId,
    code,
    isInvestigating,
  }: {
    appointmentId: string;
    code?: string;
    isInvestigating?: boolean;
  }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse>('consultation/end', {
        appointmentId,
        code,
        isInvestigating,
      });
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
  async ({ file, id }: IUploadRadiology): Promise<Toast | string> => {
    try {
      const {
        data: { data },
      } = await axios.post<IResponse<string>>(
        `consultation/radiology-lab-file`,
        { id, labFile: file },
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

export const removeLabFile = createAsyncThunk(
  'consultation/remove-lab-file',
  async ({ labId, fileUrl }: { labId: string; fileUrl: string }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.delete<IResponse>(
        `consultation/remove-lab-file/${labId}?fileUrl=${encodeURIComponent(fileUrl)}`,
      );
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const removeRadiologyFile = createAsyncThunk(
  'consultation/remove-radiology-file',
  async ({ id, fileUrl }: { id: string; fileUrl: string }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.delete<IResponse>('consultation/radiology-lab-file', {
        data: { id, fileUrl },
      });
      return generateSuccessToast(message);
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
  'consultation/downloadRadiologyRequestPdf',
  async (appointmentId: string): Promise<Blob | Toast> => {
    try {
      const response = await axios.get(`consultation/download-radiology-pdf/${appointmentId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const deletePrescription = createAsyncThunk(
  'consultation/delete-prescription',
  async (id: string): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.delete<IResponse>(`consultation/prescription/${id}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const downloadReferralLetter = createAsyncThunk(
  'consultation/downloadReferralLetter',
  async ({
    appointmentId,
    referralId,
  }: {
    appointmentId: string;
    referralId: string;
  }): Promise<Blob | Toast> => {
    try {
      const response = await axios.get(
        `consultation/${appointmentId}/referral/${referralId}/download`,
        {
          responseType: 'blob',
        },
      );
      return response.data;
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

export const updateDiagnosis = createAsyncThunk(
  'consultation/update-diagnosis',
  async (updateRequest: IDiagnosisUpdateRequest): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.put<IResponse>(`consultation/diagnosis`, updateRequest);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const savePostInvestigationData = createAsyncThunk(
  'consultation/save-post-investigation-data',
  async (
    { appointmentId, data }: { appointmentId: string; data: IPostInvestigationData },
    { dispatch },
  ): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.put<IResponse>(`consultation/post-investigation-data`, {
        appointmentId,
        data: JSON.stringify(data),
      });
      dispatch(updatePostInvestigationData(data));
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
