'use client';
import React, { JSX, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ClockFading } from 'lucide-react';
import { capitalize, cn, showErrorToast } from '@/lib/utils';
import Symptoms from '@/app/dashboard/(doctor)/consultation/_components/symptoms';
import Labs from '@/app/dashboard/(doctor)/consultation/_components/labs';
import DiagnosePrescribe from '@/app/dashboard/(doctor)/consultation/_components/diagnosePrescribe';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getConsultationAppointment } from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams } from 'next/navigation';
import { selectIsLoading } from '@/lib/features/appointments/appointmentSelector';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { getPatientRecords } from '@/lib/features/records/recordsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import ReviewConsultation from '@/app/dashboard/(doctor)/consultation/_components/ReviewConsultation';

const stages = ['symptoms', 'labs', 'diagnose & prescribe', 'review'];

type StageType = (typeof stages)[number];

const Consultation = (): JSX.Element => {
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [currentStage, setCurrentStage] = useState<StageType>(stages[0]);
  const [update, setUpdate] = useState(false);
  const dispatch = useAppDispatch();
  const isLoadingAppointment = useAppSelector(selectIsLoading);
  const params = useParams();

  const getStage = (): JSX.Element => {
    switch (currentStage) {
      case 'labs':
        return (
          <Labs
            goToDiagnoseAndPrescribe={() => setCurrentStage(stages[2])}
            updateLabs={update}
            setUpdateLabs={setUpdate}
          />
        );
      case 'diagnose & prescribe':
        return (
          <DiagnosePrescribe
            goToReview={() => setCurrentStage(stages[3])}
            updateDiagnosis={update}
            setUpdateDiagnosis={setUpdate}
          />
        );
      case 'review':
        return <ReviewConsultation />;
      default:
        return <Symptoms goToLabs={() => setCurrentStage(stages[1])} />;
    }
  };

  const fetchPatientRecords = async (): Promise<void> => {
    setIsLoadingRecords(true);
    const { payload } = await dispatch(getPatientRecords(String(params.patientId)));
    if (showErrorToast(payload)) {
      toast(payload as Toast);
    }
    setIsLoadingRecords(false);
  };

  useEffect(() => {
    void fetchPatientRecords();
    dispatch(getConsultationAppointment(String(params.appointmentId)));
  }, []);

  return (
    <div className="rounded-2xl border border-gray-300 px-6 py-8">
      {(isLoadingAppointment || isLoadingRecords) && <LoadingOverlay />}
      <div className="flex items-center gap-3">
        <span>Consultation</span>
        <Badge className="px-3 py-1.5" variant="brown">
          <ClockFading className="mr-1" />
          In-progress
        </Badge>
      </div>
      <div
        className={cn(
          update || isLoadingAppointment
            ? 'mb-8 border-t border-b border-gray-300 bg-gray-100 py-6 font-bold text-gray-500'
            : 'sticky top-0 z-50 mb-8 border-t border-b border-gray-300 bg-gray-100 py-6 font-bold text-gray-500',
        )}
        id="clip"
      >
        {stages.map((stage, index) => (
          <button
            onClick={() => setCurrentStage(stage)}
            key={stage}
            className={cn(
              index === 0 || index === stages.length - 1 ? '' : 'in-between',
              index === stages.length - 1 && 'last-crumb rounded-r-4xl',
              index === 0 && 'first-crumb rounded-l-4xl',
              'cursor-pointer',
              currentStage === stage || stages.indexOf(currentStage) > stages.indexOf(stage)
                ? 'bg-primary-light text-primary'
                : 'bg-gray-200',
              'inline-block px-8 py-[18px]',
            )}
          >
            {capitalize(stage)}
          </button>
        ))}
      </div>
      {getStage()}
    </div>
  );
};

export default Consultation;
