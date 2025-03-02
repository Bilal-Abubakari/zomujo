import React, { useState, Dispatch } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { Toast, toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { AsyncThunk } from '@reduxjs/toolkit';
import { ConfirmationProps } from '@/components/ui/dialog';
import { IQueryParams } from '@/types/shared.interface';

interface UseDropdownActionProps<T> {
  setConfirmation: Dispatch<React.SetStateAction<ConfirmationProps>>;
  setQueryParameters?: Dispatch<React.SetStateAction<IQueryParams<T>>>;
}

export const useDropdownAction = <T extends string>({
  setConfirmation,
  setQueryParameters,
}: UseDropdownActionProps<T>): {
  handleDropdownAction: <U extends { id: string }>(
    actionThunks: AsyncThunk<Toast, string, object>,
    id: string,
    data?: U[],
    setTableData?: Dispatch<React.SetStateAction<U[]>>,
    removeItem?: boolean,
  ) => Promise<void>;
  isConfirmationLoading: boolean;
} => {
  const [isConfirmationLoading, setIsConfirmationLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleDropdownAction = async <U extends { id: string }>(
    actionThunks: AsyncThunk<Toast, string, object>,
    id: string,
    data?: U[],
    setTableData?: Dispatch<React.SetStateAction<U[]>>,
    removeItem = false,
  ): Promise<void> => {
    setIsConfirmationLoading(true);

    const handleAction = async (actionThunk: AsyncThunk<Toast, string, object>): Promise<void> => {
      const { payload } = await dispatch(actionThunk(id));
      if (payload) {
        toast(payload);
      }
      if (!showErrorToast(payload)) {
        setConfirmation((prev) => ({
          ...prev,
          open: false,
        }));
        if (setQueryParameters) {
          setQueryParameters((prev) => ({
            ...prev,
            page: 1,
          }));
        }

        if (data && setTableData && removeItem) {
          const updatedData = data.filter((item) => item.id !== id);
          setTableData(updatedData);
        }
      }
    };

    await handleAction(actionThunks);

    setIsConfirmationLoading(false);
  };

  return { handleDropdownAction, isConfirmationLoading };
};
