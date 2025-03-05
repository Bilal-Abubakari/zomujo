'use client';
import { AvatarWithName } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Confirmation, ConfirmationProps, Modal } from '@/components/ui/dialog';
import {
  DropdownMenuContent,
  OptionsMenu,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  ISelected,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PaginationData, TableData } from '@/components/ui/table';
import {
  approveDoctorRequest,
  declineDoctor,
  getAllDoctors,
  inviteDoctors,
} from '@/lib/features/doctors/doctorsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { IDoctor } from '@/types/doctor.interface';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { ColumnDef } from '@tanstack/react-table';
import {
  Binoculars,
  CalendarX,
  Ellipsis,
  FileDown,
  FileUp,
  ListFilter,
  MessageSquareX,
  Search,
  SendHorizontal,
  ShieldCheck,
  Signature,
  SquareArrowOutUpRight,
  UserRoundPlus,
} from 'lucide-react';
import React, { FormEvent, JSX, useEffect, useState } from 'react';
import DoctorDetails from '../../../_components/doctorDetails';
import { Toast, toast } from '@/hooks/use-toast';
import { downloadFileWithUrl, showErrorToast } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';
import { useDropdownAction } from '@/hooks/useDropdownAction';
import { activateUser, deactivateUser } from '@/lib/features/auth/authThunk';
import { selectIsOrganizationAdmin, selectOrganizationId } from '@/lib/features/auth/authSelector';
import InviteUser from '@/app/dashboard/_components/inviteUser';
import InvitationPreview from '@/app/dashboard/(admin)/(user)/_components/invitationPreview';
import { useCSVReader } from '@/hooks/useCSVReader';
import GenderBadge from '@/app/dashboard/_components/genderBadge';
import { IBaseUser } from '@/types/auth.interface';
import { statusFilterOptions as baseStatusOptions } from '@/constants/constants';
import { StatusBadge } from '@/components/ui/statusBadge';

const statusFilterOptions: ISelected[] = [
  ...baseStatusOptions,
  {
    value: AcceptDeclineStatus.Declined,
    label: 'Rejected',
  },
];

