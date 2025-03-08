'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Confirmation, ConfirmationProps } from '@/components/ui/dialog';
import {
  DropdownMenuContent,
  OptionsMenu,
  DropdownMenu,
  DropdownMenuTrigger,
  ISelected,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { PaginationData, TableData } from '@/components/ui/table';
import { useAppDispatch } from '@/lib/hooks';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarIcon, Ellipsis, ListFilter, Trash2 } from 'lucide-react';
import React, { JSX, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { cn, showErrorToast } from '@/lib/utils';
import { useDropdownAction } from '@/hooks/useDropdownAction';
import { deleteSlot, getAppointmentSlots } from '@/lib/features/appointments/appointmentsThunk';
import { ISlot, SlotStatus } from '@/types/appointment';
import { getFormattedDate, getTimeFromDateStamp } from '@/lib/date';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

const statusFilterOptions: ISelected[] = [
  {
    value: '',
    label: 'All',
  },
  {
    value: SlotStatus.Available,
    label: 'Available',
  },
  {
    value: SlotStatus.Unavailable,
    label: 'Unavailable',
  },
];

const ViewTimeSlots = (): JSX.Element => {
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<ISlot[]>([]);
  const [queryParameters, setQueryParameters] = useState<IQueryParams<SlotStatus | ''>>({
    page: 1,
    status: '',
  });
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getAppointmentSlots(queryParameters));
      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoading(false);
        return;
      }

      const { rows, ...pagination } = payload as IPagination<ISlot>;
      setTableData(rows);
      setPaginationData(pagination);
      setIsLoading(false);
    };
    void fetchData();
  }, [queryParameters]);

  const columns: ColumnDef<ISlot>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row: { original } }): string => getFormattedDate(original.date),
    },
    {
      accessorKey: 'startTime',
      header: 'Start Time',
      cell: ({ row: { original } }): string => getTimeFromDateStamp(original.startTime),
    },
    {
      accessorKey: 'endTime',
      header: 'End Time',
      cell: ({ row: { original } }): string => getTimeFromDateStamp(original.endTime),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }): JSX.Element => {
        switch (original.status) {
          case SlotStatus.Unavailable:
            return <Badge variant="destructive">Unavailable</Badge>;
          default:
            return <Badge variant="default">Available</Badge>;
        }
      },
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row: { original } }): JSX.Element => (
        <DropdownMenu>
          {original.status === SlotStatus.Available && (
            <DropdownMenuTrigger asChild>
              <div className="flex w-11 cursor-pointer items-center justify-center text-center text-sm text-black">
                <Ellipsis />
              </div>
            </DropdownMenuTrigger>
          )}
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() =>
                setConfirmation((prev) => ({
                  ...prev,
                  open: true,
                  acceptCommand: () => handleDropdownAction(deleteSlot, original.id),
                  acceptTitle: 'Delete',
                  declineTitle: 'Cancel',
                  rejectCommand: () =>
                    setConfirmation((prev) => ({
                      ...prev,
                      open: false,
                    })),
                  description: 'Are you sure you want to delete this slot?',
                }))
              }
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableHiding: false,
    },
  ];

  const { isConfirmationLoading, handleDropdownAction } = useDropdownAction({
    setConfirmation,
    setQueryParameters,
  });

  return (
    <>
      <div className="mt-4 rounded-lg bg-white">
        <div className="p-6">
          <div className="mb-4 flex flex-wrap justify-between">
            <div className="mb-2 flex gap-2">
              <div className={cn('grid gap-2')}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-[300px] justify-start text-left font-normal',
                        !queryParameters.startDate && 'text-muted-foreground',
                      )}
                      child={
                        <>
                          <CalendarIcon />
                          {queryParameters?.startDate ? (
                            queryParameters.endDate ? (
                              <>
                                {format(queryParameters.startDate, 'LLL dd, y')} -{' '}
                                {format(queryParameters.endDate, 'LLL dd, y')}
                              </>
                            ) : (
                              format(queryParameters.startDate, 'LLL dd, y')
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}{' '}
                        </>
                      }
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      autoFocus
                      mode="range"
                      defaultMonth={new Date()}
                      selected={{
                        from: queryParameters.startDate,
                        to: queryParameters.endDate,
                      }}
                      onSelect={(dateRange) =>
                        setQueryParameters((prev) => ({
                          ...prev,
                          page: 1,
                          startDate: dateRange?.from,
                          endDate: dateRange?.to,
                        }))
                      }
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <OptionsMenu
                options={statusFilterOptions}
                Icon={ListFilter}
                menuTrigger="Filter"
                selected={queryParameters.status}
                setSelected={(value: string) =>
                  setQueryParameters((prev) => ({
                    ...prev,
                    page: 1,
                    status: value as SlotStatus,
                  }))
                }
                className="h-10 cursor-pointer bg-gray-50 sm:flex"
              />
            </div>
          </div>
          <TableData
            columns={columns}
            data={tableData}
            page={queryParameters.page}
            userPaginationChange={({ pageIndex }) =>
              setQueryParameters((prev) => ({
                ...prev,
                page: pageIndex + 1,
              }))
            }
            paginationData={paginationData}
            isLoading={isLoading}
          />
        </div>
      </div>
      <Confirmation
        {...confirmation}
        showClose={true}
        setState={() =>
          setConfirmation((prev) => ({
            ...prev,
            open: false,
          }))
        }
        isLoading={isConfirmationLoading}
      />
    </>
  );
};

export default ViewTimeSlots;
