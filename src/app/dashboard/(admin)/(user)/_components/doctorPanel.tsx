'use client';
import { useRouter } from 'next/navigation';
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
  Check,
  FileDown,
  FileUp,
  Link2,
  ListFilter,
  MessageSquareX,
  Search,
  SendHorizontal,
  ShieldCheck,
  Signature,
  SquareArrowOutUpRight,
  UserRoundPlus,
} from 'lucide-react';
import React, { JSX, SyntheticEvent, useEffect, useState } from 'react';
import { DoctorProfile } from '@/components/doctor/DoctorProfile';
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
  const router = useRouter();
  const [openInvitationsPreview, setOpenInvitationsPreview] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor>();
  const [openModal, setOpenModal] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [openDeclineModal, setOpenDeclineModal] = useState(false);
  const [declineTargetId, setDeclineTargetId] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [isDeclineLoading, setIsDeclineLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
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
      // prettier-ignore
      cell: ({ row: { original } }): JSX.Element => { //NOSONAR
        const { firstName, lastName, profilePicture } = original;
        return (
          <AvatarWithName imageSrc={profilePicture} firstName={firstName} lastName={lastName} />
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }): JSX.Element => <StatusBadge status={original.status} />, //NOSONAR
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },

    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row: { original } }): JSX.Element => <GenderBadge gender={original.gender} />, //NOSONAR
    },

    {
      id: 'actions',
      header: 'Action',
      // prettier-ignore
      cell: ({ row: { original } }): JSX.Element => { //NOSONAR
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
                clickCommand: (): void => {
                  setDeclineTargetId(id);
                  setDeclineReason('');
                  setOpenDeclineModal(true);
                },
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
    if (result.length) {
      if (!openInvitationsPreview) {
        setOpenInvitationsPreview(true);
      }
    } else {
      setOpenInvitationsPreview(false);
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

  async function handleCopyDoctorLink(doctorId: string): Promise<void> {
    await navigator.clipboard.writeText(`${globalThis.location.origin}/doctor/${doctorId}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  function handleView(doctorId: string): void {
    const doctor = tableData.find(({ id }) => id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setOpenModal(true);
    }
  }

  function handleSubmit(event: SyntheticEvent, search?: string): void {
    event.preventDefault();
    setQueryParameters((prev) => ({
      ...prev,
      page: 1,
      search: search ?? searchTerm,
    }));
  }

  const handleDeclineSubmit = async (): Promise<void> => {
    setIsDeclineLoading(true);
    const { payload } = await dispatch(
      declineDoctor({ id: declineTargetId, reason: declineReason }),
    );
    setIsDeclineLoading(false);
    if (payload) {
      toast(payload as Toast);
    }
    if (!showErrorToast(payload)) {
      setOpenDeclineModal(false);
      setQueryParameters((prev) => ({ ...prev, page: 1 }));
    }
  };

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
                  className="max-w-83.25 sm:w-83.25"
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
        content={
          <div className="relative flex flex-col">
            <DoctorProfile ctaLabel={null} doctorId={selectedDoctor?.id ?? ''} showContactInfo />
            <div className="sticky right-0 bottom-0 left-0 z-20 flex justify-center gap-3 border-t bg-white p-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleCopyDoctorLink(selectedDoctor?.id ?? '')}
                child={
                  linkCopied ? (
                    <>
                      <Check size={16} /> Copied!
                    </>
                  ) : (
                    <>
                      <Link2 size={16} /> Copy Link
                    </>
                  )
                }
              />
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setOpenModal(false);
                  router.push(`/doctor/${selectedDoctor?.id}`);
                }}
                child="View Full Profile & Share"
              />
            </div>
          </div>
        }
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

      <Modal
        open={openDeclineModal}
        setState={setOpenDeclineModal}
        showClose={!isDeclineLoading}
        title="Decline Doctor Request"
        content={
          <div>
            <p className="mb-3 text-sm text-gray-600">
              Please provide a reason for declining this request.
            </p>
            <textarea
              className="focus:ring-primary w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:outline-none"
              rows={4}
              placeholder="Enter reason for declining..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              disabled={isDeclineLoading}
            />
            <div className="mt-4 flex justify-end gap-4">
              <Button
                child="Decline Request"
                onClick={handleDeclineSubmit}
                isLoading={isDeclineLoading}
                disabled={!declineReason.trim()}
              />
              <Button
                child="Cancel"
                variant="destructive"
                onClick={() => setOpenDeclineModal(false)}
                disabled={isDeclineLoading}
              />
            </div>
          </div>
        }
      />
    </>
  );
};

export default DoctorPanel;
