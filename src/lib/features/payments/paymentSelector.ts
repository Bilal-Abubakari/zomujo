import { RootState } from '@/lib/store';
import { createSelector } from '@reduxjs/toolkit';
import { SelectOption } from '@/components/ui/select';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const selectPayments = ({ payments }: RootState) => payments;

export const selectBanks = createSelector(selectPayments, ({ banks }) => banks);

export const selectBankOptions = createSelector(selectBanks, (banks) =>
  banks.map(({ name, code }): SelectOption => ({ label: name, value: code })),
);
