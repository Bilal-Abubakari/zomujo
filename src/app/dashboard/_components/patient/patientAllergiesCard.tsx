import React, { JSX } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { selectAllergies } from '@/lib/features/patients/patientsSelector';
import CardFrame from '@/app/dashboard/_components/cardFrame';

const PatientAllergiesCard = (): JSX.Element => {
  const allergies = useAppSelector(selectAllergies);
  return (
    <CardFrame title="Allergies" showEmptyResults={!allergies?.length}>
      <div className="max-h-[360px] space-y-4 overflow-y-scroll text-[#840000]">
        {allergies?.map((allergy) => (
          <div
            key={allergy}
            className="rounded-xl bg-gradient-to-b from-[#FCA5A5] to-[#FFECEC] p-4"
          >
            <h4 className="font-bold">{allergy}</h4>
          </div>
        ))}
      </div>
    </CardFrame>
  );
};

export default PatientAllergiesCard;
