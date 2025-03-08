import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { generateSuccessToast } from '@/lib/utils';
import { IBank, IRate, PaymentDetails } from '@/types/payment.interface';
import { IResponse } from '@/types/shared.interface';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setError } from '@/lib/features/payments/paymentSlice';

export const addPaymentsDetails = createAsyncThunk(
  'payment/addingPayments',
  async (paymentInfo: PaymentDetails): Promise<Toast> => {
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
  async (userId: string): Promise<PaymentDetails[] | Toast> => {
    try {
      const { data } = await axios.get<IResponse<PaymentDetails[]>>(`payments/methods/${userId}`);
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
      } = await axios.patch<IResponse<IRate>>('doctors/set-rate', rate);
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

//Todo: make adjustment when the backend changes.
export const initiatePayment = createAsyncThunk(
  'payment/initiatePayment',
  async ({ amount, doctorId }: { amount: number; doctorId: string }): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.get<IResponse>(`payments/initialize?amount=${amount}&doctorId=${doctorId}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
