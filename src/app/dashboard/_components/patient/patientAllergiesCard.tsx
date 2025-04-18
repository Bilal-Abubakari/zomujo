import { Button } from '@/components/ui/button';
import { FilePenLine } from 'lucide-react';
import React, { JSX } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { selectAllergies } from '@/lib/features/patients/patientsSelector';

const PatientAllergiesCard = (): JSX.Element => {
  const allergies = useAppSelector(selectAllergies);
  return (
    <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-row items-center justify-between">
        <p className="font-bold">Allergies</p>
        <Button
          variant="outline"
          child={
            <>
              <FilePenLine />
              Add
            </>
          }
        />
      </div>
      <hr className="my-4" />
      {!allergies?.length && (
        <div className="flex h-40 items-center justify-center">No allergies found</div>
      )}
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
    </div>
  );
};

export default PatientAllergiesCard;
