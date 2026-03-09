import React, { JSX } from 'react';
import dynamic from 'next/dynamic';
import { Control, UseFormTrigger, UseFormWatch } from 'react-hook-form';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  IConsultationSymptoms,
  IPatientSymptom,
  ISymptomMap,
  SymptomsType,
} from '@/types/consultation.interface';
import { Loader2 } from 'lucide-react';

const SelectSymptoms = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/selectSymptoms'),
  { loading: () => <LoadingFallback />, ssr: false },
);

const LoadingFallback = (): JSX.Element => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin" size={24} />
  </div>
);

interface ReviewOfSystemsProps {
  expandedSections: string[];
  setExpandedSections: (value: string[]) => void;
  systemSymptoms: ISymptomMap | undefined;
  control: Control<IConsultationSymptoms>;
  trigger: UseFormTrigger<IConsultationSymptoms>;
  watch: UseFormWatch<IConsultationSymptoms>;
}

const ReviewOfSystems: React.FC<ReviewOfSystemsProps> = ({
  expandedSections,
  setExpandedSections,
  systemSymptoms,
  control,
  trigger,
  watch,
}) => {
  const systemSymptomsEntries = React.useMemo(
    () => Object.entries(systemSymptoms ?? {}),
    [systemSymptoms],
  );

  const getSystemTitle = React.useCallback((id: string): string => {
    const titles: Record<string, string> = {
      [SymptomsType.Neurological]: 'Neurological Symptoms',
      [SymptomsType.Cardiovascular]: 'Cardiovascular Symptoms',
      [SymptomsType.Gastrointestinal]: 'Gastrointestinal Symptoms',
      [SymptomsType.Genitourinary]: 'Genitourinary Symptoms',
      [SymptomsType.Musculoskeletal]: 'Musculoskeletal Symptoms',
      [SymptomsType.Integumentary]: 'Integumentary Symptoms',
      [SymptomsType.Endocrine]: 'Endocrine Symptoms',
    };
    return titles[id] || id;
  }, []);

  const hasSelectedSymptoms = React.useCallback(
    (id: string): boolean => {
      const selectedSymptoms = watch(`symptoms.${id as SymptomsType}`) as IPatientSymptom[];
      return selectedSymptoms && selectedSymptoms.length > 0;
    },
    [watch],
  );

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-lg font-semibold">Review of Systems</h2>
      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={setExpandedSections}
        className="w-full space-y-4"
      >
        {systemSymptomsEntries.map(([id, symptoms]) => (
          <AccordionItem key={id} value={id} className="rounded-lg border px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-medium',
                    hasSelectedSymptoms(id) ? 'text-primary' : 'text-gray-700',
                  )}
                >
                  {getSystemTitle(id)}
                </span>
                {hasSelectedSymptoms(id) && (
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                    Selected
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <SelectSymptoms
                id={id}
                symptoms={symptoms}
                control={control}
                trigger={trigger}
                selectedSymptoms={watch(`symptoms.${id as SymptomsType}`) as IPatientSymptom[]}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ReviewOfSystems;
