import { createSlice } from '@reduxjs/toolkit';
import { downloadInvoiceReceipt, getInvoice } from '@/lib/features/invoices/invoicesThunk';

interface InvoicesState {
  isLoading: boolean;
  isDownloading: boolean;
}

const initialState: InvoicesState = {
  isLoading: false,
  isDownloading: false,
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInvoice.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(getInvoice.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(downloadInvoiceReceipt.pending, (state) => {
        state.isDownloading = true;
      })
      .addCase(downloadInvoiceReceipt.fulfilled, (state) => {
        state.isDownloading = false;
      })
      .addCase(downloadInvoiceReceipt.rejected, (state) => {
        state.isDownloading = false;
      });
  },
});

export default invoicesSlice.reducer;
