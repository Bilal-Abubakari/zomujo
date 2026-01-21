'use client';
import React, { JSX, useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { AvatarWithName } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/statusBadge';
import { IAppointment } from '@/types/appointment.interface';
import { IHospitalAppointment } from '@/types/hospital-appointment.interface';
import { Mail, Phone, MapPin, Calendar, FileText, Info, Signature, Ban, X, RotateCcw } from 'lucide-react';
import moment from 'moment';
import { useAppDispatch } from '@/lib/hooks';
import {
  acceptAppointment,
  declineAppointment,
  reopenAppointment,
} from '@/lib/features/appointments/appointmentsThunk';
import {
  acceptHospitalAppointment,
  declineHospitalAppointment,
  reopenHospitalAppointment,
} from '@/lib/features/hospital-appointments/hospitalAppointmentsThunk';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { toast, Toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';

type PatientDetailsDrawerProps = {
  open: boolean;
  onClose: () => void;
  appointment: IAppointment | IHospitalAppointment | null;
  isHospital?: boolean;
  onActionComplete?: () => void;
};

const PatientDetailsDrawer = ({
  open,
  onClose,
  appointment,
  isHospital = false,
  onActionComplete,
}: PatientDetailsDrawerProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isApproving, setIsApproving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  if (!appointment) {
    return <></>;
  }

  const { patient, reason, additionalInfo, status, slot, createdAt, id } = appointment;
  const isPending = status === AppointmentStatus.Pending;
  const isDone = status === AppointmentStatus.Completed;
  const isCancelled = status === AppointmentStatus.Cancelled;
  const canApprove = isPending;
  const canCancel = !isDone && !isCancelled;
  const canReopen = isCancelled;

  const handleApprove = async (): Promise<void> => {
    setIsApproving(true);
    const approveAction = isHospital
      ? acceptHospitalAppointment(id)
      : acceptAppointment(id);
    const { payload } = await dispatch(approveAction);
    
    if (payload && showErrorToast(payload)) {
      toast(payload as Toast);
    } else {
      toast(payload as Toast);
      if (onActionComplete) {
        onActionComplete();
      }
      onClose();
    }
    setIsApproving(false);
  };

  const handleCancel = async (): Promise<void> => {
    setIsCancelling(true);
    const cancelAction = isHospital
      ? declineHospitalAppointment(id)
      : declineAppointment(id);
    const { payload } = await dispatch(cancelAction);
    
    if (payload && showErrorToast(payload)) {
      toast(payload as Toast);
    } else {
      toast(payload as Toast);
      if (onActionComplete) {
        onActionComplete();
      }
      onClose();
    }
    setIsCancelling(false);
  };

  const handleReopen = async (): Promise<void> => {
    setIsReopening(true);
    const reopenAction = isHospital
      ? reopenHospitalAppointment(id)
      : reopenAppointment(id);
    const { payload } = await dispatch(reopenAction);
    
    if (payload && showErrorToast(payload)) {
      toast(payload as Toast);
    } else {
      toast(payload as Toast);
      if (onActionComplete) {
        onActionComplete();
      }
      onClose();
    }
    setIsReopening(false);
  };

  // Format appointment date/time
  const getAppointmentDateTime = (): string => {
    if (slot?.date) {
      const date = moment(slot.date).format('LL');
      const time = slot.startTime ? moment(slot.startTime, 'HH:mm:ss').format('h:mm A') : '';
      return time ? `${date} at ${time}` : date;
    }
    // For hospital appointments without slots, try to extract from additionalInfo
    if (additionalInfo) {
      const dateMatch = additionalInfo.match(/Appointment Date: (.+)/);
      if (dateMatch) {
        const dateStr = dateMatch[1].trim();
        // Try to parse and format the date
        const parsedDate = moment(dateStr);
        if (parsedDate.isValid()) {
          return parsedDate.format('LL');
        }
        return dateStr;
      }
    }
    return moment(createdAt).format('LL');
  };

  // Format additional info text, converting ISO dates to human-readable format
  const formatAdditionalInfo = (text: string): string => {
    if (!text) return text;

    // Pattern to match ISO 8601 date strings (e.g., "2026-01-24T00:00:00.000Z" or "2026-01-24T00:00:00Z")
    // This will match dates in various ISO formats
    const isoDatePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?/g;

    return text.replace(isoDatePattern, (match) => {
      const parsedDate = moment(match);
      if (parsedDate.isValid()) {
        return parsedDate.format('LL');
      }
      return match;
    });
  };

  return (
    <Drawer direction="right" open={open}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto p-4">
          <DrawerHeader className="relative">
            <DrawerClose
              onClick={onClose}
              disabled={isApproving || isCancelling || isReopening}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[disabled]:pointer-events-none"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </DrawerClose>
            <DrawerTitle className="text-xl pr-8">Patient Contact Information</DrawerTitle>
            <DrawerDescription>View patient details and appointment information</DrawerDescription>
          </DrawerHeader>

          <div className="mt-6 space-y-6">
            {/* Patient Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </div>

              {/* Patient Name with Avatar */}
              <div className="flex items-center gap-3">
                <AvatarWithName
                  imageSrc={patient.profilePicture}
                  firstName={patient.firstName}
                  lastName={patient.lastName}
                />
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  {patient.email ? (
                    <a
                      href={`mailto:${patient.email}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {patient.email}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-gray-400">N/A</p>
                  )}
                </div>
              </div>

              {/* Phone/Contact */}
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Phone</p>
                  {patient.contact ? (
                    <a
                      href={`tel:${patient.contact}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {patient.contact}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-gray-400">N/A</p>
                  )}
                </div>
              </div>

              {/* Address */}
              {patient.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm font-medium">{patient.address}</p>
                  </div>
                </div>
              )}

              {/* City */}
              {patient.city && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">City</p>
                    <p className="text-sm font-medium">{patient.city}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Appointment Details Section */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2 border-b pb-3">
                <h3 className="text-lg font-semibold">Appointment Details</h3>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <StatusBadge
                      status={status}
                      approvedTitle="Accepted"
                      destructiveTitle="Cancelled"
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Date/Time */}
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Appointment Date & Time</p>
                  <p className="text-sm font-medium">{getAppointmentDateTime()}</p>
                </div>
              </div>

              {/* Reason */}
              {reason && (
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Reason</p>
                    <p className="text-sm font-medium">{reason}</p>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {additionalInfo && (
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Additional Information</p>
                    <p className="text-sm font-medium whitespace-pre-wrap">
                      {formatAdditionalInfo(additionalInfo)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="flex flex-col gap-2">
            <div className="flex gap-2">
              {canApprove && (
                <Button
                  variant="default"
                  onClick={handleApprove}
                  className="flex-1"
                  isLoading={isApproving}
                  disabled={isApproving || isCancelling || isReopening}
                  child={
                    <>
                      <Signature className="mr-2 h-4 w-4" /> Approve
                    </>
                  }
                />
              )}
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  className="flex-1"
                  isLoading={isCancelling}
                  disabled={isApproving || isCancelling || isReopening}
                  child={
                    <>
                      <Ban className="mr-2 h-4 w-4" /> Cancel
                    </>
                  }
                />
              )}
              {canReopen && (
                <Button
                  variant="default"
                  onClick={handleReopen}
                  className="flex-1"
                  isLoading={isReopening}
                  disabled={isApproving || isCancelling || isReopening}
                  child={
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" /> Reopen
                    </>
                  }
                />
              )}
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PatientDetailsDrawer;
