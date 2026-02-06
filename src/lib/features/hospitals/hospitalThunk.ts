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

/** Build FormData with correct field names for multer (image, images) */
function buildFormData(payload: Record<string, unknown>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;

    if (key === 'images' && Array.isArray(value)) {
      const files = value.filter((v): v is File => v instanceof File);
      for (const file of files) {
        formData.append('images', file, file.name);
      }
      continue;
    }
    if (key === 'image' && value instanceof File) {
      formData.append('image', value, value.name);
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        formData.append(key, String(item));
      }
      continue;
    }
    if (typeof value === 'boolean') {
      formData.append(key, String(value));
      continue;
    }
    if (typeof value === 'number' || typeof value === 'string') {
      formData.append(key, String(value));
      continue;
    }
  }

  return formData;
}

export const updateHospitalDetails = createAsyncThunk(
  'hospitals/updateHospitalDetails',
  async (hospitalProfile: Partial<IHospitalProfile>): Promise<Toast> => {
    try {
      const hasFiles =
        (Array.isArray(hospitalProfile.images) && hospitalProfile.images.some((v) => v instanceof File)) ||
        hospitalProfile.image instanceof File;

      const body = hasFiles ? buildFormData(hospitalProfile as Record<string, unknown>) : hospitalProfile;

      const { data } = await axios.patchForm<IResponse<IHospitalProfile>>('orgs', body);
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

// Fetch services for filtering
export const getServices = createAsyncThunk(
  'hospitals/getServices',
  async (): Promise<Array<{ id: string; name: string }> | Toast> => {
    try {
      const { data } = await axios.get<IResponse<Array<{ id: string; name: string; description?: string; category?: string }>>>('common/services');
      return data.data.map((service) => ({ id: service.id, name: service.name }));
    } catch (error) {
      // Try alternative endpoint
      try {
        const { data } = await axios.get<IResponse<Array<{ id: string; name: string }>>>('services');
        return data.data;
      } catch (err) {
        return axiosErrorHandler(error, true) as Toast;
      }
    }
  },
);

// Fetch departments for filtering
export const getDepartments = createAsyncThunk(
  'hospitals/getDepartments',
  async (): Promise<Array<{ id: string; name: string }> | Toast> => {
    try {
      const { data } = await axios.get<IResponse<Array<{ id: string; name: string }>>>('common/departments');
      return data.data;
    } catch (error) {
      // Try alternative endpoint
      try {
        const { data } = await axios.get<IResponse<Array<{ id: string; name: string }>>>('departments');
        return data.data;
      } catch (err) {
        return axiosErrorHandler(error, true) as Toast;
      }
    }
  },
);

// Fetch insurance companies for filtering
export const getInsuranceCompanies = createAsyncThunk(
  'hospitals/getInsuranceCompanies',
  async (): Promise<Array<{ id: string; name: string }> | Toast> => {
    try {
      const { data } = await axios.get<IResponse<Array<{ id: string; name: string; code?: string; logo?: string }>>>('common/insurance-companies');
      return data.data.map((company) => ({ id: company.id, name: company.name }));
    } catch (error) {
      // Try alternative endpoint
      try {
        const { data } = await axios.get<IResponse<Array<{ id: string; name: string }>>>('insurance-companies');
        return data.data;
      } catch (err) {
        return axiosErrorHandler(error, true) as Toast;
      }
    }
  },
);
