import { createAsyncThunk } from '@reduxjs/toolkit';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { Toast } from '@/hooks/use-toast';
import { generateSuccessToast, getValidQueryString } from '@/lib/utils';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { IHospitalAppointment } from '@/types/hospital-appointment.interface';

export const createHospitalAppointment = createAsyncThunk(
  'hospital-appointments/createHospitalAppointment',
  async (payload: {
    hospitalId: string;
    name: string;
    telephone: string;
    serviceType?: string;
    additionalInfo?: string;
    date: string;
  }): Promise<Toast | IHospitalAppointment> => {
    try {
      const { data } = await axios.post<IResponse<IHospitalAppointment>>(`hospitals/appointments`, payload);
      return generateSuccessToast('Appointment request submitted successfully');
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getHospitalAppointments = createAsyncThunk(
  'hospital-appointments/getHospitalAppointments',
  async (
    queryParams: IQueryParams<AppointmentStatus | ''>,
  ): Promise<Toast | IPagination<IHospitalAppointment>> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<IHospitalAppointment>>>(
        `hospitals/appointments?${getValidQueryString(queryParams)}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getHospitalAppointmentById = createAsyncThunk(
  'hospital-appointments/getHospitalAppointmentById',
  async (id: string): Promise<Toast | IHospitalAppointment> => {
    try {
      const { data } = await axios.get<IResponse<IHospitalAppointment>>(`hospitals/appointments/${id}`);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const updateHospitalAppointment = createAsyncThunk(
  'hospital-appointments/updateHospitalAppointment',
  async (payload: { id: string; reason?: string; additionalInfo?: string }): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse>(`hospitals/appointments/${payload.id}`, payload);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const acceptHospitalAppointment = createAsyncThunk(
  'hospital-appointments/acceptHospitalAppointment',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse>(`hospitals/appointments/${id}/accept`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const declineHospitalAppointment = createAsyncThunk(
  'hospital-appointments/declineHospitalAppointment',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.delete<IResponse>(`hospitals/appointments/${id}`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const assignDoctorToHospitalAppointment = createAsyncThunk(
  'hospital-appointments/assignDoctorToHospitalAppointment',
  async (payload: { appointmentId: string; doctorId: string }): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse>(`hospitals/appointments/${payload.appointmentId}/assign`, {
        appointmentId: payload.appointmentId,
        doctorId: payload.doctorId,
      });
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getHospitalAppointmentStats = createAsyncThunk(
  'hospital-appointments/getHospitalAppointmentStats',
  async (): Promise<Toast | { total: number; accepted: number; pending: number; cancelled: number }> => {
    try {
      const { data } = await axios.get<IResponse<{ total: number; accepted: number; pending: number; cancelled: number }>>(
        `hospitals/appointments/stats`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const reopenHospitalAppointment = createAsyncThunk(
  'hospital-appointments/reopenHospitalAppointment',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse>(`hospitals/appointments/${id}/reopen`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
