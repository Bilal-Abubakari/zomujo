'use client';
import { AvatarWithName } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Confirmation, ConfirmationProps, Modal } from '@/components/ui/dialog';
import { OptionsMenu, ISelected, ActionsDropdownMenus } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TableData } from '@/components/ui/table';
import {
  approveDoctorRequest,
  declineDoctor,
  getAllDoctors,
  inviteDoctors,
} from '@/lib/features/doctors/doctorsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { IDoctor } from '@/types/doctor.interface';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { ColumnDef } from '@tanstack/react-table';
import {
  Binoculars,
  CalendarX,
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
import { downloadFileWithUrl, showErrorToast, capitalize } from '@/lib/utils';
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
import { useFetchPaginatedData } from '@/hooks/useFetchPaginatedData';

const statusFilterOptions: ISelected[] = [
  ...baseStatusOptions,
  {
    value: AcceptDeclineStatus.Declined,
    label: 'Rejected',
  },
  {
    value: AcceptDeclineStatus.Pending,
    label: 'Pending',
  },
];

const DoctorPanel = (): JSX.Element => {
  const [openInvitationsPreview, setOpenInvitationsPreview] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor>();
  const [openModal, setOpenModal] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const dispatch = useAppDispatch();
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const { searchTerm, handleSearch } = useSearch(handleSubmit);
  const isOrganizationAdmin = useAppSelector(selectIsOrganizationAdmin);
  const orgId = useAppSelector(selectOrganizationId);
  const { isLoading, setQueryParameters, paginationData, queryParameters, tableData, updatePage } =
    useFetchPaginatedData<IDoctor>(getAllDoctors);

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
          <ActionsDropdownMenus
            menuContent={[
              {
                title: (
                  <>
                    <Binoculars /> View
                  </>
                ),
                clickCommand: () => handleView(id),
              },
              {
                title: (
                  <>
                    <ShieldCheck /> Activate
                  </>
                ),
                visible: isDeactivated,
                clickCommand: () =>
                  handleConfirmationOpen(
                    'Activate',
                    `activate ${firstName}'s account`,
                    id,
                    activateUser,
                  ),
              },
              {
                title: (
                  <>
                    <Signature /> Approve
                  </>
                ),
                visible: isPending,
                clickCommand: () =>
                  handleConfirmationOpen(
                    'Approve',
                    `approve ${firstName}'s account`,
                    id,
                    approveDoctorRequest,
                  ),
              },
              {
                title: (
                  <>
                    <MessageSquareX /> Decline
                  </>
                ),
                visible: isPending,
                clickCommand: () =>
                  handleConfirmationOpen(
                    'Decline',
                    `decline ${firstName}'s request`,
                    id,
                    declineDoctor,
                  ),
              },
              {
                title: (
                  <>
                    <CalendarX /> Deactivate
                  </>
                ),
                visible: isApproved,
                clickCommand: () =>
                  handleConfirmationOpen(
                    'Deactivate',
                    `deactivate ${firstName}'s account`,
                    id,
                    deactivateUser,
                  ),
              },
            ]}
          />
        );
      },
      enableHiding: false,
    },
  ];

  const processInviteDoctorRow = (row: string[]): IBaseUser => ({
    firstName: capitalize(row[0]?.trim() || ''),
    lastName: capitalize(row[1]?.trim() || ''),
    email: row[2]?.trim() || '',
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

  const { isConfirmationLoading, handleConfirmationOpen, handleConfirmationClose } =
    useDropdownAction({
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
                <ActionsDropdownMenus
                  action={
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
                  }
                  menuContent={[
                    {
                      title: (
                        <label className="flex w-full gap-x-2" htmlFor="fileUploadInput">
                          <FileUp /> Upload
                        </label>
                      ),
                    },
                    {
                      title: (
                        <>
                          <FileDown /> Download Template
                        </>
                      ),
                      clickCommand: () =>
                        downloadFileWithUrl('/csv/doctor-invitation.csv', 'doctor-invitation.csv'),
                    },
                  ]}
                />
              </div>
            )}
          </div>
          <TableData
            columns={columns}
            data={tableData}
            page={queryParameters.page}
            userPaginationChange={({ pageIndex }) => updatePage(pageIndex)}
            paginationData={paginationData}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Modal
        open={openModal}
        content={<DoctorDetails doctorId={selectedDoctor?.id ?? ''} />}
        className="max-h-screen max-w-screen overflow-y-scroll md:max-h-[90vh] md:max-w-[80vw]"
        setState={setOpenModal}
        showClose={true}
      />

      <Confirmation
        {...confirmation}
        showClose={true}
        setState={() => handleConfirmationClose()}
        isLoading={isConfirmationLoading}
      />
    </>
  );
};

export default DoctorPanel;
