import { ChevronsUpDown, Clock, Trash2, Cross, Stethoscope, Edit } from 'lucide-react';
import { StatusBadge } from '@/components/ui/statusBadge';
import Drug from '@/app/dashboard/(doctor)/_components/Drug';
import { getFormattedDate } from '@/lib/date';
import React, { JSX, ReactNode, useState } from 'react';
import { ConditionStatus } from '@/types/shared.enum';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ICondition, IMedicine, IDiagnosis } from '@/types/medical.interface';
import { cn } from '@/lib/utils';

type DiagnosisConditionCommonProps = {
  name: string;
};

type DiagnosisCardProps = {
  status: ConditionStatus;
  remove?: () => void;
  edit?: () => void;
  notes?: string;
  doctor: string;
  diagnosedAt: string;
} & DiagnosisConditionCommonProps;

export const DiagnosisCard = ({
  remove,
  edit,
  name,
  status,
  notes,
  doctor,
  diagnosedAt,
  isRemoving = false,
}: DiagnosisCardProps & { isRemoving?: boolean }): JSX.Element => (
  <div
    className={cn(
      'group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200',
      edit && 'hover:border-primary hover:shadow-md',
    )}
  >
    <div className="mb-4 flex items-start justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <Stethoscope className="h-4 w-4" />
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
      <div className="flex items-center gap-1">
        {edit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              edit();
            }}
            className="hover:text-primary h-8 w-8 text-gray-400"
            child={<Edit className="h-4 w-4" />}
          />
        )}
        {remove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              remove();
            }}
            className="hover:text-destructive h-8 w-8 text-gray-400"
            child={<Trash2 className="h-4 w-4" />}
            isLoading={isRemoving}
            disabled={isRemoving}
          />
        )}
      </div>
    </div>

    <div className="mb-3">
      <h4 className="line-clamp-2 text-lg font-semibold text-gray-900">{name}</h4>
    </div>

    {notes && (
      <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
        <p className="line-clamp-3 text-xs text-gray-600">{notes}</p>
      </div>
    )}

    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white">
          {doctor
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)}
        </div>
        <span className="font-medium">{doctor}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{getFormattedDate(diagnosedAt)}</span>
      </div>
    </div>
  </div>
);

type ConditionCardProps = { medicines: IMedicine[] } & DiagnosisConditionCommonProps;

export const ConditionCard = ({ name, medicines }: ConditionCardProps): JSX.Element => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl bg-linear-to-b from-[#C5D8FF] to-[rgba(197,216,255,0.51)] p-4">
      <Collapsible
        open={expanded}
        onOpenChange={() => {
          setExpanded((prev) => !prev);
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-x-2 rounded-full bg-white px-2 py-1.5">
            <Cross className="h-5 w-5 shrink-0 text-red-500" />
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
        {medicines?.length > 1 && (
          <>
            {
              <div className="mt-4">
                <Drug
                  key={`${medicines[0].name}-${medicines[0].dose}`}
                  name={medicines[0].name}
                  doses={medicines[0].dose}
                />
              </div>
            }
            <CollapsibleContent>
              {medicines.slice(1).map(({ name, dose }) => (
                <div key={`${name}-${dose}`} className="mt-4">
                  <Drug name={name} doses={dose} />
                </div>
              ))}
            </CollapsibleContent>
          </>
        )}
      </Collapsible>
    </div>
  );
};

export const DiagnosesList = ({
  doctorName,
  conditions,
  children,
  remove,
  edit,
  className,
  isRemovingIndex,
}: {
  doctorName: string;
  conditions: IDiagnosis[];
  children?: ReactNode;
  remove?: (index: number) => void;
  edit?: (index: number) => void;
  className?: string;
  isRemovingIndex?: number | null;
}): JSX.Element => (
  <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
    {children}
    {conditions.map(({ name, diagnosedAt, status, notes }, index) => (
      <DiagnosisCard
        key={`${name}-${diagnosedAt}-${index}`}
        diagnosedAt={diagnosedAt}
        name={name}
        doctor={doctorName}
        status={status}
        notes={notes}
        remove={remove ? (): void => remove(index) : undefined}
        edit={edit ? (): void => edit(index) : undefined}
        isRemoving={isRemovingIndex === index}
      />
    ))}
  </div>
);

export const ConditionsList = ({ conditions }: { conditions: ICondition[] }): JSX.Element => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {conditions.map(({ name, medicines, id }) => (
      <ConditionCard key={id} name={name} medicines={medicines} />
    ))}
  </div>
);
