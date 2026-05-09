'use client';

import { JSX, SyntheticEvent, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OptionsMenu } from '@/components/ui/dropdown-menu';
import { TableData, PaginationData } from '@/components/ui/table';
import { Search, SendHorizontal, ListFilter, Radio, SlidersHorizontal } from 'lucide-react';
import { OrderDirection, PaymentChannel, PaymentStatus } from '@/types/shared.enum';
import { IPayment, IPaymentQueryParams } from '@/types/payment.interface';
import { useAppDispatch } from '@/lib/hooks';
import { IPagination } from '@/types/shared.interface';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useSearch } from '@/hooks/useSearch';
import { getPayments } from '@/lib/features/payments/paymentsThunk';
import { paymentChannelOptions, paymentStatusOptions } from '@/constants/constants';
import { paymentColumns } from './paymentColumns';

const DEFAULT_QUERY: IPaymentQueryParams = {
  page: 1,
  pageSize: 10,
  orderDirection: OrderDirection.Descending,
  orderBy: 'createdAt',
  status: '' as PaymentStatus | '',
  channel: '' as PaymentChannel | '',
  search: '',
  amountMin: '',
  amountMax: '',
  from: '',
  to: '',
};

const PaymentsTab = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [tableData, setTableData] = useState<IPayment[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState<IPaymentQueryParams>(DEFAULT_QUERY);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getPayments(query));
      setIsLoading(false);

      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }

      const { rows, ...pagination } = payload as IPagination<IPayment>;
      setTableData(rows);
      setPaginationData(pagination);
    };

    void fetchData();
  }, [query, dispatch]);

  const updateQuery = (updates: Partial<IPaymentQueryParams>): void => {
    setQuery((prev) => ({ ...prev, page: 1, ...updates }));
  };

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>, search?: string): void {
    event.preventDefault();
    updateQuery({ search: search ?? searchTerm });
  }

  const { searchTerm, handleSearch } = useSearch(handleSubmit);

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Patient Payments</h2>
          <p className="text-sm text-gray-500">
            All payments received from patients — the initial charge before it is split into
            platform fees, doctor earnings, and taxes.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <form className="flex" onSubmit={handleSubmit}>
            <Input
              error=""
              placeholder="Search by reference or patient..."
              className="sm:w-70"
              type="search"
              leftIcon={<Search className="text-gray-500" size={18} />}
              onChange={handleSearch}
            />
            {searchTerm && <Button child={<SendHorizontal />} className="ml-2" />}
          </form>

          {/* Status filter */}
          <OptionsMenu
            options={paymentStatusOptions}
            Icon={ListFilter}
            menuTrigger="Status"
            selected={query.status ?? ''}
            setSelected={(value) => updateQuery({ status: value as PaymentStatus | '' })}
            className="h-10 cursor-pointer bg-gray-50"
          />

          {/* Channel filter */}
          <OptionsMenu
            options={paymentChannelOptions}
            Icon={Radio}
            menuTrigger="Channel"
            selected={query.channel ?? ''}
            setSelected={(value) => updateQuery({ channel: value as PaymentChannel | '' })}
            className="h-10 cursor-pointer bg-gray-50"
          />

          {/* Amount range */}
          <div className="flex items-center gap-1">
            <SlidersHorizontal size={16} className="text-gray-500" />
            <Input
              error=""
              placeholder="Min (GHS)"
              type="number"
              className="w-28"
              defaultMaxWidth={false}
              value={query.amountMin ?? ''}
              onChange={(e) => updateQuery({ amountMin: e.target.value || undefined })}
            />
            <span className="text-gray-400">–</span>
            <Input
              error=""
              placeholder="Max (GHS)"
              type="number"
              className="w-28"
              defaultMaxWidth={false}
              value={query.amountMax ?? ''}
              onChange={(e) => updateQuery({ amountMax: e.target.value || undefined })}
            />
          </div>

          {/* Date range */}
          <div className="mb-5 flex gap-1">
            <Input
              error=""
              labelName="From"
              labelClassName="text-xs text-gray-500 mb-0"
              type="date"
              className="w-36"
              defaultMaxWidth={false}
              wrapperClassName="gap-1"
              value={query.from ?? ''}
              onChange={(e) => updateQuery({ from: e.target.value || undefined })}
            />
            <Input
              error=""
              labelName="To"
              labelClassName="text-xs text-gray-500 mb-0"
              type="date"
              className="w-36"
              defaultMaxWidth={false}
              wrapperClassName="gap-1"
              value={query.to ?? ''}
              onChange={(e) => updateQuery({ to: e.target.value || undefined })}
            />
          </div>
        </div>

        {/* Table */}
        <TableData
          columns={paymentColumns}
          data={tableData}
          page={query.page}
          userPaginationChange={({ pageIndex }) =>
            setQuery((prev) => ({ ...prev, page: pageIndex + 1 }))
          }
          paginationData={paginationData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default PaymentsTab;
