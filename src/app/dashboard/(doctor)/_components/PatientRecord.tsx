'use client';
import { JSX, useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';
import { useParams, useRouter } from 'next/navigation';
import { useQueryParam } from '@/hooks/useQueryParam';
import { startConsultation } from '@/lib/features/appointments/consultation/consultationThunk';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { showErrorToast } from '@/lib/utils';
import ExpiredConsultationView from './ExpiredConsultationView';
import { FileText, Loader2 } from 'lucide-react';

const PatientCard = lazy(() => import('@/app/dashboard/_components/patient/patientCard'));
const PatientVitalsCard = lazy(
  () => import('@/app/dashboard/_components/patient/patientVitalsCard'),
);
const PatientConditionsCard = lazy(
  () => import('@/app/dashboard/_components/patient/patientConditionsCard'),
);
const PatientSurgeriesCard = lazy(
  () => import('@/app/dashboard/_components/patient/patientSurgeriesCard'),
);
const PatientFamilyMembersCard = lazy(
  () => import('@/app/dashboard/_components/patient/PatientFamilyMembersCard'),
);
const PatientLifestyleCard = lazy(
  () => import('@/app/dashboard/_components/patient/patientLifestyleCard'),
);
const PatientAllergiesCard = lazy(
  () => import('@/app/dashboard/_components/patient/patientAllergiesCard'),
);

const CardFallback = (): JSX.Element => (
  <div className="flex items-center justify-center rounded-lg border border-gray-200 p-8">
    <Loader2 className="animate-spin" size={24} />
  </div>
);

const PatientOverview = (): JSX.Element => {
  const recordId = useAppSelector(selectRecordId);
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { getQueryParam } = useQueryParam();
  const dispatch = useAppDispatch();
  const [isStartingConsultation, setIsStartingConsultation] = useState(false);
  const [consultationExpired, setConsultationExpired] = useState(false);

  const redirectToConsultation = async (): Promise<void> => {
    const appointmentId = getQueryParam('appointmentId');
    if (!appointmentId) {
      return;
    }

    setIsStartingConsultation(true);
    const result = await dispatch(startConsultation(appointmentId)).unwrap();
    if (!showErrorToast(result)) {
      router.push(`/dashboard/consultation/${patientId}/${appointmentId}`);
      return;
    }
    setConsultationExpired(true);
  };

  const handleViewPastConsultation = (): void => {
    const appointmentId = getQueryParam('appointmentId');
    if (appointmentId) {
      router.push(`/dashboard/consultation/review?appointmentId=${appointmentId}`);
    }
  };

  const handleGoBack = (): void => {
    setConsultationExpired(false);
    router.push('/dashboard/appointments');
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
      {isStartingConsultation && <LoadingOverlay message="Starting consultation..." />}

      <div className="mb-6 flex flex-wrap gap-8 sm:justify-between">
        <span className="self-center text-xl font-bold">Patient Overview</span>
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
            {/*TODO: Not planned for the MVP*/}
            {/*<Button child="Refer to Specialist" variant="secondary" />*/}
            <Button
              onClick={redirectToConsultation}
              child="Start Consultation"
              disabled={isStartingConsultation}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 justify-self-center md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        <div className="space-y-4">
          <Suspense fallback={<CardFallback />}>
            <PatientCard />
          </Suspense>
          <Suspense fallback={<CardFallback />}>
            <PatientSurgeriesCard recordId={recordId} />
          </Suspense>
          <Suspense fallback={<CardFallback />}>
            <PatientAllergiesCard recordId={recordId} />
          </Suspense>
        </div>
        <div className="space-y-4">
          <Suspense fallback={<CardFallback />}>
            <PatientVitalsCard />
          </Suspense>
          <Suspense fallback={<CardFallback />}>
            <PatientFamilyMembersCard recordId={recordId} />
          </Suspense>
        </div>
        <div className="space-y-4">
          <Suspense fallback={<CardFallback />}>
            <PatientConditionsCard recordId={recordId} />
          </Suspense>
          <Suspense fallback={<CardFallback />}>
            <PatientLifestyleCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;
