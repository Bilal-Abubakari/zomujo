'use client';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import AppointmentRequestCard from './appointmentRequestCard';
import { Badge } from '@/components/ui/badge';
import { Confirmation } from '@/components/ui/dialog';
import { cn, showErrorToast } from '@/lib/utils';
import { IAppointment } from '@/types/appointment.interface';
import { AppointmentStatus, OrderDirection } from '@/types/shared.enum';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  acceptAppointment,
  declineAppointment,
  getAppointments,
} from '@/lib/features/appointments/appointmentsThunk';
import { selectUser } from '@/lib/features/auth/authSelector';
import { AcceptDecline, IPagination } from '@/types/shared.interface';
import { Toast, toast } from '@/hooks/use-toast';
import SkeletonAcceptDeclineRequestCard from '@/components/skeleton/skeletonAcceptDeclineRequestCard';
import { INotification, NotificationEvent } from '@/types/notification.interface';
import useWebSocket from '@/hooks/useWebSocket';
import { Calendar } from 'lucide-react';

const AppointmentRequestPanel = (): JSX.Element => {
  const { on } = useWebSocket();
  const [requests, setRequests] = useState<IAppointment[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    action: AcceptDecline;
    request: IAppointment;
  }>();
  const dispatch = useAppDispatch();
  const { id } = useAppSelector(selectUser)!;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  on(NotificationEvent.NewRequest, (data: unknown) => {
    const notification = data as INotification;
    setRequests((prev) => [
      notification.payload.appointment,
      ...prev.filter((req) => req.id !== notification.payload.appointment.id),
    ]);
  });

  useEffect(() => {
    void getAppointmentRequests();
  }, []);

  const suggestSmallScreen = useMemo(
    () => (
      <Carousel>
        <CarouselContent className="m-auto w-full">
          {requests.map((request) => (
            <CarouselItem className="w-full" key={request.id}>
              <AppointmentRequestCard
                request={request}
                approveRequest={() => handleAppointmentAction(request, 'accept')}
                rejectRequest={() => handleAppointmentAction(request, 'decline')}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    ),
    [requests],
  );

  function handleAppointmentAction(request: IAppointment, action: AcceptDecline): void {
    setOpenModal(true);
    setSelectedRequest({ action, request });
  }

  async function getAppointmentRequests(): Promise<void> {
    setIsLoadingAppointments(true);
    const { payload } = await dispatch(
      getAppointments({
        orderDirection: OrderDirection.Descending,
        status: AppointmentStatus.Pending,
        doctorId: id,
        page: 1,
        pageSize: 20,
      }),
    );

    if (payload) {
      setRequests((payload as IPagination<IAppointment>).rows);
    }
    setIsLoadingAppointments(false);
  }

  async function acceptDeclineRequest(mode: AcceptDecline): Promise<void> {
    setIsLoading(true);
    if (!selectedRequest?.request) {
      return;
    }
    const request =
      mode === 'accept'
        ? dispatch(acceptAppointment(selectedRequest?.request.id))
        : dispatch(declineAppointment(selectedRequest?.request.id));

    const { payload } = await request;
    setIsLoading(false);
    toast(payload as Toast);

    if (payload && !showErrorToast(payload)) {
      setOpenModal(false);
      void getAppointmentRequests();
    }
  }
  return (
    <>
      <Confirmation
        open={openModal}
        isLoading={isLoading}
        description={
          <>
            Are you sure you want to
            <span
              className={cn(
                'px-1',
                selectedRequest?.action == 'accept' ? 'text-primary' : 'text-error-400',
              )}
            >
              {selectedRequest?.action}
            </span>
            <span className={'pr-1 font-semibold'}>
              {selectedRequest?.request.patient.firstName}{' '}
              {selectedRequest?.request.patient.lastName}
            </span>
            request?
          </>
        }
        acceptButtonTitle={selectedRequest?.action == 'accept' ? 'Yes, accept' : 'Yes decline'}
        rejectButtonTitle={'Cancel'}
        acceptCommand={() => acceptDeclineRequest(selectedRequest!.action)}
        rejectCommand={() => setOpenModal && setOpenModal(false)}
      />
      <div className="h-[calc(100vh-203px)] w-full overflow-y-scroll rounded-2xl border bg-gray-50 pt-6 max-md:h-[380px]">
        <div className="flex flex-row items-center justify-center gap-2 px-4">
          <p className="text-lg font-bold text-gray-900 md:text-xl">Appointment Requests</p>
          <Badge variant={'brown'}>{requests?.length}</Badge>
        </div>
        <hr className="mx-4 mt-4 border border-gray-200" />

        {!isLoadingAppointments ? (
          <>
            {requests.length > 0 ? (
              <>
                <div className="mx-4 my-2 hidden md:block">
                  {requests?.map((request) => (
                    <AppointmentRequestCard
                      key={request.id}
                      request={request}
                      approveRequest={() => handleAppointmentAction(request, 'accept')}
                      rejectRequest={() => handleAppointmentAction(request, 'decline')}
                    />
                  ))}
                </div>
                <div className="mx-4 my-2 md:hidden">{suggestSmallScreen}</div>
              </>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center gap-3 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">No Appointment Requests</p>
                  <p className="mt-1.5 text-sm text-gray-500">
                    There are currently no requests to accept or decline.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonAcceptDeclineRequestCard key={index} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentRequestPanel;
