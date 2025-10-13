'use client';

import React, { JSX, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PaymentInfo from '../_components/transactions/paymentInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wallet from '../_components/transactions/wallet';
import Pricing from '../_components/transactions/pricing';
import { PaymentTab } from '@/hooks/useQueryParam';

const Payment = (): JSX.Element => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = searchParams.get('tab') as PaymentTab | null;

  const validTabs = Object.values(PaymentTab);
  const activeTab = useMemo(
    () => (tab && validTabs.includes(tab) ? tab : PaymentTab.PaymentMethod),
    [tab],
  );

  const handleTabChange = (value: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold">Payment</h2>
        <p className="text-gray-500"> Monitor your payment transactions efficiently.</p>
        <hr className="my-7 gap-4" />
      </div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="">
        <TabsList>
          <TabsTrigger value={PaymentTab.PaymentMethod} className="rounded-2xl">
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value={PaymentTab.Wallet} className="rounded-2xl">
            Wallet
          </TabsTrigger>
          <TabsTrigger value={PaymentTab.Pricing} className="rounded-2xl">
            Pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6" value={PaymentTab.PaymentMethod}>
          <PaymentInfo />
        </TabsContent>
        <TabsContent className="mt-6" value={PaymentTab.Wallet}>
          <Wallet />
        </TabsContent>
        <TabsContent className="mt-6" value={PaymentTab.Pricing}>
          <Pricing />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payment;
