'use client';
import { Confirmation, ConfirmationProps, Modal } from '@/components/ui/dialog';
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch } from '@/lib/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Ellipsis, ShieldBan, Trash2 } from 'lucide-react';
import React, { JSX, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { useDropdownAction } from '@/hooks/useDropdownAction';
import { deletePattern, getSlotPatterns } from '@/lib/features/appointments/appointmentsThunk';
import { ISlotPattern } from '@/types/appointment';
import { getFormattedDate, getTimeFromDateStamp } from '@/lib/date';
import { TableData } from '@/components/ui/table';
import { getFrequencyFromRule, getWeekDaysFromRule } from '@/lib/rule';
import { Badge } from '@/components/ui/badge';
import CreateException from '@/app/dashboard/settings/_components/timeSlots/createException';

const ViewPatterns = (): JSX.Element => {
  const [isLoading, setLoading] = useState(false);
  const [slotPatterns, setSlotPatterns] = useState<ISlotPattern[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const [patternId, setPatternId] = useState<string | null>(null);
  const [showCreateException, setShowCreateException] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      const { payload } = await dispatch(getSlotPatterns());
      if (payload && showErrorToast(payload)) {
        toast(payload);
        setLoading(false);
        return;
      }

      setSlotPatterns(payload as ISlotPattern[]);
      setLoading(false);
    };
    void fetchData();
  }, []);

  const columns: ColumnDef<ISlotPattern>[] = [
    {
      accessorKey: 'startDate',
      header: 'Date',
      cell: ({ row: { original } }): string =>
        `${getFormattedDate(original.startDate)}${original.endDate ? ` - ${getFormattedDate(original.endDate)}` : ''}`,
    },
    {
      accessorKey: 'startTime',
      header: 'Time',
      cell: ({ row: { original } }): string =>
        `${getTimeFromDateStamp(original.startTime)} - ${getTimeFromDateStamp(original.endTime)}`,
    },
    {
      header: 'Frequency',
      cell: ({ row: { original } }): string =>
        getFrequencyFromRule(original.recurrence).toLowerCase(),
    },
    {
      accessorKey: 'days',
      header: 'Days',
      cell: ({ row: { original } }): string => getWeekDaysFromRule(original.recurrence).join(', '),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }): JSX.Element => {
        switch (original.status) {
          case 'inactive':
            return <Badge variant="destructive">Inactive</Badge>;
          default:
            return <Badge variant="default">Active</Badge>;
        }
      },
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row: { original } }): JSX.Element => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex w-11 cursor-pointer items-center justify-center text-center text-sm text-black">
              <Ellipsis />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() =>
                setConfirmation((prev) => ({
                  ...prev,
                  open: true,
                  acceptCommand: () =>
                    handleDropdownAction(
                      deletePattern,
                      original.id,
                      slotPatterns,
                      setSlotPatterns,
                      true,
                    ),
                  acceptTitle: 'Delete',
                  declineTitle: 'Cancel',
                  rejectCommand: () =>
                    setConfirmation((prev) => ({
                      ...prev,
                      open: false,
                    })),
                  description: 'Are you sure you want to delete this pattern?',
                }))
              }
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setPatternId(original.id);
                setShowCreateException(true);
              }}
            >
              <ShieldBan /> Create Exception
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableHiding: false,
    },
  ];

  const { isConfirmationLoading, handleDropdownAction } = useDropdownAction({
    setConfirmation,
  });

  return (
    <>
      {patternId && (
        <Modal
          open={showCreateException}
          content={
            <CreateException
              patternId={patternId}
              closeCreateException={() => setShowCreateException(false)}
            />
          }
          setState={setShowCreateException}
        />
      )}
      <div className="mt-4 rounded-lg bg-white">
        <div className="p-6">
          <div className="mb-4 flex flex-wrap justify-between"></div>
          <TableData
            columns={columns}
            data={slotPatterns}
            manualPagination={false}
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

export default ViewPatterns;
