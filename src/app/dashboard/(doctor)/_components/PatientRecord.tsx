'use client';
import { JSX, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useParams, useRouter } from 'next/navigation';
import { useQueryParam } from '@/hooks/useQueryParam';
import {
  getConsultationAppointment,
  startConsultation,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { linkAppointment, unlinkAppointment } from '@/lib/features/appointments/appointmentsThunk';
import { updateAppointmentLinkId } from '@/lib/features/appointments/appointmentsSlice';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import ExpiredConsultationView from './ExpiredConsultationView';
import PatientConsultationHistory from './PatientConsultationHistory';
import ConsultationViewSheet from './ConsultationViewSheet';
import FollowUpLinkingBanner from './FollowUpLinkingBanner';
import {
  selectCanStartConsultation,
  selectAppointmentDoctorId,
  selectAppointmentLinkId,
  selectIsFollowUp,
  hasConsultationEnded,
} from '@/lib/features/appointments/appointmentSelector';
import { toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { IAppointment } from '@/types/appointment.interface';
import axios from '@/lib/axios';
import { IResponse } from '@/types/shared.interface';

const PatientOverview = (): JSX.Element => {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { getQueryParam } = useQueryParam();
  const canStartConsultation = useAppSelector(selectCanStartConsultation);
  const doctorId = useAppSelector(selectAppointmentDoctorId);
  const appointmentLinkId = useAppSelector(selectAppointmentLinkId);
  const isFollowUp = useAppSelector(selectIsFollowUp);
  const isConsultationCompleted = useAppSelector(hasConsultationEnded);
  const dispatch = useAppDispatch();
  const [isStartingConsultation, setIsStartingConsultation] = useState(false);
  const [consultationExpired, setConsultationExpired] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [showConsultationSheet, setShowConsultationSheet] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [linkedAppointment, setLinkedAppointment] = useState<IAppointment | null>(null);

  const appointmentId = getQueryParam('appointmentId');

  const redirectToConsultation = async (): Promise<void> => {
    if (!appointmentId) {
      return;
    }

    setIsStartingConsultation(true);
    await dispatch(startConsultation(appointmentId)).unwrap();
    router.push(`/dashboard/consultation/${patientId}/${appointmentId}`);
  };

  const handleViewPastConsultation = (): void => {
    if (appointmentId) {
      router.push(`/dashboard/consultation/review?appointmentId=${appointmentId}`);
    }
  };

  const handleGoBack = (): void => {
    setConsultationExpired(false);
    router.push('/dashboard/appointment');
  };

  const fetchConsultation = async (): Promise<void> => {
    setIsLoadingConsultation(true);
    if (!appointmentId) {
      setIsLoadingConsultation(false);
      return;
    }
    await dispatch(getConsultationAppointment(appointmentId));
    setIsLoadingConsultation(false);
  };

  useEffect(() => {
    void fetchConsultation();
  }, [getQueryParam]);

  useEffect(() => {
    if (!appointmentLinkId) {
      setLinkedAppointment(null);
      return;
    }
    const fetchLinked = async (): Promise<void> => {
      try {
        const { data } = await axios.get<IResponse<IAppointment>>(
          `appointments/${appointmentLinkId}`,
        );
        setLinkedAppointment(data.data);
      } catch {
        setLinkedAppointment(null);
      }
    };
    void fetchLinked();
  }, [appointmentLinkId]);

  const handleLink = async (linkedAppointmentId: string): Promise<void> => {
    if (!appointmentId) {
      return;
    }
    setIsLinking(true);
    const result = await dispatch(
      linkAppointment({ appointmentId, appointmentLinkId: linkedAppointmentId }),
    ).unwrap();
    toast(result);
    if (!showErrorToast(result)) {
      dispatch(updateAppointmentLinkId(linkedAppointmentId));
    }
    setIsLinking(false);
  };

  const handleUnlink = async (): Promise<void> => {
    if (!appointmentId || !appointmentLinkId) {
      return;
    }
    setIsUnlinking(true);
    const result = await dispatch(unlinkAppointment({ appointmentId, appointmentLinkId })).unwrap();
    toast(result);
    if (!showErrorToast(result)) {
      dispatch(updateAppointmentLinkId(null));
    }
    setIsUnlinking(false);
  };

  const handleViewConsultation = (id: string): void => {
    setSelectedConsultationId(id);
    setShowConsultationSheet(true);
  };

  if (consultationExpired) {
    return (
      <ExpiredConsultationView
        onViewPastConsultation={handleViewPastConsultation}
        onGoBack={handleGoBack}
      />
    );
  }

  return (
    <div className="relative">
      {(isStartingConsultation || isLoadingConsultation) && (
        <LoadingOverlay message="Loading consultation..." />
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="self-center text-xl font-bold">Patient Record</span>
        {appointmentId && (
          <div className="flex flex-wrap gap-3">
            {canStartConsultation && (
              <Button
                onClick={redirectToConsultation}
                child="Start Consultation"
                disabled={isStartingConsultation}
              />
            )}
          </div>
        )}
      </div>

      {appointmentId && (
        <FollowUpLinkingBanner
          linkedAppointment={linkedAppointment}
          onUnlink={handleUnlink}
          isUnlinking={isUnlinking}
          isConsultationCompleted={isConsultationCompleted}
        />
      )}

      <PatientConsultationHistory
        patientId={patientId}
        onViewConsultation={handleViewConsultation}
        onViewLinkedConsultation={handleViewConsultation}
        currentAppointmentId={appointmentId || undefined}
        doctorId={doctorId}
        isFollowUp={isFollowUp}
        appointmentLinkId={appointmentLinkId}
        onLink={handleLink}
        onUnlink={handleUnlink}
        isLinking={isLinking}
        isUnlinking={isUnlinking}
        isConsultationCompleted={isConsultationCompleted}
      />

      {/* Consultation View Modal */}
      <ConsultationViewSheet
        open={showConsultationSheet}
        onOpenChange={setShowConsultationSheet}
        appointmentId={selectedConsultationId}
      />
    </div>
  );
};

export default PatientOverview;
