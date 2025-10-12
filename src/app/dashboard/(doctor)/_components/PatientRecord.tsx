'use client';
import { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import PatientCard from '@/app/dashboard/_components/patient/patientCard';
import PatientVitalsCard from '@/app/dashboard/_components/patient/patientVitalsCard';
import PatientConditionsCard from '@/app/dashboard/_components/patient/patientConditionsCard';
import PatientSurgeriesCard from '@/app/dashboard/_components/patient/patientSurgeriesCard';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';
import PatientFamilyMembersCard from '@/app/dashboard/_components/patient/PatientFamilyMembersCard';
import PatientLifestyleCard from '@/app/dashboard/_components/patient/patientLifestyleCard';
import PatientAllergiesCard from '@/app/dashboard/_components/patient/patientAllergiesCard';
import { useParams, useRouter } from 'next/navigation';
import { useQueryParam } from '@/hooks/useQueryParam';
import { setConsultationStatus } from '@/lib/features/appointments/consultation/consultationThunk';
import { ConsultationStatus } from '@/types/consultation.interface';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { useToast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';

const PatientOverview = (): JSX.Element => {
  const recordId = useAppSelector(selectRecordId);
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { getQueryParam } = useQueryParam();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isStartingConsultation, setIsStartingConsultation] = useState(false);

  const redirectToConsultation = async (): Promise<void> => {
    const appointmentId = getQueryParam('appointmentId');
    if (!appointmentId) {
      return;
    }

    setIsStartingConsultation(true);
    const result = await dispatch(
      setConsultationStatus({
        appointmentId,
        status: ConsultationStatus.Progress,
      }),
    ).unwrap();

    if (!showErrorToast(result)) {
      router.push(`/dashboard/consultation/${patientId}/${appointmentId}`);
    }
    toast(result);
  };

  return (
    <div className="relative">
      {isStartingConsultation && <LoadingOverlay message="Starting consultation..." />}

      <div className="mb-6 flex flex-wrap gap-8 sm:justify-between">
        <span className="self-center text-xl font-bold">Patient Overview</span>
        {getQueryParam('appointmentId') && (
          <div className="space-x-3">
            <Button child="Refer to Specialist" variant="secondary" />
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
          <PatientCard />
          <PatientSurgeriesCard recordId={recordId} />
          <PatientAllergiesCard recordId={recordId} />
        </div>
        <div className="space-y-4">
          <PatientVitalsCard />
          <PatientFamilyMembersCard recordId={recordId} />
        </div>
        <div className="space-y-4">
          <PatientConditionsCard recordId={recordId} />
          <PatientLifestyleCard />
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;
