import React, { JSX } from 'react';
import { capitalize } from '@/lib/utils';
import { useAppSelector } from '@/lib/hooks';
import { selectLifestyle } from '@/lib/features/patients/patientsSelector';
import CardFrame from '@/app/dashboard/_components/cardFrame';

const PatientLifestyleCard = (): JSX.Element => {
  const lifestyle = useAppSelector(selectLifestyle);
  return (
    <CardFrame showEmptyResults={!lifestyle} title="Lifestyle">
      <div className="flex flex-col gap-6">
        {Object.entries(lifestyle ?? {}).map(([key, value]) => (
          <div key={key} className="flex flex-row items-center justify-between text-sm">
            <p className="text-gray-500">{capitalize(key)}</p>
            <p className="font-medium">{capitalize(String(value))}</p>
          </div>
        ))}
      </div>
    </CardFrame>
  );
};

export default PatientLifestyleCard;
