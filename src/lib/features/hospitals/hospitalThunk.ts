import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import {
  IHospital,
  IHospitalProfile,
  INearByQueryParams,
  IHospitalListItem,
  IHospitalDetail,
} from '@/types/hospital.interface';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { Toast } from '@/hooks/use-toast';
import { generateSuccessToast, getValidQueryString } from '@/lib/utils';

export const getHospitals = createAsyncThunk(
  'hospitals/getHospitals',
  async ({ page, search, status, pageSize }: IQueryParams<AcceptDeclineStatus | ''>) => {
    // Endpoint does not accept empty status
    const query = status ? `&status=${status}` : '';
    try {
      const { data } = await axios.get<IResponse<IPagination<IHospital>>>(
        `common/orgs?page=${page}&search=${search}&pageSize=${pageSize}${query}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getHospital = createAsyncThunk(
  'hospitals/getHospital',
  async (id: string): Promise<Toast | IHospital> => {
    try {
      const { data } = await axios.get<IResponse<IHospital>>(`orgs/${id}`);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getNearByHospitals = createAsyncThunk(
  'hospitals/getNearByHospitals',
  async ({ long, lat, radius }: INearByQueryParams) => {
    try {
      const { data } = await axios.get<IResponse<IHospital>>(
        `orgs/nearby?lat=${lat}&long=${long}&radius=${radius}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const updateHospitalDetails = createAsyncThunk(
  'hospitals/updateHospitalDetails',
  async (hospitalProfile: Partial<IHospitalProfile>): Promise<Toast> => {
    try {
      const { data } = await axios.patchForm<IResponse<IHospitalProfile>>(
        'admins/update-org',
        hospitalProfile,
      );
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

// New hospital API thunks for the new hospital model
export const getAllHospitals = createAsyncThunk(
  'hospitals/allHospitals',
  async ({
    pageSize,
    ...rest
  }: IQueryParams<AcceptDeclineStatus | ''> & {
    city?: string;
    organizationType?: string;
    hasEmergency?: boolean;
    telemedicine?: boolean;
    serviceId?: string;
    departmentId?: string;
    insuranceCompanyId?: string;
    languages?: string[];
    isActive?: boolean;
  }): Promise<IPagination<IHospitalListItem> | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<IHospitalListItem>>>(
        `hospitals?${getValidQueryString(rest)}&pageSize=${pageSize || 10}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getHospitalBySlug = createAsyncThunk(
  'hospitals/getHospitalBySlug',
  async (slug: string): Promise<IHospitalDetail | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IHospitalDetail>>(`hospitals/${slug}`);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
