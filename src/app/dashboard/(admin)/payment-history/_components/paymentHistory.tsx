'use client';

import { JSX } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Banknote, CreditCard, TrendingUp } from 'lucide-react';
import TransactionsTab from './transactionsTab';
import CashFlowTab from './cashFlowTab';
import PaymentsTab from './paymentsTab';

const PaymentHistory = (): JSX.Element => (
  <div className="pb-20">
    <div className="mb-6 flex flex-col">
      <span className="text-[32px] font-bold">Payment History</span>
      <span className="text-grayscale-500 text-sm">
        Monitor all financial transactions and platform cash flow
      </span>
    </div>

    <Tabs defaultValue="payments">
      <TabsList className="mb-4 h-auto gap-1 bg-transparent p-0">
        <TabsTrigger
          value="payments"
          className="data-[state=active]:border-primary data-[state=active]:bg-primary/5 flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium"
        >
          <CreditCard size={16} />
          Payments
        </TabsTrigger>
        <TabsTrigger
          value="transactions"
          className="data-[state=active]:border-primary data-[state=active]:bg-primary/5 flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium"
        >
          <Banknote size={16} />
          Transactions
        </TabsTrigger>
        <TabsTrigger
          value="cash-flow"
          className="data-[state=active]:border-primary data-[state=active]:bg-primary/5 flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium"
        >
          <TrendingUp size={16} />
          Cash Flow
        </TabsTrigger>
      </TabsList>

      <TabsContent value="payments">
        <PaymentsTab />
      </TabsContent>

      <TabsContent value="transactions">
        <TransactionsTab />
      </TabsContent>

      <TabsContent value="cash-flow">
        <CashFlowTab />
      </TabsContent>
    </Tabs>
  </div>
);

export default PaymentHistory;
