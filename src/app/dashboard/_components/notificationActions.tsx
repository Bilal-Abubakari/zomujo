import { JSX, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { IAppointment, IRecordRequest } from '@/types/appointment.interface';
import useWebSocket from '@/hooks/useWebSocket';
import { AcceptDecline } from '@/types/shared.interface';
import {
  acceptAppointment,
  declineAppointment,
} from '@/lib/features/appointments/appointmentsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { INotification, NotificationEvent } from '@/types/notification.interface';
import { useAppDispatch } from '@/lib/hooks';
import { acceptRecordRequest, declineRecordRequest } from '@/lib/features/records/recordsThunk';
import { AppointmentStatus, ApproveDeclineStatus } from '@/types/shared.enum';
import moment from 'moment';
import { AsyncThunk } from '@reduxjs/toolkit';

const NotificationActions = (): JSX.Element => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showNewRecordRequest, setShowNewRecordRequest] = useState(false);
  const [appointment, setAppointment] = useState<IAppointment>();
  const [recordRequest, setRecordRequest] = useState<IRecordRequest>();
  const [activeAction, setActiveAction] = useState<AcceptDecline | null>(null);
  const dispatch = useAppDispatch();
  const { on, updateNotificationsHandler } = useWebSocket();

  const handleAcceptDeclineAction = async (
    id: string,
    action: AcceptDecline,
    actionThunks: AsyncThunk<Toast, string, object>,
    setShowState: (state: boolean) => void,
  ): Promise<void> => {
    setActiveAction(action);
    const { payload } = await dispatch(actionThunks(id));
    toast(payload as Toast);
    setActiveAction(null);
    setShowState(false);
  };

  on(NotificationEvent.NewRequest, (data: unknown) => {
    const notification = data as INotification;
    console.log('Notification', notification);
    setAppointment(notification.payload.appointment);
    updateNotificationsHandler(notification);
    setShowNewRecordRequest(false);
    setShowNewRequest(true);
  });

  on(NotificationEvent.RecordRequest, (data: unknown) => {
    const { payload } = data as INotification;
    setRecordRequest(payload.request);
    setShowNewRequest(false);
    setShowNewRecordRequest(true);
  });

  const newRequestTitle = (): string => {
    if (appointment?.status === AppointmentStatus.Accepted) {
      return 'Appointment Accepted';
    } else if (appointment?.status === AppointmentStatus.Declined) {
      return 'Appointment Declined';
    }
    return 'New Appointment Request';
  };

  const newRequestDescription = (): string => {
    if (appointment?.status === AppointmentStatus.Accepted) {
      return 'The appointment request has been accepted.';
    } else if (appointment?.status === AppointmentStatus.Declined) {
      return 'The appointment request has been declined.';
    }
    return 'Review the details of the new appointment request below.';
  };

  const recordRequestDescription = (): string => {
    if (recordRequest?.status === ApproveDeclineStatus.Approved) {
      return 'The record request has been accepted.';
    } else if (recordRequest?.status === ApproveDeclineStatus.Declined) {
      return 'The record request has been declined.';
    }
    return 'Your medical record has been request by a doctor.';
  };

  const recordRequestMessage = (): string => {
    if (recordRequest?.status === ApproveDeclineStatus.Approved) {
      return `Your request to access the medical records of ${recordRequest?.patient.firstName} ${recordRequest?.patient.lastName} has been accepted.`;
    } else if (recordRequest?.status === ApproveDeclineStatus.Declined) {
      return `Your request to access the medical records of ${recordRequest?.patient.firstName} ${recordRequest?.patient.lastName} has been declined.`;
    }
    return `Dr. ${recordRequest?.doctor.firstName} ${recordRequest?.doctor.lastName} has requested
                access to your medical records. If you accept he/she will be granted access to your
                records. If you decline then no further actions will be required`;
  };

  return (
    <>
      <Drawer open={showNewRequest}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-4">
            <DrawerHeader className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg">{newRequestTitle()}</DrawerTitle>
                <DrawerDescription>{newRequestDescription()}</DrawerDescription>
              </div>
              <Button
                child={<X size={20} />}
                variant="ghost"
                onClick={() => setShowNewRequest(false)}
                className="p-2"
              />
            </DrawerHeader>
            <div className="p-4 pb-0">
              <div className="mb-4">
                {appointment?.status === AppointmentStatus.Pending ? (
                  <div className="text-muted-foreground text-sm">Patient Name:</div>
                ) : (
                  <div className="text-muted-foreground text-sm">Doctor Name:</div>
                )}
                {appointment?.status === AppointmentStatus.Pending ? (
                  <div>
                    {appointment?.patient.firstName} {appointment?.patient.lastName}
                  </div>
                ) : (
                  <div>
                    {appointment?.doctor.firstName} {appointment?.doctor.lastName}
                  </div>
                )}
              </div>
              {appointment?.slot && (
                <>
                  <div className="mb-4">
                    <div className="text-muted-foreground text-sm">Appointment Date & Time:</div>
                    <div>{moment(appointment?.slot.date).format('LL')}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-muted-foreground text-sm">Appointment Time:</div>
                    <div>{moment(appointment?.slot.startTime).format('hh:mm A')}</div>
                  </div>
                </>
              )}
              <div className="mb-4">
                <div className="text-muted-foreground text-sm">Reason for Request:</div>
                <div>{appointment?.reason}</div>
              </div>
              <div className="mb-4">
                <div className="text-muted-foreground text-sm">Additional Information:</div>
                <div>{appointment?.additionalInfo}</div>
              </div>
            </div>
            <DrawerFooter className="flex justify-between">
              {appointment && appointment.status === AppointmentStatus.Pending ? (
                <>
                  <Button
                    onClick={() =>
                      handleAcceptDeclineAction(
                        String(appointment?.id),
                        'accept',
                        acceptAppointment,
                        setShowNewRequest,
                      )
                    }
                    child="Accept"
                    disabled={activeAction === 'accept'}
                    isLoading={activeAction === 'accept'}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleAcceptDeclineAction(
                        String(appointment?.id),
                        'decline',
                        declineAppointment,
                        setShowNewRequest,
                      )
                    }
                    child="Decline"
                    disabled={activeAction === 'decline'}
                    isLoading={activeAction === 'decline'}
                  />
                </>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => setShowNewRequest(false)}
                  child="Close"
                />
              )}
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>{' '}
      <Drawer open={showNewRecordRequest}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-4">
            <DrawerHeader className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg">Record Request</DrawerTitle>
                <DrawerDescription>{recordRequestDescription()}</DrawerDescription>
              </div>
              <Button
                child={<X size={20} />}
                variant="ghost"
                onClick={() => setShowNewRequest(false)}
                className="p-2"
              />
            </DrawerHeader>
            <div className="p-4 pb-0">
              <div className="mb-4">{recordRequestMessage()}</div>
            </div>
            <DrawerFooter className="flex justify-between">
              {recordRequest?.status === ApproveDeclineStatus.Pending ? (
                <>
                  <Button
                    onClick={() =>
                      handleAcceptDeclineAction(
                        String(recordRequest?.id),
                        'accept',
                        acceptRecordRequest,
                        setShowNewRecordRequest,
                      )
                    }
                    child="Accept"
                    disabled={activeAction === 'accept'}
                    isLoading={activeAction === 'accept'}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleAcceptDeclineAction(
                        String(recordRequest?.id),
                        'decline',
                        declineRecordRequest,
                        setShowNewRecordRequest,
                      )
                    }
                    child="Decline"
                    disabled={activeAction === 'decline'}
                    isLoading={activeAction === 'decline'}
                  />
                </>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => setShowNewRecordRequest(false)}
                  child="Close"
                />
              )}
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>{' '}
    </>
  );
};

export default NotificationActions;
