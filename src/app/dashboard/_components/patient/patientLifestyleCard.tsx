import React, { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { FilePenLine } from 'lucide-react';
import { capitalize } from '@/lib/utils';
import { useAppSelector } from '@/lib/hooks';
import { selectLifestyle } from '@/lib/features/patients/patientsSelector';

const PatientLifestyleCard = (): JSX.Element => {
  const lifestyle = useAppSelector(selectLifestyle);
  return (
    <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-row items-center justify-between">
        <p className="font-bold">Lifestyle</p>
        <Button
          variant="outline"
          child={
            <>
              <FilePenLine />
              Edit
            </>
          }
        />
      </div>
      <hr className="my-4" />
      {!lifestyle && (
        <div className="flex h-40 items-center justify-center">No lifestyle information</div>
      )}
      <div className="flex flex-col gap-6">
        {Object.entries(lifestyle ?? {}).map(([key, value]) => (
          <div key={key} className="flex flex-row items-center justify-between text-sm">
            <p className="text-gray-500">{capitalize(key)}</p>
            <p className="font-medium">{capitalize(String(value))}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientLifestyleCard;
