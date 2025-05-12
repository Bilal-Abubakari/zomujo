import { ChevronsUpDown, Cross } from 'lucide-react';
import { TooltipComp } from '@/components/ui/tooltip';
import { StatusBadge } from '@/components/ui/statusBadge';
import Drug from '@/app/dashboard/(doctor)/_components/Drug';
import { getFormattedDate } from '@/lib/date';
import React, { JSX, useState } from 'react';
import { ConditionStatus } from '@/types/shared.enum';
import { IPrescription } from '@/types/consultation.interface';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { IMedicine } from '@/types/patient.interface';

type DiagnosisConditionCommonProps = {
  name: string;
};

type DiagnosisCardProps = {
  status: ConditionStatus;
  removeMedicine?: (index: number) => void;
  notes?: string;
  prescription: IPrescription[];
  doctor: string;
  diagnosedAt: string;
} & DiagnosisConditionCommonProps;

export const DiagnosisCard = ({
  removeMedicine,
  name,
  status,
  notes,
  prescription,
  doctor,
  diagnosedAt,
}: DiagnosisCardProps): JSX.Element => (
  <div className="flex h-[320px] flex-col rounded-xl bg-gradient-to-b from-[#C5D8FF] to-[rgba(197,216,255,0.51)] p-5 shadow-sm">
    <div className="mb-3 flex items-center justify-between gap-8">
      <div className="flex max-w-[calc(100%-8rem)] gap-x-2 rounded-full bg-white px-3 py-2 shadow-sm">
        <Cross className="h-5 w-5 flex-shrink-0 text-red-500" />
        <TooltipComp tip={name}>
          <h4 className="truncate text-sm font-semibold text-gray-800">{name}</h4>
        </TooltipComp>
      </div>
      {status && (
        <StatusBadge
          status={status}
          declinedTitle="Active"
          approvedTitle="Inactive"
          defaultTitle="Controlled"
        />
      )}
    </div>
    {notes && (
      <div className="mb-3 rounded-md bg-white/80 p-2.5 text-sm">
        <p className="line-clamp-2 text-gray-600">{notes}</p>
      </div>
    )}
    <div className="flex min-h-0 flex-1 flex-col">
      <h5 className="mb-2 text-xs font-medium text-gray-600">
        Medications ({prescription?.length || 0})
      </h5>

      <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
        {(!prescription || prescription.length === 0) && (
          <div className="rounded-md bg-white/70 p-2 text-center text-sm text-gray-500">
            No medications added
          </div>
        )}
        <div className="space-y-2">
          {prescription?.map(({ name, doses, instructions, frequency }, index) => (
            <div key={`${name}-${index}`} className="flex rounded-md bg-white/80 p-2.5">
              <Drug
                dose={doses}
                name={name}
                index={index}
                remove={removeMedicine}
                instructions={instructions}
                frequency={frequency}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-2 flex justify-between space-x-2 border-t border-blue-200/50 pt-2">
      <span className="text-grayscale-600 text-xs">{doctor}</span>
      {diagnosedAt && (
        <span className="text-grayscale-600 text-xs">{getFormattedDate(diagnosedAt)}</span>
      )}
      <span></span>
    </div>
  </div>
);

type ConditionCardProps = { medicines: IMedicine[] } & DiagnosisConditionCommonProps;

export const ConditionCard = ({ name, medicines }: ConditionCardProps): JSX.Element => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl bg-gradient-to-b from-[#C5D8FF] to-[rgba(197,216,255,0.51)] p-4">
      <Collapsible
        open={expanded}
        onOpenChange={() => {
          setExpanded((prev) => !prev);
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-x-2 rounded-full bg-white px-2 py-1.5">
            <Cross className="h-5 w-5 flex-shrink-0 text-red-500" />
            <h4 className="text-sm font-semibold">{name}</h4>
          </div>
          {medicines?.length > 1 && (
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
        {medicines?.length && (
          <>
            {
              <div className="mt-4">
                <Drug
                  key={`${medicines[0].name}-${medicines[0].dose}`}
                  name={medicines[0].name}
                  dose={medicines[0].dose}
                />
              </div>
            }
            <CollapsibleContent>
              {medicines.slice(1).map(({ name, dose }) => (
                <div key={`${name}-${dose}`} className="mt-4">
                  <Drug name={name} dose={dose} />
                </div>
              ))}
            </CollapsibleContent>
          </>
        )}
      </Collapsible>
    </div>
  );
};
