import { IBank, IPendingPayment } from '@/types/payment.interface';
import { createSlice } from '@reduxjs/toolkit';
import { getBanks, getPendingPayments } from '@/lib/features/payments/paymentsThunk';

interface PaymentState {
  banks: IBank[];
  isLoadingBanks: boolean;
  errorMessage: string;
  pendingPayments: IPendingPayment[];
  isLoadingPendingPayments: boolean;
}

const initialState: PaymentState = {
  banks: [],
  isLoadingBanks: false,
  errorMessage: '',
  pendingPayments: [],
  isLoadingPendingPayments: false,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setError: (state, { payload }) => {
      state.errorMessage = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBanks.pending, (state) => {
        state.isLoadingBanks = true;
      })
      .addCase(getBanks.fulfilled, (state, { payload }) => {
        state.isLoadingBanks = false;
        if (Array.isArray(payload)) {
          state.banks = payload;
        }
      })
      .addCase(getBanks.rejected, (state) => {
        state.isLoadingBanks = false;
      })
      .addCase(getPendingPayments.pending, (state) => {
        state.isLoadingPendingPayments = true;
      })
      .addCase(getPendingPayments.fulfilled, (state, { payload }) => {
        state.isLoadingPendingPayments = false;
        if (Array.isArray(payload)) {
          state.pendingPayments = payload;
        }
      })
      .addCase(getPendingPayments.rejected, (state) => {
        state.isLoadingPendingPayments = false;
      });
  },
});

export const { setError } = paymentSlice.actions;

export default paymentSlice.reducer;
