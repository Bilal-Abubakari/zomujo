'use client';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import AppointmentRequestCard from './appointmentRequestCard';
import { Badge } from '@/components/ui/badge';
import { Confirmation } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { IAppointment } from '@/types/appointment.interface';
import { AppointmentStatus } from '@/types/shared.enum';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getAppointments } from '@/lib/features/appointments/appointmentsThunk';
import { selectUser } from '@/lib/features/auth/authSelector';
import { IPagination } from '@/types/shared.interface';

const AppointmentRequestPanel = (): JSX.Element => {
  const [requests, setRequests] = useState<IAppointment[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    action: 'accept' | 'decline';
    request: IAppointment;
  }>();
  const dispatch = useAppDispatch();
  const { id } = useAppSelector(selectUser)!;

  useEffect(() => {
    const getAppointmentRequests = async (): Promise<void> => {
      const { payload } = await dispatch(
        getAppointments({
          orderDirection: 'asc',
          status: AppointmentStatus.Pending,
          doctorId: id,
          page: 1,
          pageSize: 20,
        }),
      );

      if (payload) {
        setRequests((payload as IPagination<IAppointment>).rows);
      }
    };
    void getAppointmentRequests();
  }, []);

  const suggestSmallScreen = useMemo(
    () => (
      <Carousel>
        <CarouselContent className="m-auto">
          {requests.map((request) => (
            <CarouselItem key={request.id}>
              <AppointmentRequestCard
                request={request}
                approveRequest={() => setSelectedRequest({ action: 'accept', request })}
                rejectRequest={() => setSelectedRequest({ action: 'decline', request })}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    ),
    [],
  );
  return (
    <>
      <Confirmation
        open={openModal}
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
        acceptCommand={() => setOpenModal && setOpenModal(false)}
        rejectCommand={() => setOpenModal && setOpenModal(false)}
      />
      <div className="h-[calc(100vh-203px)] w-full overflow-y-scroll rounded-2xl border bg-white pt-6 max-md:h-[380px]">
        <div className="flex flex-row items-center justify-center gap-2">
          <p className="text-xl font-bold">Appointment Requests</p>
          <Badge variant={'brown'}>5</Badge>
        </div>
        <hr className="mx-6 mt-6 border border-gray-200" />
        <div className="hidden md:block">
          {requests.map((request) => (
            <AppointmentRequestCard
              key={request.id}
              request={request}
              approveRequest={() => setSelectedRequest({ action: 'accept', request })}
              rejectRequest={() => setSelectedRequest({ action: 'decline', request })}
            />
          ))}
        </div>
        <div className="mx-2 md:hidden">{suggestSmallScreen}</div>
      </div>
    </>
  );
};

export default AppointmentRequestPanel;
