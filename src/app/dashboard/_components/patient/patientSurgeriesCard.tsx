import React, { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { FilePenLine } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import { selectSurgeries } from '@/lib/features/patients/patientsSelector';

const PatientSurgeriesCard = (): JSX.Element => {
  const surgeries = useAppSelector(selectSurgeries);
  return (
    <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-row items-center justify-between">
        <p className="font-bold">Surgeries</p>
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
      {!surgeries?.length && (
        <div className="flex h-40 items-center justify-center">No surgeries found</div>
      )}
      <div className="text-burnt-brown max-h-[360px] space-y-4 overflow-y-scroll">
        {surgeries?.map(({ notes, name, id }) => (
          <div
            key={id}
            className="rounded-xl bg-gradient-to-b from-[#FFD0B0] to-[rgba(255,219,195,0.51)] p-4"
          >
            <h4 className="font-bold">{name}</h4>
            <div className="mt-8 text-sm">
              <span className="font-medium">Notes</span>
              <p>{notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientSurgeriesCard;
