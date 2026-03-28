import { JSX } from 'react';
import TransactionsTab from '@/app/dashboard/(admin)/payment-history/_components/transactionsTab';

const TransactionsPage = (): JSX.Element => (
  <div className="pb-20">
    <div className="mb-6 flex flex-col">
      <span className="text-[32px] font-bold">Transaction History</span>
      <span className="text-grayscale-500 text-sm">View and track all your transactions</span>
    </div>
    <TransactionsTab />
  </div>
);

export default TransactionsPage;
