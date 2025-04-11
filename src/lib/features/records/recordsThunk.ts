import { createAsyncThunk } from '@reduxjs/toolkit';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { generateSuccessToast, getValidQueryString, removeNullishValues } from '@/lib/utils';
import { Toast } from '@/hooks/use-toast';
import { ApproveDeclineStatus } from '@/types/shared.enum';
import { IRecordRequest } from '@/types/appointment.interface';
import { IPatient, IPatientDataCombined, IPatientWithRecord } from '@/types/patient.interface';
import {
  updatePatientRecord,
  updatePatientWithRecords,
} from '@/lib/features/patients/patientsSlice';

const recordsPath = 'records/';

export const sendRequest = createAsyncThunk(
  'records/send-request',
  async (id: string): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`${recordsPath}send-request/${id}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const requestStatus = createAsyncThunk(
  'records/request-status',
  async (id: string): Promise<Toast | ApproveDeclineStatus> => {
    try {
      const {
        data: { data },
      } = await axios.get<IResponse<ApproveDeclineStatus>>(`${recordsPath}request-status/${id}`);
      return data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getPatientRecords = createAsyncThunk(
  'records/patient',
  async (id: string, { dispatch }) => {
    try {
      const {
        data: { data },
      } = await axios.get<IResponse<IPatientWithRecord>>(`${recordsPath}${id}`);
      dispatch(updatePatientWithRecords(data));
      return data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const acceptRecordRequest = createAsyncThunk(
  'records/accept-request',
  async (id: string) => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse>(`${recordsPath}request-accept/${id}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const declineRecordRequest = createAsyncThunk(
  'records/decline-request',
  async (id: string) => {
    try {
      const {
        data: { message },
      } = await axios.delete<IResponse>(`${recordsPath}request-decline/${id}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getRecordRequests = createAsyncThunk(
  'records/requests',
  async (query: IQueryParams<'' | ApproveDeclineStatus>) => {
    try {
      const {
        data: { data },
      } = await axios.get<IResponse<IPagination<IRecordRequest>>>(
        `${recordsPath}requests?${getValidQueryString(query)}`,
      );
      return data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const updateRecord = createAsyncThunk(
  'record/update',
  async (data: Partial<IPatientDataCombined>, { dispatch }): Promise<Toast> => {
    try {
      const validData = removeNullishValues<Partial<IPatientDataCombined>>(data);
      const {
        data: { message },
      } = await axios.patch<IResponse<IPatient>>(`records`, validData);
      dispatch(updatePatientRecord(validData));
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
