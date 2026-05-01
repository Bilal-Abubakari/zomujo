import { RootState } from '@/lib/store';
import { createSelector } from '@reduxjs/toolkit';
import { SelectOption } from '@/components/ui/select';
import { IBank, IPendingPayment } from '@/types/payment.interface';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const selectPayments = ({ payments }: RootState) => payments;

export const selectBanks = createSelector(selectPayments, ({ banks }) => banks);

export const selectBankAccounts = createSelector(selectBanks, (banks) =>
  deduplicateByCode(banks.filter(({ type }) => type === 'ghipss')),
);

export const selectMobileMoneyAccounts = createSelector(selectBanks, (banks) =>
  deduplicateByCode(banks.filter(({ type }) => type === 'mobile_money')),
);

export const selectBankOptions = createSelector(selectBankAccounts, (banks) =>
  banks.map(({ name, code }): SelectOption => ({ label: name, value: code })),
);

export const selectMobileMoneyOptions = createSelector(selectMobileMoneyAccounts, (banks) =>
  banks.map(
    ({ name, code }): SelectOption => ({
      label: name === 'Vodafone' ? 'Telecel' : name,
      value: code,
    }),
  ),
);

export const selectPendingPayments = createSelector(
  selectPayments,
  ({ pendingPayments }) => pendingPayments,
);

export const selectIsLoadingPendingPayments = createSelector(
  selectPayments,
  ({ isLoadingPendingPayments }) => isLoadingPendingPayments,
);

export const selectMostRecentPendingPayment = createSelector(
  selectPendingPayments,
  (pendingPayments): IPendingPayment | undefined => pendingPayments[0],
);

const deduplicateByCode = (banks: IBank[]): IBank[] => {
  const bankMap = new Map<string, IBank>();
  banks.forEach((bank) => {
    if (!bankMap.has(bank.code)) {
      bankMap.set(bank.code, bank);
    }
  });
  return Array.from(bankMap.values());
};
