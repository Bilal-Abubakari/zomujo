'use client';

import { JSX } from 'react';
import TransactionsTab from '@/app/dashboard/(admin)/payment-history/_components/transactionsTab';
import PaymentsTab from '@/app/dashboard/(admin)/payment-history/_components/paymentsTab';
import { useAppSelector } from '@/lib/hooks';
import { selectIsPatient } from '@/lib/features/auth/authSelector';

const TransactionsPage = (): JSX.Element => {
  const isPatient = useAppSelector(selectIsPatient);

  return (
    <div className="pb-20">
      <div className="mb-6 flex flex-col">
        <span className="text-[32px] font-bold">
          {isPatient ? 'Payment History' : 'Transaction History'}
        </span>
        <span className="text-grayscale-500 text-sm">View and track all your transactions</span>
      </div>
      {isPatient ? <PaymentsTab /> : <TransactionsTab />}
    </div>
  );
};

export default TransactionsPage;
