'use client';

import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Building2,
  CalendarCheck,
  Download,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  Share2,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleProvider } from '@/app/dashboard/_components/providers/roleProvider';
import { Role } from '@/types/shared.enum';
import {
  IConsultationDetails,
  IExternalReferralRequest,
  IInternalReferralResponse,
} from '@/types/consultation.interface';
import { useAppDispatch } from '@/lib/hooks';
import { showReviewModal } from '@/lib/features/appointments/appointmentsSlice';
import {
  downloadLabRequestPdf,
  downloadRadiologyRequestPdf,
  downloadReferralLetter,
  generateExternalReferralPdf,
  getConsultationDetail,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import useWebSocket from '@/hooks/useWebSocket';
import {
  INotification,
  NotificationEvent,
  NotificationTopic,
} from '@/types/notification.interface';
import { capitalize, downloadBlob, showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';
import { ConsultationHeader } from './ConsultationHeader';
import { HistoryNotesSection } from './HistoryNotesSection';
import { PrescriptionsSection } from './PrescriptionsSection';
import { LabRequestsSection } from './LabRequestsSection';
import { RadiologyRequestsSection } from './RadiologyRequestsSection';
import { Separator } from '@radix-ui/react-menu';
import PostInvestigationScheduler from './PostInvestigationScheduler';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { getFormattedDate, getTimeFromDateStamp } from '@/lib/date';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IDoctor } from '@/types/doctor.interface';
import { doctorInfo } from '@/lib/features/doctors/doctorsThunk';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import BookingModals from '@/components/doctor/BookingModals';

const notificationsToRefetch = new Set<NotificationTopic>([
  NotificationTopic.LabRequest,
  NotificationTopic.PrescriptionGenerated,
  NotificationTopic.RadiologyRequest,
  NotificationTopic.ConsultationUpdate,
  NotificationTopic.ConsultationCompleted,
]);

// ── Internal Referral Booking Card ─────────────────────────────────────────

interface InternalReferralBookingCardProps {
  referral: IInternalReferralResponse;
  downloadingReferral: string | null;
  onDownloadReferral: (referralId: string, doctorName: string) => void;
}

const InternalReferralBookingCard = ({
  referral,
  downloadingReferral,
  onDownloadReferral,
}: InternalReferralBookingCardProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(false);

  const fullName = doctor ? `${doctor.firstName} ${doctor.lastName}` : '';
  const hasSlots = (doctor?.appointmentSlots?.length ?? 0) > 0;

  const {
    showSlots,
    setShowSlots,
    showPreview,
    setShowPreview,
    isInitiatingPayment,
    register,
    setValue,
    watch,
    handleContinueBooking,
    handleConfirmAndPay,
  } = useBookingFlow({ doctorId: referral.referredDoctorId, fullName });

  useEffect(() => {
    if (!referral.referredDoctorId) {
      return;
    }

    const fetchDoctor = async (): Promise<void> => {
      setIsLoadingDoctor(true);
      const payload = await dispatch(doctorInfo(referral.referredDoctorId)).unwrap();
      if (!showErrorToast(payload)) {
        setDoctor(payload as IDoctor);
      }
      setIsLoadingDoctor(false);
    };
    void fetchDoctor();
  }, [referral.referredDoctorId, dispatch]);

  return (
    <>
      {doctor && (
        <BookingModals
          showSlots={showSlots}
          setShowSlots={setShowSlots}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          isInitiatingPayment={isInitiatingPayment}
          doctor={doctor}
          doctorId={doctor.id}
          register={register}
          setValue={setValue}
          watch={watch}
          handleContinueBooking={handleContinueBooking}
          handleConfirmAndPay={handleConfirmAndPay}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-blue-100 bg-linear-to-br from-blue-50/60 to-white shadow-sm">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-linear-to-r from-blue-400 to-blue-600" />

        <div className="p-4">
          {isLoadingDoctor ? (
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-100">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-blue-200" />
                <div className="h-3 w-28 animate-pulse rounded bg-blue-100" />
                <div className="h-3 w-20 animate-pulse rounded bg-blue-100" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Doctor info */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="h-14 w-14 shrink-0 border-2 border-blue-200 shadow">
                  <AvatarImage src={doctor?.profilePicture || ''} className="object-cover" />
                  <AvatarFallback className="bg-blue-100 text-lg font-bold text-blue-700">
                    {doctor ? `${doctor.firstName[0]}${doctor.lastName[0]}` : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-bold text-gray-900">
                      {doctor ? `Dr. ${fullName}` : 'Doctor'}
                    </p>
                    {hasSlots && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        {''}
                        Available
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-gray-500">
                    {doctor?.specializations?.[0]
                      ? capitalize(doctor.specializations[0])
                      : 'General Practitioner'}{' '}
                    · Zomujo Platform
                  </p>
                  {doctor?.experience && (
                    <p className="text-xs text-gray-400">{doctor.experience} yrs experience</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {referral.appointmentId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onDownloadReferral(referral.appointmentId, fullName || 'referral')
                    }
                    disabled={downloadingReferral === referral.appointmentId}
                    isLoading={downloadingReferral === referral.appointmentId}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    child={
                      <>
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Referral Letter
                      </>
                    }
                  />
                )}
                <Button
                  size="sm"
                  onClick={() => setShowSlots(true)}
                  disabled={!hasSlots || !doctor}
                  title={hasSlots ? 'Book an appointment' : 'No available slots'}
                  className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  child={
                    <>
                      <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />
                      {hasSlots ? 'Book Appointment' : 'No Slots Available'}
                    </>
                  }
                />
              </div>
            </div>
          )}

          {referral.letter && (
            <div className="mt-3 flex items-start gap-1.5 border-t border-blue-100 pt-3 text-xs text-gray-600 italic">
              <MessageSquare className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
              <span>&quot;{referral.letter}&quot;</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── External Referral Card ──────────────────────────────────────────────────

interface ExternalReferralCardProps {
  referral: IExternalReferralRequest;
  isGeneratingLetter: boolean;
  onGenerateLetter: () => void;
}

const ExternalReferralCard = ({
  referral,
  isGeneratingLetter,
  onGenerateLetter,
}: ExternalReferralCardProps): JSX.Element => (
  <div className="overflow-hidden rounded-xl border border-amber-100 bg-linear-to-br from-amber-50/60 to-white shadow-sm">
    {/* Top accent bar */}
    <div className="h-1 w-full bg-linear-to-r from-amber-400 to-amber-600" />

    <div className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Facility info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-100 shadow">
            <Building2 className="h-6 w-6 text-amber-700" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-gray-900">
              {referral.doctorName || 'External Doctor'}
            </p>
            {referral.facility && (
              <div className="mt-0.5 flex items-center gap-1">
                <Building2 className="h-3 w-3 shrink-0 text-amber-600" />
                <p className="truncate text-sm text-gray-500">{referral.facility}</p>
              </div>
            )}
            {referral.email && (
              <div className="mt-0.5 flex items-center gap-1">
                <Mail className="h-3 w-3 shrink-0 text-gray-400" />
                <p className="truncate text-xs text-gray-400">{referral.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Generate letter action */}
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={onGenerateLetter}
            disabled={isGeneratingLetter}
            isLoading={isGeneratingLetter}
            className="gap-1.5 bg-amber-500 text-white shadow-sm hover:bg-amber-600 disabled:opacity-70"
            child={
              <>
                {!isGeneratingLetter && <Download className="h-3.5 w-3.5" />}
                {isGeneratingLetter ? 'Generating…' : 'Generate Referral Letter'}
              </>
            }
          />
        </div>
      </div>

      {referral.notes && (
        <div className="mt-3 flex items-start gap-1.5 border-t border-amber-100 pt-3 text-xs text-gray-600 italic">
          <MessageSquare className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
          <span>&quot;{referral.notes}&quot;</span>
        </div>
      )}
    </div>
  </div>
);

// ── Patient Referrals Section ───────────────────────────────────────────────

interface PatientReferralsSectionProps {
  referral: IInternalReferralResponse | null | undefined;
  referralData: IExternalReferralRequest | null | undefined;
  downloadingReferral: string | null;
  onDownloadReferral: (referralId: string, doctorName: string) => void;
  isGeneratingExternalLetter: boolean;
  onGenerateExternalLetter: () => void;
}

const PatientReferralsSection = ({
  referral,
  referralData,
  downloadingReferral,
  onDownloadReferral,
  isGeneratingExternalLetter,
  onGenerateExternalLetter,
}: PatientReferralsSectionProps): JSX.Element => {
  const hasAny = !!(referral || referralData);
  const totalCount = (referral ? 1 : 0) + (referralData ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl font-semibold">
          <div className="flex items-center gap-2">
            <Share2 className="text-primary h-5 w-5" />
            Referrals
          </div>
          {hasAny && (
            <Badge variant="secondary" className="px-2 py-1">
              {totalCount} {totalCount === 1 ? 'Referral' : 'Referrals'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {!hasAny && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Share2 className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No referrals issued</p>
            <p className="mt-1 text-xs text-gray-400">
              Your doctor has not issued any referrals for this consultation.
            </p>
          </div>
        )}

        {/* Internal Referral */}
        {referral && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                Platform Referrals · Book directly on Zomujo
              </span>
            </div>
            <InternalReferralBookingCard
              key={referral.referredDoctorId}
              referral={referral}
              downloadingReferral={downloadingReferral}
              onDownloadReferral={onDownloadReferral}
            />
          </div>
        )}

        {/* External Referral */}
        {referralData && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
                External Referrals
              </span>
            </div>
            <ExternalReferralCard
              referral={referralData}
              isGeneratingLetter={isGeneratingExternalLetter}
              onGenerateLetter={onGenerateExternalLetter}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── Main View ──────────────────────────────────────────────────────────────

const PatientConsultationView = (): JSX.Element => {
  const { on } = useWebSocket();
  const endRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();

  const [consultationDetails, setConsultationDetails] = useState<IConsultationDetails>();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [downloadingLabRequest, setDownloadingLabRequest] = useState(false);
  const [downloadingRadiologyRequest, setDownloadingRadiologyRequest] = useState(false);
  const [downloadingReferral, setDownloadingReferral] = useState<string | null>(null);
  const [generatingExternalReferral, setGeneratingExternalReferral] = useState(false);

  const handleDownloadLabRequest = async (): Promise<void> => {
    const consultationId = params.consultationId as string;
    if (!consultationId) {
      return;
    }

    setDownloadingLabRequest(true);
    const payload = await dispatch(downloadLabRequestPdf(consultationId)).unwrap();

    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setDownloadingLabRequest(false);
      return;
    }
    downloadBlob(payload as Blob, `lab-request-${consultationId}.pdf`);

    setDownloadingLabRequest(false);
  };

  const handleDownloadRadiologyRequest = async (): Promise<void> => {
    const consultationId = params.consultationId as string;
    if (!consultationId) {
      return;
    }

    setDownloadingRadiologyRequest(true);
    const payload = await dispatch(downloadRadiologyRequestPdf(consultationId)).unwrap();

    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setDownloadingRadiologyRequest(false);
      return;
    }
    downloadBlob(payload as Blob, `radiology-request-${consultationId}.pdf`);

    setDownloadingRadiologyRequest(false);
  };

  const handleDownloadReferral = async (referralId: string, doctorName: string): Promise<void> => {
    const consultationId = params.consultationId as string;
    if (!consultationId || !referralId) {
      return;
    }

    setDownloadingReferral(referralId);
    const payload = await dispatch(
      downloadReferralLetter({ appointmentId: consultationId, referralId }),
    ).unwrap();

    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setDownloadingReferral(null);
      return;
    }
    downloadBlob(payload as Blob, `referral-letter-${doctorName}.pdf`);
    setDownloadingReferral(null);
  };

  const handleDownloadExternalReferral = async (): Promise<void> => {
    const consultationId = params.consultationId as string;
    if (!consultationId) {
      return;
    }

    setGeneratingExternalReferral(true);
    const payload = await dispatch(generateExternalReferralPdf(consultationId)).unwrap();

    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setGeneratingExternalReferral(false);
      return;
    }
    const doctorName = consultationDetails?.referralData?.doctorName ?? 'external-referral';
    const link = document.createElement('a');
    link.href = payload as string;
    link.download = `referral-letter-${doctorName}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setGeneratingExternalReferral(false);
  };

  const fetchConsultation = useCallback(
    async (scroll = false): Promise<void> => {
      setLoading(true);
      const consultationId = params.consultationId as string;
      if (!consultationId) {
        setLoading(false);
        return;
      }
      const { payload } = await dispatch(getConsultationDetail(consultationId));
      if (showErrorToast(payload)) {
        toast(payload as Toast);
        setLoading(false);
        return;
      }
      setConsultationDetails(payload as IConsultationDetails);
      setLoading(false);

      if (scroll) {
        requestAnimationFrame(() => {
          endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
      }
    },
    [dispatch, params.consultationId],
  );

  on(NotificationEvent.NewNotification, (data: unknown) => {
    const { payload } = data as INotification;
    if (notificationsToRefetch.has(payload.topic)) {
      const shouldScroll = payload.topic !== NotificationTopic.PrescriptionGenerated;
      void fetchConsultation(shouldScroll);

      if (payload.topic === NotificationTopic.ConsultationUpdate) {
        const appointmentId = params.consultationId as string;
        if (appointmentId) {
          dispatch(showReviewModal({ appointmentId }));
        }
      }
    }
  });

  useEffect(() => {
    void fetchConsultation();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-8">
        {/* Skeleton for Consultation Details */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Skeleton className="mb-2 h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skeleton for Prescriptions */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-4 w-64" />
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>

        {/* Skeleton for Lab Requests */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="mb-1 h-3 w-40" />
                  <Skeleton className="mb-2 h-3 w-56" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Separator className="mt-6" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skeleton for Radiology Requests */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="mb-1 h-3 w-40" />
              <Skeleton className="mb-2 h-3 w-56" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleProvider role={Role.Patient}>
      <div className="space-y-8 p-4 md:p-8">
        <ConsultationHeader consultationDetails={consultationDetails} />

        {consultationDetails?.status === AppointmentStatus.Investigating && (
          <PostInvestigationScheduler
            consultationDetails={consultationDetails}
            appointmentId={params.consultationId as string}
            onScheduled={() => void fetchConsultation()}
          />
        )}

        {consultationDetails?.status === AppointmentStatus.InvestigatingScheduled && (
          <Card className="overflow-hidden border-2 border-green-300 bg-green-50 shadow-md">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 bg-green-400 px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow">
                  <CalendarCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-green-900">
                    Post-Investigation Follow-Up Scheduled
                  </h3>
                  <p className="text-xs text-green-800">
                    Your follow-up consultation has been successfully booked
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  Great news! Your post-investigation follow-up has been scheduled. Please attend
                  your appointment so your doctor can review your investigation results and continue
                  your treatment.
                </p>
                <div className="flex flex-col gap-3 rounded-lg border border-green-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                  <CalendarCheck className="h-5 w-5 shrink-0 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Appointment Date &amp; Time
                    </p>
                    <p className="text-sm text-gray-600">
                      {getFormattedDate(consultationDetails.slot.date)} at{' '}
                      {getTimeFromDateStamp(consultationDetails.slot.startTime)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <HistoryNotesSection consultationDetails={consultationDetails} />

        <PrescriptionsSection consultationDetails={consultationDetails} />

        <LabRequestsSection
          consultationDetails={consultationDetails}
          onDownloadRequest={handleDownloadLabRequest}
          downloadingRequest={downloadingLabRequest}
        />

        {/* Radiology Requests Section */}
        <RadiologyRequestsSection
          consultationDetails={consultationDetails}
          onDownloadRequest={handleDownloadRadiologyRequest}
          downloadingRequest={downloadingRadiologyRequest}
        />

        <PatientReferralsSection
          referral={consultationDetails?.referral}
          referralData={consultationDetails?.referralData}
          downloadingReferral={downloadingReferral}
          onDownloadReferral={handleDownloadReferral}
          isGeneratingExternalLetter={generatingExternalReferral}
          onGenerateExternalLetter={() => void handleDownloadExternalReferral()}
        />
      </div>
      <div ref={endRef} />
    </RoleProvider>
  );
};

export default PatientConsultationView;