const DoctorPanel = (): JSX.Element => {
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const [openInvitationsPreview, setOpenInvitationsPreview] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor>();
  const [openModal, setOpenModal] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const dispatch = useAppDispatch();
  const [tableData, setTableData] = useState<IDoctor[]>([]);
  const [queryParameters, setQueryParameters] = useState<IQueryParams<AcceptDeclineStatus | ''>>({
    page: 1,
    orderDirection: 'desc',
    orderBy: 'createdAt',
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
  const isOrganizationAdmin = useAppSelector(selectIsOrganizationAdmin);
  const orgId = useAppSelector(selectOrganizationId);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getAllDoctors(queryParameters));
      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoading(false);
        return;
      }

      const { rows, ...pagination } = payload as IPagination<IDoctor>;

      setTableData(rows);
      setPaginationData(pagination);
      setIsLoading(false);
    };
    void fetchData();
  }, [queryParameters]);

  const columns: ColumnDef<IDoctor>[] = [
    {
      accessorKey: 'MDCRegistration',
      header: 'MDC Registration',
    },
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row: { original } }): JSX.Element => {
        const { firstName, lastName, profilePicture } = original;
        return (
          <AvatarWithName imageSrc={profilePicture} firstName={firstName} lastName={lastName} />
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }): JSX.Element => <StatusBadge status={original.status} />,
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
        const isPending = status === AcceptDeclineStatus.Pending;
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
              {isPending && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirmation((prev) => ({
                        ...prev,
                        open: true,
                        acceptCommand: () => handleDropdownAction(approveDoctorRequest, id),
                        acceptTitle: 'Approve',
                        declineTitle: 'Cancel',
                        rejectCommand: () =>
                          setConfirmation((prev) => ({
                            ...prev,
                            open: false,
                          })),
                        description: `Are you sure you want to approve ${firstName}'s account?`,
                      }))
                    }
                  >
                    <Signature /> Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirmation((prev) => ({
                        ...prev,
                        open: true,
                        acceptCommand: () => handleDropdownAction(declineDoctor, id),
                        acceptTitle: 'Decline',
                        declineTitle: 'Cancel',
                        rejectCommand: () =>
                          setConfirmation((prev) => ({
                            ...prev,
                            open: false,
                          })),
                        description: `Are you sure you want to decline ${firstName}'s request?`,
                      }))
                    }
                  >
                    <MessageSquareX /> Decline
                  </DropdownMenuItem>
                </>
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

  const processInviteDoctorRow = (row: string[]): IBaseUser => ({
    firstName: row[0],
    lastName: row[1],
    email: row[2],
  });

  const { readCSV, result, setResult } = useCSVReader<IBaseUser>(processInviteDoctorRow, 'email');

  useEffect(() => {
    if (!result.length) {
      setOpenInvitationsPreview(false);
    } else {
      if (!openInvitationsPreview) {
        setOpenInvitationsPreview(true);
      }
    }
  }, [result]);

  const onSubmit = async (inviteDoctorData: IBaseUser[]): Promise<void> => {
    setIsInviting(true);
    const { payload } = await dispatch(inviteDoctors({ orgId, users: inviteDoctorData }));
    setIsInviting(false);
    if (payload && !showErrorToast(payload)) {
      setOpenInviteModal(false);
      setOpenInvitationsPreview(false);
    }
    setQueryParameters((prev) => ({
      ...prev,
      page: 1,
    }));
    toast(payload as Toast);
  };

  function handleView(doctorId: string): void {
    const doctor = tableData.find(({ id }) => id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
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

  const removeInvitation = (removeEmail: string): void => {
    const newInvitations = result.filter(({ email }) => email !== removeEmail);
    setResult(newInvitations);
  };

  return (
    <>
      <Modal
        className="max-w-xl"
        setState={setOpenInviteModal}
        open={openInviteModal}
        content={
          <InviteUser
            title="Doctor Invitation"
            buttonTitle="Invite Doctor"
            submit={(inviteDoctor) => onSubmit([inviteDoctor])}
            isLoading={isInviting}
          />
        }
        showClose={!isInviting}
      />
      <Modal
        className="max-w-xl"
        setState={setOpenInvitationsPreview}
        open={openInvitationsPreview}
        showClose={!isInviting}
        content={
          <InvitationPreview
            invitations={result}
            removeInvitation={removeInvitation}
            cancel={() => setOpenInvitationsPreview(false)}
            submit={() => onSubmit(result)}
            isLoading={isInviting}
          />
        }
      />
      <div className="mt-4 rounded-lg bg-white">
        <div className="p-6">
          <div className="mb-4 flex flex-wrap justify-between">
            <div className="mb-2 flex gap-2">
              <form className="flex" onSubmit={handleSubmit}>
                <Input
                  error=""
                  placeholder="Search Doctor"
                  className="max-w-[333px] sm:w-[333px]"
                  type="search"
                  leftIcon={<Search className="text-gray-500" size={20} />}
                  onChange={handleSearch}
                />
                {searchTerm && <Button child={<SendHorizontal />} className="ml-2" />}
              </form>
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
            </div>
            {isOrganizationAdmin && (
              <div className="space-x-4">
                <Button
                  onClick={() => setOpenInviteModal(true)}
                  child={
                    <>
                      <UserRoundPlus /> Invite Doctor
                    </>
                  }
                  className="h-10"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      child={
                        <>
                          <input
                            type="file"
                            id="fileUploadInput"
                            className="hidden"
                            accept=".csv"
                            onChange={(event) => readCSV(event)}
                          />
                          <SquareArrowOutUpRight /> Bulk Invite
                        </>
                      }
                      className="h-10"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <label className="flex w-full gap-x-2" htmlFor="fileUploadInput">
                        <FileUp /> Upload
                      </label>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        downloadFileWithUrl('/csv/doctor-invitation.csv', 'doctor-invitation.csv')
                      }
                    >
                      <FileDown /> Download Template
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          <TableData
            columns={columns}
            data={tableData}
            columnVisibility={{ profilePicture: false, lastName: false, id: false }}
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
        content={<DoctorDetails {...selectedDoctor!} />}
        className="max-w-screen max-h-screen overflow-y-scroll md:max-h-[90vh] md:max-w-[80vw]"
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

export default DoctorPanel;
