'use client';
import { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/hooks';
import { useParams, useRouter } from 'next/navigation';
import { useQueryParam } from '@/hooks/useQueryParam';
import { startConsultation } from '@/lib/features/appointments/consultation/consultationThunk';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import ExpiredConsultationView from './ExpiredConsultationView';
import { FileText } from 'lucide-react';
import PatientConsultationHistory from './PatientConsultationHistory';
import ConsultationViewSheet from './ConsultationViewSheet';

const PatientOverview = (): JSX.Element => {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { getQueryParam } = useQueryParam();
  const dispatch = useAppDispatch();
  const [isStartingConsultation, setIsStartingConsultation] = useState(false);
  const [consultationExpired, setConsultationExpired] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [showConsultationSheet, setShowConsultationSheet] = useState(false);

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
      {isStartingConsultation && <LoadingOverlay message="Loading consultation..." />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="self-center text-xl font-bold">Patient Record</span>
        {getQueryParam('appointmentId') && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleViewPastConsultation}
              variant="outline"
              child={
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  View Consultation
                </>
              }
            />
            <Button
              onClick={redirectToConsultation}
              child="Start Consultation"
              disabled={isStartingConsultation}
            />
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
