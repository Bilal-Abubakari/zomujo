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
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import ExpiredConsultationView from './ExpiredConsultationView';
import PatientConsultationHistory from './PatientConsultationHistory';
import ConsultationViewSheet from './ConsultationViewSheet';
import { selectCanStartConsultation } from '@/lib/features/appointments/appointmentSelector';

const PatientOverview = (): JSX.Element => {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { getQueryParam } = useQueryParam();
  const canStartConsultation = useAppSelector(selectCanStartConsultation);
  const dispatch = useAppDispatch();
  const [isStartingConsultation, setIsStartingConsultation] = useState(false);
  const [consultationExpired, setConsultationExpired] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [showConsultationSheet, setShowConsultationSheet] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);

  const redirectToConsultation = async (): Promise<void> => {
    const appointmentId = getQueryParam('appointmentId');
    if (!appointmentId) {
      return;
    }

    setIsStartingConsultation(true);
    await dispatch(startConsultation(appointmentId)).unwrap();
    router.push(`/dashboard/consultation/${patientId}/${appointmentId}`);
  };

  const handleViewPastConsultation = (): void => {
    const appointmentId = getQueryParam('appointmentId');
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
    const appointmentId = getQueryParam('appointmentId');
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

  const handleViewConsultation = (appointmentId: string): void => {
    setSelectedConsultationId(appointmentId);
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
        {getQueryParam('appointmentId') && (
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

      <PatientConsultationHistory
        patientId={patientId}
        onViewConsultation={handleViewConsultation}
        currentAppointmentId={getQueryParam('appointmentId') || undefined}
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
