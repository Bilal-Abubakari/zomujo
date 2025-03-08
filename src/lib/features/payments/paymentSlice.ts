import { IBank } from '@/types/payment.interface';
import { createSlice } from '@reduxjs/toolkit';
import { getBanks } from '@/lib/features/payments/paymentsThunk';

interface PaymentState {
  banks: IBank[];
  isLoadingBanks: boolean;
  errorMessage: string;
}

const initialState: PaymentState = {
  banks: [],
  isLoadingBanks: false,
  errorMessage: '',
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
      });
  },
});

export const { setError } = paymentSlice.actions;

export default paymentSlice.reducer;
