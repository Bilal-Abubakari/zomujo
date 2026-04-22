'use client';

import React, { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Calendar, FlaskConical, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SlotSelectionModal } from '@/components/ui/slotSelectionModal';
import { useAppDispatch } from '@/lib/hooks';
import { rescheduleAppointment } from '@/lib/features/appointments/appointmentsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { IBookingForm } from '@/types/booking.interface';
import { IConsultationDetails } from '@/types/consultation.interface';
import { BRANDING } from '@/constants/branding.constant';
import { bookingSchema } from '@/schemas/booking.schema';

interface PostInvestigationSchedulerProps {
  consultationDetails: IConsultationDetails;
  appointmentId: string;
  onScheduled?: () => void;
}

const STEPS = [
  'Complete the requested lab tests or scans (check the investigations section below)',
  'Come back here and click the button below to schedule your follow-up visit',
  'Attend your follow-up so your doctor can review results and continue your care',
] as const;

const PostInvestigationScheduler = ({
  consultationDetails,
  appointmentId,
  onScheduled,
}: PostInvestigationSchedulerProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const { register, setValue, watch, reset } = useForm<IBookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      reason: 'Post investigation follow-up',
      appointmentType: 'doctor',
      additionalInfo: '',
    },
  });

  const doctorName = `${consultationDetails.doctor.firstName} ${consultationDetails.doctor.lastName}`;
  const doctorId = consultationDetails.doctor.id;
  const doctorProfilePicture = consultationDetails.doctor.profilePicture ?? '';

  const handleSchedule = async (): Promise<void> => {
    const slotId = watch('slotId');
    if (!slotId) {
      return;
    }

    setIsScheduling(true);
    const { payload } = await dispatch(rescheduleAppointment({ slotId, appointmentId }));

    if (payload && showErrorToast(payload)) {
      toast(payload as Toast);
      setIsScheduling(false);
      return;
    }

    toast(payload as Toast);
    setIsScheduling(false);
    setIsModalOpen(false);
    reset();
    onScheduled?.();
  };

  const handleContactSupport = (): void => {
    globalThis.location.href = `mailto:${BRANDING.SUPPORT_EMAIL}?subject=No available appointment slots - Post Investigation Follow-up&body=Hello Support,%0D%0A%0D%0AI completed my investigations for consultation ID: ${appointmentId} but my doctor has no available appointment slots for a post-investigation follow-up.%0D%0A%0D%0APlease assist me with scheduling.%0D%0A%0D%0AThank you.`;
  };

  return (
    <>
      <Card className="overflow-hidden border-2 border-amber-300 bg-amber-50 shadow-md">
        <CardContent className="p-0">
          {/* Header Banner */}
          <div className="flex items-center gap-3 bg-amber-400 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow">
              <FlaskConical className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-900">
                Investigation in Progress — Action Required
              </h3>
              <p className="text-xs text-amber-800">
                Your doctor has placed this consultation under investigation
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-5 p-6">
            {/* Explanation */}
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-white p-4 shadow-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-800">
                  What does &ldquo;Under Investigation&rdquo; mean?
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  Your doctor, <span className="font-semibold">Dr. {doctorName}</span>, has
                  requested further tests or examinations (such as lab tests or scans) before
                  completing your treatment. This is a normal part of your care — it helps your
                  doctor make the most accurate diagnosis possible.
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  Once you have completed your investigations (e.g. gone for your lab tests or
                  scans), you need to{' '}
                  <span className="font-semibold text-amber-700">
                    schedule a follow-up consultation
                  </span>{' '}
                  so your doctor can review the results and continue your treatment.
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                What you need to do
              </p>
              <ol className="space-y-2">
                {STEPS.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="flex w-full items-center gap-2 sm:w-auto"
                child={
                  <>
                    <Calendar className="h-4 w-4" />
                    Schedule My Follow-Up Visit
                  </>
                }
              />
              <Button
                variant="ghost"
                onClick={handleContactSupport}
                className="flex w-full items-center gap-2 text-gray-500 hover:text-gray-700 sm:w-auto"
                child={
                  <>
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </>
                }
              />
            </div>

            <p className="text-xs text-gray-400">
              Having trouble? Email us at{' '}
              <a
                href={`mailto:${BRANDING.SUPPORT_EMAIL}`}
                className="text-primary underline underline-offset-2"
              >
                {BRANDING.SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <SlotSelectionModal
        open={isModalOpen}
        onCloseAction={() => {
          setIsModalOpen(false);
          reset();
        }}
        onConfirmAction={handleSchedule}
        isLoading={isScheduling}
        doctorId={doctorId}
        doctorName={doctorName}
        doctorProfilePicture={doctorProfilePicture}
        registerAction={register}
        setValueAction={setValue}
        watch={watch}
        title="Schedule Your Follow-Up Visit"
        confirmButtonText="Confirm Follow-Up"
        noSlotsMessage={<NoSlotsMessage onContactSupport={handleContactSupport} />}
      />
    </>
  );
};

type NoSlotsMessageProps = {
  onContactSupport: () => void;
};

const NoSlotsMessage = ({ onContactSupport }: NoSlotsMessageProps): JSX.Element => (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
    <FlaskConical className="mx-auto mb-2 h-8 w-8 text-amber-500" />
    <p className="mb-1 text-sm font-semibold text-gray-800">No appointment slots available</p>
    <p className="mb-3 text-xs text-gray-500">
      Your doctor currently has no available slots. Please contact our support team and we will help
      you arrange your follow-up visit.
    </p>
    <Button
      size="sm"
      variant="outline"
      onClick={onContactSupport}
      child={
        <>
          <Mail className="mr-1 h-3.5 w-3.5" />
          Contact Support at {BRANDING.SUPPORT_EMAIL}
        </>
      }
    />
  </div>
);

export default PostInvestigationScheduler;
