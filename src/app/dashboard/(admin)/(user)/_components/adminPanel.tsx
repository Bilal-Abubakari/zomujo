'use client';
import { AvatarWithName } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Confirmation, ConfirmationProps, Modal } from '@/components/ui/dialog';
import { OptionsMenu, ActionsDropdownMenus } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TableData } from '@/components/ui/table';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { ColumnDef } from '@tanstack/react-table';
import {
  CalendarX,
  ListFilter,
  Search,
  SendHorizontal,
  ShieldCheck,
  UserRoundPlus,
} from 'lucide-react';
import React, { FormEvent, JSX, useState } from 'react';
import { Toast, toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';
import { useDropdownAction } from '@/hooks/useDropdownAction';
import { activateUser, deactivateUser } from '@/lib/features/auth/authThunk';
import { selectIsOrganizationAdmin, selectOrganizationId } from '@/lib/features/auth/authSelector';
import InviteUser from '@/app/dashboard/_components/inviteUser';
import { IAdmin } from '@/types/admin.interface';
import { getAllAdmins, inviteAdmin } from '@/lib/features/admins/adminsThunk';
import { getFormattedDate } from '@/lib/date';
import { IBaseUser } from '@/types/auth.interface';
import { statusFilterOptions } from '@/constants/constants';
import { StatusBadge } from '@/components/ui/statusBadge';
import { useFetchPaginatedData } from '@/hooks/useFetchPaginatedData';

const AdminPanel = (): JSX.Element => {
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
    useFetchPaginatedData<IAdmin>(getAllAdmins);

  const columns: ColumnDef<IAdmin>[] = [
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
      accessorKey: 'org.name',
      header: 'Organization',
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
      accessorKey: 'createdAt',
      header: 'Date Created',
      cell: ({ row: { original } }): string => getFormattedDate(original.createdAt),
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row: { original } }): JSX.Element => {
        const { status, id, firstName } = original;
        const isApproved = status === AcceptDeclineStatus.Accepted;
        const isDeactivated = status === AcceptDeclineStatus.Deactivated;
        return (
          <ActionsDropdownMenus
            menuContent={[
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

  const onSubmit = async (inviteAdminData: IBaseUser): Promise<void> => {
    setIsInviting(true);
    const { payload } = await dispatch(inviteAdmin({ orgId, ...inviteAdminData }));
    setIsInviting(false);
    if (payload && !showErrorToast(payload)) {
      setOpenInviteModal(false);
    }
    setQueryParameters((prev) => ({
      ...prev,
      page: 1,
    }));
    toast(payload as Toast);
  };

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

  return (
    <>
      <Modal
        className="max-w-xl"
        setState={setOpenInviteModal}
        open={openInviteModal}
        content={
          <InviteUser
            title="Admin Invitation"
            buttonTitle="Invite Admin"
            submit={(inviteAdmin) => onSubmit(inviteAdmin)}
            isLoading={isInviting}
          />
        }
        showClose={!isInviting}
      />
      <div className="mt-4 rounded-lg bg-white">
        <div className="p-6">
          <div className="mb-4 flex flex-wrap justify-between">
            <div className="mb-2 flex gap-2">
              <form className="flex" onSubmit={handleSubmit}>
                <Input
                  error=""
                  placeholder="Search Admin"
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
                      <UserRoundPlus /> Invite Admin
                    </>
                  }
                  className="h-10"
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
      <Confirmation
        {...confirmation}
        showClose={true}
        setState={() => handleConfirmationClose()}
        isLoading={isConfirmationLoading}
      />
    </>
  );
};

export default AdminPanel;
