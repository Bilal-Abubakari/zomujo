'use client';
import React, { JSX, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ClockFading } from 'lucide-react';
import { capitalize, cn } from '@/lib/utils';
import Symptoms from '@/app/dashboard/(doctor)/consultation/_components/symptoms';
import Labs from '@/app/dashboard/(doctor)/consultation/_components/labs';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getConsultationAppointment } from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams } from 'next/navigation';
import { selectIsLoading } from '@/lib/features/appointments/appointmentSelector';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';

const stages = ['symptoms', 'labs', 'diagnose & prescribe', 'review'];

type StageType = (typeof stages)[number];

const Consultation = (): JSX.Element => {
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
            goToExamination={() => setCurrentStage(stages[2])}
            updateLabs={update}
            setUpdateLabs={setUpdate}
          />
        );
      case 'examination':
        return <div>Examination</div>;
      case 'diagnose & prescribe':
        return <div>Diagnose & Prescribe</div>;
      case 'review':
        return <div>Review</div>;
      default:
        return <Symptoms goToLabs={() => setCurrentStage(stages[1])} />;
    }
  };

  useEffect(() => {
    dispatch(getConsultationAppointment(String(params.appointmentId)));
  }, []);

  return (
    <div className="rounded-2xl border border-gray-300 px-6 py-8">
      {isLoadingAppointment && <LoadingOverlay />}
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
            : 'sticky top-0 z-100 mb-8 border-t border-b border-gray-300 bg-gray-100 py-6 font-bold text-gray-500',
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
              currentStage === stage ? 'bg-primary-light text-primary' : 'bg-gray-200',
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
