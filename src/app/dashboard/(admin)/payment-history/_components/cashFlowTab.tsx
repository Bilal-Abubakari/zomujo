'use client';

import { JSX, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getCashFlow } from '@/lib/features/payments/paymentsThunk';
import type { ICashFlow } from '@/types/payment.interface';
import { PESEWAS_PER_CEDI } from '@/constants/payment.constants';
import { Banknote, CreditCard, LayoutGrid, Receipt, Stethoscope, User } from 'lucide-react';

interface CashFlowCardItem {
  title: string;
  key: keyof ICashFlow;
  icon: JSX.Element;
  description: string;
  colorClass: string;
  iconBgClass: string;
}

const cashFlowItems: CashFlowCardItem[] = [
  {
    title: 'Total Revenue',
    key: 'total',
    icon: <Banknote size={22} />,
    description: 'Gross revenue collected across all transactions',
    colorClass: 'text-primary',
    iconBgClass: 'bg-primary/10',
  },
  {
    title: 'Doctor Earnings',
    key: 'doctor',
    icon: <Stethoscope size={22} />,
    description: 'Total paid out to doctors',
    colorClass: 'text-blue-600',
    iconBgClass: 'bg-blue-50',
  },
  {
    title: 'Patient Charges',
    key: 'patient',
    icon: <User size={22} />,
    description: 'Total charged to patients',
    colorClass: 'text-violet-600',
    iconBgClass: 'bg-violet-50',
  },
  {
    title: 'Tax Collected',
    key: 'tax',
    icon: <Receipt size={22} />,
    description: 'Government taxes collected',
    colorClass: 'text-amber-600',
    iconBgClass: 'bg-amber-50',
  },
  {
    title: 'Processing Fees',
    key: 'fees',
    icon: <CreditCard size={22} />,
    description: 'Paystack and gateway processing fees',
    colorClass: 'text-rose-600',
    iconBgClass: 'bg-rose-50',
  },
  {
    title: 'Platform Revenue',
    key: 'platform',
    icon: <LayoutGrid size={22} />,
    description: 'Net revenue retained by the platform',
    colorClass: 'text-emerald-600',
    iconBgClass: 'bg-emerald-50',
  },
];

const formatCurrency = (amount: number): string => {
  const inCedis = amount / PESEWAS_PER_CEDI;
  return `GHS ${inCedis.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const CashFlowTab = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [cashFlow, setCashFlow] = useState<ICashFlow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCashFlow = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getCashFlow());
      setIsLoading(false);

      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }

      setCashFlow(payload as ICashFlow);
    };

    void fetchCashFlow();
  }, [dispatch]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Platform Cash Flow Summary</h2>
        <p className="text-sm text-gray-500">
          A breakdown of all financial flows across the platform
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cashFlowItems.map(({ title, key, icon, description, colorClass, iconBgClass }) => (
          <Card key={title} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                <div className={`rounded-full p-2 ${iconBgClass} ${colorClass}`}>{icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                <p className={`text-2xl font-bold ${colorClass}`}>
                  {cashFlow ? formatCurrency(cashFlow[key]) : '—'}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CashFlowTab;
