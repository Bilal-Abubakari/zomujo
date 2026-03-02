import React, { JSX } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ClipboardList, Stethoscope } from 'lucide-react';
import { IAppointment } from '@/types/appointment.interface';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';

interface IncompleteConsultationModalProps {
  open: boolean;
  onClose: () => void;
  appointment: IAppointment | null | undefined;
  isStartingConsultation: boolean;
  onStartConsultation: () => void;
  currentDoctorId?: string;
}

export const IncompleteConsultationModal = ({
  open,
  onClose,
  appointment,
  isStartingConsultation,
  onStartConsultation,
  currentDoctorId,
}: IncompleteConsultationModalProps): JSX.Element => {
  const isSameDoctor = currentDoctorId === appointment?.doctor?.id;

  return (
    <Modal
      setState={onClose}
      open={open}
      content={
        <div className="space-y-6 p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-amber-100 p-4 text-amber-600">
              <AlertCircle className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isSameDoctor ? 'Incomplete Consultation' : 'Consultation In Progress'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {isSameDoctor ? (
                  <>
                    This consultation is currently in{' '}
                    <span className="font-semibold capitalize">
                      {appointment?.status.replace('_', ' ')}
                    </span>{' '}
                    status. You can continue where you left off to complete the patient&#39;s
                    medical review.
                  </>
                ) : (
                  <>
                    This consultation was initiated by{' '}
                    <span className="font-semibold">
                      Dr. {appointment?.doctor?.firstName} {appointment?.doctor?.lastName}
                    </span>{' '}
                    and is currently{' '}
                    <span className="font-semibold capitalize">
                      {appointment?.status.replace('_', ' ')}
                    </span>
                    {'. '}
                    Only the doctor who started this consultation can complete it.
                  </>
                )}
              </p>
            </div>
          </div>

          <Alert variant="info" className="border-blue-200 bg-blue-50">
            <ClipboardList className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {isSameDoctor ? (
                <>
                  You can continue this consultation to complete the patient&#39;s medical review,
                  add diagnoses, and prescribe treatments.
                </>
              ) : (
                <>
                  You can view the consultation details below, but you cannot modify or complete
                  this consultation as it was initiated by another doctor.
                </>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
              child={<span>View Details</span>}
            />
            {isSameDoctor && (
              <Button
                variant="default"
                onClick={onStartConsultation}
                isLoading={isStartingConsultation}
                disabled={isStartingConsultation}
                className="w-full sm:w-auto"
                child={
                  <>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    <span>
                      {appointment?.status === AppointmentStatus.Progress
                        ? 'Continue Consultation'
                        : 'Start Consultation'}
                    </span>
                  </>
                }
              />
            )}
          </div>
        </div>
      }
      showClose={true}
    />
  );
};
