import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { generateSuccessToast } from '@/lib/utils';
import { IBank, ICheckout, IRate, IPaymentDetails } from '@/types/payment.interface';
import { IResponse } from '@/types/shared.interface';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setError } from '@/lib/features/payments/paymentSlice';
import { IInitializeAppointment } from '@/types/booking.interface';

export const addPaymentsDetails = createAsyncThunk(
  'payment/addingPayments',
  async (paymentInfo: IPaymentDetails): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`payments/methods`, paymentInfo);
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
  async (rate: IRate): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse<IRate>>('doctors/set-fee', rate);
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
