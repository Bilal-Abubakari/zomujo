import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, FilePenLine } from 'lucide-react';
import { ICondition, IMedicine } from '@/types/patient.interface';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Image from 'next/image';
import { Drugs } from '@/assets/images';

//TODO: Replace with actual data fetching logic
const mockConditions: ICondition[] = [
  {
    id: 'cond-001',
    name: 'Hypertension',
    medicines: [
      { id: 'med-001', name: 'Lisinopril', dose: '10mg daily' },
      { id: 'med-002', name: 'Amlodipine', dose: '5mg daily' },
    ],
  },
  {
    id: 'cond-002',
    name: 'Type 2 Diabetes',
    medicines: [
      { id: 'med-003', name: 'Metformin', dose: '500mg twice daily' },
      { id: 'med-004', name: 'Glipizide', dose: '5mg daily before breakfast' },
    ],
  },
  {
    id: 'cond-003',
    name: 'Asthma',
    medicines: [
      { id: 'med-005', name: 'Salbutamol', dose: '2 puffs as needed' },
      { id: 'med-006', name: 'Fluticasone', dose: '1 puff twice daily' },
    ],
  },
  {
    id: 'cond-004',
    name: 'Allergic Rhinitis',
    medicines: [
      { id: 'med-007', name: 'Loratadine', dose: '10mg once daily' },
      { id: 'med-008', name: 'Fluticasone nasal spray', dose: '1 spray per nostril daily' },
    ],
  },
];

const PatientConditionsCard = (): JSX.Element => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const drug = ({ name, dose }: IMedicine): JSX.Element => (
    <div className="mt-4 flex items-center gap-1">
      <Image src={Drugs} alt={name} width={20} height={20} />
      <span
        title={`${name}(${dose})`}
        className="text-blue-midnight truncate text-sm font-semibold"
      >
        {name}({dose})
      </span>
    </div>
  );
  return (
    <>
      <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-row items-center justify-between">
          <p className="font-bold">Conditions and Medicines</p>
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
        {!mockConditions.length && (
          <div className="flex h-40 items-center justify-center">No medical condition found</div>
        )}
        <div className="max-h-[360px] space-y-4 overflow-y-scroll">
          {mockConditions.map(({ id, name, medicines }) => (
            <div
              key={id}
              className="rounded-xl bg-gradient-to-b from-[#C5D8FF] to-[rgba(197,216,255,0.51)] p-4"
            >
              <Collapsible
                open={expandedId === id}
                onOpenChange={() => {
                  setExpandedId((prev) => (prev === id ? null : id));
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-white px-2 py-1.5">
                    <h4 className="text-sm font-semibold">{name}</h4>
                  </div>
                  {medicines.length > 1 && (
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        child={
                          <>
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </>
                        }
                      />
                    </CollapsibleTrigger>
                  )}
                </div>
                {medicines[0] && drug(medicines[0])}
                <CollapsibleContent>
                  {medicines.slice(1).map((medicine) => drug(medicine))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PatientConditionsCard;
