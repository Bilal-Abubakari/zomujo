'use client';
import { AvatarComp } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Confirmation, ConfirmationProps, Modal } from '@/components/ui/dialog';
import {
  DropdownMenuContent,
  OptionsMenu,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PaginationData, TableData } from '@/components/ui/table';
import { useAppDispatch } from '@/lib/hooks';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { ColumnDef } from '@tanstack/react-table';
import {
  Binoculars,
  CalendarX,
  Ellipsis,
  Eye,
  ListFilter,
  Search,
  SendHorizontal,
  ShieldCheck,
} from 'lucide-react';
import React, { FormEvent, JSX, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';
import { useDropdownAction } from '@/hooks/useDropdownAction';
import { activateUser, deactivateUser } from '@/lib/features/auth/authThunk';
import { getAllPatients } from '@/lib/features/patients/patientsThunk';
import { IPatient } from '@/types/patient.interface';
import PatientRecord from '@/app/dashboard/_components/patient/patientRecord';
import GenderBadge from '@/app/dashboard/_components/genderBadge';
import { statusFilterOptions } from '@/constants/constants';
import { useRouter } from 'next/navigation';

type PatientPanelProps = {
  doctorView?: boolean;
};

const PatientPanel = ({ doctorView }: PatientPanelProps): JSX.Element => {
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const [selectedPatient, setSelectedPatient] = useState<IPatient>();
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [tableData, setTableData] = useState<IPatient[]>([]);
  const [queryParameters, setQueryParameters] = useState<IQueryParams<AcceptDeclineStatus | ''>>({
    page: 1,
    status: '',
    search: '',
  });
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const { searchTerm, handleSearch } = useSearch(handleSubmit);
  const router = useRouter();

  const columns: ColumnDef<IPatient>[] = [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row: { original } }): JSX.Element => {
        const { profilePicture, firstName, lastName } = original;
        const name = `${firstName} ${lastName}`;
        return (
          <div className="flex items-center justify-start gap-2">
            <AvatarComp imageSrc={profilePicture} name={name} className="h-7 w-7" /> {name}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }): JSX.Element => {
        switch (original.status) {
          case AcceptDeclineStatus.Accepted:
            return <Badge variant="default">Approved</Badge>;
          case AcceptDeclineStatus.Deactivated:
            return <Badge variant="destructive">Deactivated</Badge>;
          default:
            return <Badge variant="brown">Pending</Badge>;
        }
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
    },

    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row: { original } }): JSX.Element => <GenderBadge gender={original.gender} />,
    },

    {
      id: 'actions',
      header: 'Action',
      cell: ({ row: { original } }): JSX.Element => {
        const { status, id, firstName } = original;
        if (doctorView) {
          return (
            <button
              className="hover:text-primary cursor-pointer"
              onClick={() => router.push(`/dashboard/patients/${id}`)}
            >
              <Eye />
            </button>
          );
        }
        const isApproved = status === AcceptDeclineStatus.Accepted;
        const isDeactivated = status === AcceptDeclineStatus.Deactivated;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex w-11 cursor-pointer items-center justify-center text-center text-sm text-black">
                <Ellipsis />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleView(id)}>
                <Binoculars /> View
              </DropdownMenuItem>
              {isDeactivated && (
                <DropdownMenuItem
                  onClick={() =>
                    setConfirmation((prev) => ({
                      ...prev,
                      open: true,
                      acceptCommand: () => handleDropdownAction(activateUser, id),
                      acceptTitle: 'Activate',
                      declineTitle: 'Cancel',
                      rejectCommand: () =>
                        setConfirmation((prev) => ({
                          ...prev,
                          open: false,
                        })),
                      description: `Are you sure you want to activate ${firstName}'s account?`,
                    }))
                  }
                >
                  <ShieldCheck /> Activate
                </DropdownMenuItem>
              )}
              {isApproved && (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() =>
                    setConfirmation((prev) => ({
                      ...prev,
                      open: true,
                      acceptCommand: () => handleDropdownAction(deactivateUser, id),
                      acceptTitle: 'Deactivate',
                      declineTitle: 'Cancel',
                      rejectCommand: () =>
                        setConfirmation((prev) => ({
                          ...prev,
                          open: false,
                        })),
                      description: `Are you sure you want to deactivate ${firstName}'s account?`,
                    }))
                  }
                >
                  <CalendarX /> Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableHiding: false,
    },
  ];

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getAllPatients(queryParameters));
      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoading(false);
        return;
      }

      const { rows, ...pagination } = payload as IPagination<IPatient>;

      setTableData(rows);
      setPaginationData(pagination);
      setIsLoading(false);
    };

    void fetchData();
  }, [queryParameters]);

  function handleView(patientId: string): void {
    const patient = tableData.find(({ id }) => id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setOpenModal(true);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>, search?: string): void {
    event.preventDefault();
    setQueryParameters((prev) => ({
      ...prev,
      page: 1,
      search: search ?? searchTerm,
    }));
  }

  const { handleDropdownAction, isConfirmationLoading } = useDropdownAction({
    setConfirmation,
    setQueryParameters,
  });

  return (
    <>
      <div className="mt-4 rounded-lg bg-white">
        <div className="p-6">
          <div className="mb-4 flex flex-wrap justify-between">
            <div className="mb-2 flex gap-2">
              <form className="flex" onSubmit={handleSubmit}>
                <Input
                  error=""
                  placeholder="Search Patient"
                  className="max-w-[333px] sm:w-[333px]"
                  type="search"
                  leftIcon={<Search className="text-gray-500" size={20} />}
                  onChange={handleSearch}
                />
                {searchTerm && <Button child={<SendHorizontal />} className="ml-2" />}
              </form>
              {!doctorView && (
                <OptionsMenu
                  options={statusFilterOptions}
                  Icon={ListFilter}
                  menuTrigger="Filter"
                  selected={queryParameters.status}
                  setSelected={(value: string) =>
                    setQueryParameters((prev) => ({
                      ...prev,
                      page: 1,
                      status: value as AcceptDeclineStatus,
                    }))
                  }
                  className="h-10 cursor-pointer bg-gray-50 sm:flex"
                />
              )}
            </div>
          </div>
          <TableData
            columns={columns}
            data={tableData}
            columnVisibility={{ status: !doctorView }}
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

      <Modal
        open={openModal}
        content={<PatientRecord patient={selectedPatient!} />}
        className="max-h-screen max-w-screen overflow-y-scroll md:max-h-[90vh] md:max-w-[80vw]"
        setState={setOpenModal}
        showClose={true}
      />

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

export default PatientPanel;
