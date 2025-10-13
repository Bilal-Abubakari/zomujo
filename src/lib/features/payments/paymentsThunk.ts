import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { generateSuccessToast } from '@/lib/utils';
import {
  IBank,
  ICheckout,
  IRate,
  IPaymentDetails,
  ICreatePaymentDetails,
} from '@/types/payment.interface';
import { IResponse } from '@/types/shared.interface';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setError } from '@/lib/features/payments/paymentSlice';
import { IInitializeAppointment } from '@/types/booking.interface';
import { updateExtra } from '@/lib/features/auth/authSlice';

export const addPaymentsDetails = createAsyncThunk(
  'payment/addingPayments',
  async (paymentInfo: ICreatePaymentDetails, { dispatch }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`payments/methods`, paymentInfo);
      dispatch(
        updateExtra({
          hasDefaultPayment: true,
        }),
      );
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const updatePaymentsDetails = createAsyncThunk(
  'payment/updatePaymentDetails',
  async (paymentInfo: IPaymentDetails): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse>(`payments/methods`, paymentInfo);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const deletePaymentDetails = createAsyncThunk(
  'payment/deletePaymentDetails',
  async (id: string): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.delete<IResponse>(`payments/methods/${id}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getPaymentDetails = createAsyncThunk(
  'payment/getPaymentDetails',
  async (userId: string): Promise<IPaymentDetails[] | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IPaymentDetails[]>>(`payments/methods/${userId}`);

      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const setPaymentRate = createAsyncThunk(
  'payment/setPaymentRate',
  async (rate: IRate, { dispatch }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse<IRate>>('doctors/set-fee', rate);
      dispatch(
        updateExtra({
          fee: rate,
        }),
      );
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getBanks = createAsyncThunk(
  'payment/getBanks',
  async (_, { dispatch }): Promise<boolean | IBank[]> => {
    try {
      const {
        data: { data },
      } = await axios.get<IResponse<{ data: IBank[] }>>('payments/banks?perPage=100');
      return data.data;
    } catch (error) {
      dispatch(setError(axiosErrorHandler(error)));
      return false;
    }
  },
);

export const initiatePayment = createAsyncThunk(
  'payment/initiatePayment',
  async (initializeAppointment: IInitializeAppointment): Promise<Toast | ICheckout> => {
    try {
      const { data } = await axios.post<IResponse<ICheckout>>(
        `payments/initialize`,
        initializeAppointment,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const verifyPayment = createAsyncThunk('payment/verification', async (reference: string) => {
  try {
    const {
      data: { message },
    } = await axios.get<IResponse>(`payments/verify/${reference}`);
    return {
      success: true,
      message,
    };
  } catch (error) {
    return {
      message: axiosErrorHandler(error),
      success: false,
    };
  }
});

export const updateOrganizationsDetails = createAsyncThunk(
  'organization/updateProfile',
  async (regularFee: number): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patchForm<IResponse>(`orgs`, { regularFee });
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
