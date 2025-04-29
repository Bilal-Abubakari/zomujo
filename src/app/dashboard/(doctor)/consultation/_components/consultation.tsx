'use client';
import React, { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { ClockFading } from 'lucide-react';
import { capitalize, cn } from '@/lib/utils';
import Symptoms from '@/app/dashboard/(doctor)/consultation/_components/symptoms';

const stages = ['symptoms', 'labs', 'examination', 'diagnose & prescribe', 'review'];

type StageType = (typeof stages)[number];

const Consultation = (): JSX.Element => {
  const [currentStage, setCurrentStage] = React.useState<StageType>('symptoms');

  const getStage = (): JSX.Element => {
    switch (currentStage) {
      case 'labs':
        return <div>Labs</div>;
      case 'examination':
        return <div>Examination</div>;
      case 'diagnose & prescribe':
        return <div>Diagnose & Prescribe</div>;
      case 'review':
        return <div>Review</div>;
      default:
        return <Symptoms />;
    }
  };
  return (
    <div className="rounded-2xl border border-gray-300 px-6 py-8">
      <div className="flex items-center gap-3">
        <span>Consultation</span>
        <Badge className="px-3 py-1.5" variant="brown">
          <ClockFading className="mr-1" />
          In-progress
        </Badge>
      </div>
      <div
        className="sticky top-0 z-100 mb-8 border-t border-b border-gray-300 bg-gray-100 py-6 font-bold text-gray-500"
        id="clip"
      >
        {stages.map((stage, index) => (
          <button
            onClick={() => setCurrentStage(stage)}
            key={stage}
            className={cn(
              index === 0 || index === stages.length - 1 ? '' : 'in-between',
              index === stages.length - 1 && 'lastCrumb rounded-r-4xl',
              index === 0 && 'firstCrumb rounded-l-4xl',
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
