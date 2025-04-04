'use client';
import React, { JSX, ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/hooks';
import { getPatientRecords, requestStatus, sendRequest } from '@/lib/features/records/recordsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { ApproveDeclineStatus, SidebarType } from '@/types/shared.enum';
import { SettingsNavbar, SidebarLayout } from '@/app/dashboard/_components/sidebar/sidebarLayout';
import { showErrorToast } from '@/lib/utils';
import { INotification, NotificationEvent } from '@/types/notification.interface';
import useWebSocket from '@/hooks/useWebSocket';

const PatientView = ({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element => {
  const [status, setStatus] = useState<ApproveDeclineStatus>(ApproveDeclineStatus.Idle);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const { on } = useWebSocket();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const params = useParams();
  const patientId = params.id as string;

  const fetchPatientRecords = async (status: ApproveDeclineStatus): Promise<void> => {
    if (status === ApproveDeclineStatus.Approved) {
      setIsLoading(true);
      const { payload } = await dispatch(getPatientRecords(patientId));
      if (showErrorToast(payload)) {
        toast(payload as Toast);
      }
      setIsLoading(false);
    }
  };

  const submitRequest = async (): Promise<void> => {
    setIsSubmittingRequest(true);
    const { payload } = await dispatch(sendRequest(patientId));
    const toastMessage = payload as Toast;
    if (!showErrorToast(toastMessage)) {
      setStatus(ApproveDeclineStatus.Pending);
    }
    toast(toastMessage);
    setIsSubmittingRequest(false);
  };

  useEffect(() => {
    const handleStatusCheck = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(requestStatus(patientId));
      if (showErrorToast(payload)) {
        toast(payload as Toast);
      }
      const status = payload as ApproveDeclineStatus;
      setStatus(status);
      setIsLoading(false);
      void fetchPatientRecords(status);
    };
    void handleStatusCheck();
  }, []);

  on(NotificationEvent.RecordRequest, (data: unknown) => {
    const { payload } = data as INotification;
    const status = payload.request.status;
    setStatus(status);
    void fetchPatientRecords(status);
  });

  return (
    <div className="relative -ml-6">
      {isLoading && <LoadingOverlay />}
      {!isLoading && status === ApproveDeclineStatus.Idle && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#EDEDED80] backdrop-blur-[3px]">
          <div className="relative flex w-full max-w-lg flex-col items-center gap-6 rounded-3xl bg-white p-10 text-center shadow-lg">
            <div className="max-w-sm text-2xl font-bold">Request access to patient records</div>
            <p className="max-w-sm text-gray-500">
              Send a request to the selected patient to access their medical records.
            </p>
            <Button
              isLoading={isSubmittingRequest}
              onClick={submitRequest}
              className="w-full"
              child="Send Request"
            />
          </div>
        </div>
      )}
      {!isLoading && status === ApproveDeclineStatus.Pending && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#EDEDED80] backdrop-blur-[3px]">
          <div className="relative flex w-full max-w-lg flex-col items-center gap-6 rounded-3xl bg-white p-10 text-center shadow-lg">
            <div className="max-w-sm text-2xl font-bold">
              You have requested access to this patient records
            </div>
            <p className="max-w-sm text-gray-500">
              Please wait patiently for the patient to approve your request.
            </p>
          </div>
        </div>
      )}
      {!isLoading && status === ApproveDeclineStatus.Declined && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#EDEDED80] backdrop-blur-[3px]">
          <div className="relative flex w-full max-w-lg flex-col items-center gap-6 rounded-3xl bg-white p-10 text-center shadow-lg">
            <div className="max-w-sm text-2xl font-bold">
              Patient declined your request to access their records
            </div>
            <p className="max-w-sm text-gray-500">
              Unfortunately, the patient has declined your request to access their medical records.
            </p>
            <Button
              isLoading={isSubmittingRequest}
              onClick={submitRequest}
              className="w-full"
              child="Send Request Again"
            />
          </div>
        </div>
      )}
      <SettingsNavbar />
      <div className="flex overflow-hidden">
        <SidebarLayout
          type={SidebarType.PatientRecord}
          sidebarClassName="absolute left-0"
          sidebarContentClassName="bg-gray-100  border-r"
          sidebarTabClassName="data-[active=true]/menu-action:before:opacity-0"
        />
        <div className="w-full overflow-y-scroll bg-gray-50 px-8 pt-8">
          <div className="flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PatientView;
