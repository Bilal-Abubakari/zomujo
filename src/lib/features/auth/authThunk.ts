import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { axiosErrorHandler } from '@/lib/axios';
import {
  resetAuthentication,
  setErrorMessage,
  setUserInfo,
  updateExtra,
  updateStatus,
} from '@/lib/features/auth/authSlice';
import {
  DoctorOnboarding,
  IDoctorPhotoUpload,
  ILogin,
  ILoginResponse,
  IOrganizationRequest,
  IResetPassword,
  IUpdatePassword,
  IUserSignUpRole,
} from '@/types/auth.interface';
import { ICustomResponse, IResponse } from '@/types/shared.interface';
import { RootState } from '@/lib/store';
import { IDoctor } from '@/types/doctor.interface';
import { generateSuccessToast } from '@/lib/utils';
import { Toast } from '@/hooks/use-toast';
import { Status } from '@/types/shared.enum';
import { ICheckout } from '@/types/payment.interface';

const authPath = 'auth/' as const;
const adminPath = 'admins/' as const;
export const login = createAsyncThunk(
  'authentication/login',
  async (loginCredentials: ILogin, { dispatch }) => {
    try {
      const { data } = await axios.post<IResponse<ILoginResponse>>(
        `${authPath}login`,
        loginCredentials,
      );
      dispatch(setUserInfo(data.data));
      return data.data;
    } catch (error) {
      dispatch(setErrorMessage(axiosErrorHandler(error)));
      return false;
    }
  },
);

export const doctorOnboarding = createAsyncThunk(
  'authentication/doctorOnboarding',
  async (doctorPhotoUpload: IDoctorPhotoUpload, { dispatch, getState }) => {
    const {
      authentication: { doctorIdentification, doctorPersonalDetails },
    } = getState() as RootState;
    if (!doctorPersonalDetails || !doctorIdentification) {
      return;
    }

    const doctorDetails: DoctorOnboarding = {
      ...doctorPersonalDetails,
      ...doctorIdentification,
      ...doctorPhotoUpload,
    };
    try {
      const { data } = await axios.patch<IResponse<IDoctor>>(
        `${authPath}complete-doctor-registration`,
        doctorDetails,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      dispatch(updateExtra(data.data));
      return true;
    } catch (error) {
      dispatch(setErrorMessage(axiosErrorHandler(error)));
      return false;
    }
  },
);

export const signUp = createAsyncThunk(
  'authentication/signUp',
  async (signUpCredentials: IUserSignUpRole, { dispatch }) => {
    try {
      const { data } = await axios.post<IResponse>(`${authPath}signUp`, signUpCredentials);
      return data.message;
    } catch (error) {
      dispatch(setErrorMessage(axiosErrorHandler(error)));
      return false;
    }
  },
);

export const requestOrganization = createAsyncThunk(
  'authentication/organizationsRequest',
  async (organizationCredentials: IOrganizationRequest, { dispatch }) => {
    try {
      const { data } = await axios.post<IResponse>(
        `${authPath}org-request`,
        organizationCredentials,
      );
      return data.message;
    } catch (error) {
      dispatch(setErrorMessage(axiosErrorHandler(error)));
      return false;
    }
  },
);

export const forgotPassword = createAsyncThunk(
  'authentication/forgotPassword',
  async (email: string, { dispatch }) => {
    try {
      const { data } = await axios.patch<IResponse>(`${authPath}forgot-password`, { email });
      return data.message;
    } catch (error) {
      dispatch(setErrorMessage(axiosErrorHandler(error)));
      return false;
    }
  },
);

export const resetPassword = createAsyncThunk(
  'authentication/resetPassword',
  async (passwordCredentials: IResetPassword, { dispatch }) => {
    try {
      const { data } = await axios.patch<IResponse>(
        `${authPath}renew-password`,
        passwordCredentials,
      );
      return data.message;
    } catch (error) {
      dispatch(setErrorMessage(axiosErrorHandler(error)));
      return false;
    }
  },
);

export const verifyEmail = createAsyncThunk(
  'authentication/verifyEmail',
  async (token: string, { dispatch }): Promise<ICustomResponse<ICheckout>> => {
    try {
      const {
        data: { data, message },
      } = await axios.post<IResponse<ILoginResponse>>(`${authPath}verify-email/${token}`);
      dispatch(setUserInfo(data));
      return {
        success: true,
        message,
        data: data.paystack,
      };
    } catch (error) {
      return {
        message: axiosErrorHandler(error) as string,
        success: false,
      };
    }
  },
);

export const updatePassword = createAsyncThunk(
  'authentication/updatePassword',
  async (passwordCredentials: IUpdatePassword, { dispatch }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse>(`${authPath}reset-password`, passwordCredentials);
      dispatch(updateStatus(Status.Verified));
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const deleteAccount = createAsyncThunk(
  'authentication/deleteAccount',
  async (): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.delete<IResponse>(`${authPath}delete-account`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

/**
 * @param id
 * Admin deactivates user based on their role so technically not the id from the user entity.
 * This is id from either Doctor, Patient or Admins entity
 */
export const deactivateUser = createAsyncThunk(
  'authentication/deactivateUser',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.delete<IResponse>(`${adminPath}deactivate-user/${id}`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

/**
 * @param id
 * Admin activates a deactivated user based on their role so technically not the id from the user entity.
 * This is id from either Doctor, Patient or Admins entity
 */
export const activateUser = createAsyncThunk(
  'authentication/activateUser',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse>(`${adminPath}activate-user/${id}`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const logout = createAsyncThunk(
  'authentication/logout',
  async (_, { dispatch }): Promise<void> => {
    const cleanUp = (): void => {
      dispatch(resetAuthentication());
      window.localStorage.clear();
    };
    try {
      await axios.delete(`${authPath}logout`);
      cleanUp();
    } catch {
      cleanUp();
    }
  },
);
