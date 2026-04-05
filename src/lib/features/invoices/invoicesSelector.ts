import { RootState } from '@/lib/store';

export const selectInvoicesLoading = (state: RootState): boolean => state.invoices.isLoading;
export const selectInvoicesDownloading = (state: RootState): boolean =>
  state.invoices.isDownloading;
