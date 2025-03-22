import React, { Dispatch, useEffect, useState } from 'react';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { PaginationData } from '@/components/ui/table';
import { showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';
import { AsyncThunk } from '@reduxjs/toolkit';
import { useAppDispatch } from '@/lib/hooks';
import { AcceptDeclineStatus } from '@/types/shared.enum';

export const useFetchPaginatedData = <
  T extends object,
  U extends string = AcceptDeclineStatus | '',
>(
  fetchAction: AsyncThunk<Toast | IPagination<T>, IQueryParams<U>, object>,
  initialQuery: IQueryParams<U> = {
    page: 1,
    orderDirection: 'desc',
    orderBy: 'createdAt',
    status: '' as U,
    search: '',
  },
): {
  tableData: T[];
  paginationData: PaginationData | undefined;
  isLoading: boolean;
  setTableData: (value: (<T>(prevState: T[]) => T[]) | T[]) => void;
  setPaginationData: (
    value:
      | ((prevState: PaginationData | undefined) => PaginationData | undefined)
      | PaginationData
      | undefined,
  ) => void;
  setIsLoading: (value: ((prevState: boolean) => boolean) | boolean) => void;
  setQueryParameters: Dispatch<React.SetStateAction<IQueryParams<U>>>;
  queryParameters: IQueryParams<U>;
  updatePage: (pageIndex: number) => void;
} => {
  const [tableData, setTableData] = useState<T[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [queryParameters, setQueryParameters] = useState<IQueryParams<U>>(initialQuery);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(fetchAction(queryParameters));

      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoading(false);
        return;
      }

      const { rows, ...pagination } = payload as IPagination<T>;

      setTableData(rows);
      setPaginationData(pagination);
      setIsLoading(false);
    };

    void fetchData();
  }, [queryParameters, fetchAction, dispatch]);

  const updatePage = (pageIndex: number): void => {
    setQueryParameters((prev) => ({
      ...prev,
      page: pageIndex + 1,
    }));
  };

  return {
    tableData,
    paginationData,
    isLoading,
    setTableData,
    setPaginationData,
    setIsLoading,
    setQueryParameters,
    queryParameters,
    updatePage,
  };
};
