import React, { JSX, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  addConsultationSymptom,
  getComplaintSuggestions,
  getSystemSymptoms,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { cn, showErrorToast } from '@/lib/utils';
import { toast, Toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SelectInput, SelectInputV2 } from '@/components/ui/select';
import { durationTypes } from '@/constants/constants';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  IConsultationSymptoms,
  IConsultationSymptomsRequest,
  IPatientSymptom,
  ISymptomMap,
  SymptomsType,
} from '@/types/consultation.interface';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Loader2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LocalStorageManager } from '@/lib/localStorage';

const SelectSymptoms = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/selectSymptoms'),
  { loading: () => <LoadingFallback />, ssr: false },
);
const MedicationTaken = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/medicationTaken'),
  { loading: () => <LoadingFallback />, ssr: false },
);

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DurationType } from '@/types/shared.enum';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import Loading from '@/components/loadingOverlay/loading';

import { useParams } from 'next/navigation';
import { selectSymptoms } from '@/lib/features/appointments/appointmentSelector';
import _ from 'lodash';
import { IAppointmentSymptoms } from '@/types/appointment.interface';

const symptomItemSchema = z.object({
  name: requiredStringSchema(),
  notes: z.string().optional(),
});

const symptomsSchema = z
  .object({
    complaints: z
      .array(
        z.object({
          complaint: requiredStringSchema(),
          duration: z.object({
            value: requiredStringSchema().refine((val) => Number(val) > 0, {
              message: 'Duration must be a positive number',
            }),
            type: z.enum(DurationType),
          }),
        }),
      )
      .min(1),
    symptoms: z.object({
      [SymptomsType.Neurological]: z.array(symptomItemSchema),
      [SymptomsType.Cardiovascular]: z.array(symptomItemSchema),
      [SymptomsType.Gastrointestinal]: z.array(symptomItemSchema),
      [SymptomsType.Genitourinary]: z.array(symptomItemSchema),
      [SymptomsType.Musculoskeletal]: z.array(symptomItemSchema),
      [SymptomsType.Integumentary]: z.array(symptomItemSchema),
      [SymptomsType.Endocrine]: z.array(symptomItemSchema),
    }),
    medicinesTaken: z.array(
      z.object({
        name: requiredStringSchema(),
        dose: z.string(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const hasSymptoms = Object.values(data.symptoms).some(
      (symptomArray) => symptomArray && symptomArray.length > 0,
    );
    if (!hasSymptoms) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one system symptom must be added.',
        path: ['symptoms'],
      });
    }
  });

type SymptomsProps = {
  goToLabs: () => void;
};

const LoadingFallback = (): JSX.Element => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin" size={24} />
  </div>
);

const Symptoms = ({ goToLabs }: SymptomsProps): JSX.Element => {
  const symptoms = useAppSelector(selectSymptoms);
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    formState: { isValid, errors },
    register,
    watch,
    setValue,
    trigger,
    handleSubmit,
  } = useForm<IConsultationSymptoms>({
    resolver: zodResolver(symptomsSchema),
    mode: 'all',
    defaultValues: {
      complaints: [],
      symptoms: {
        [SymptomsType.Neurological]: [],
        [SymptomsType.Cardiovascular]: [],
        [SymptomsType.Gastrointestinal]: [],
        [SymptomsType.Genitourinary]: [],
        [SymptomsType.Musculoskeletal]: [],
        [SymptomsType.Integumentary]: [],
        [SymptomsType.Endocrine]: [],
      },
      medicinesTaken: [],
    },
  });
  const {
    fields: complaintFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'complaints',
  });
  const dispatch = useAppDispatch();
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(false);
  const [isLoadingComplaintSuggestions, setIsLoadingComplaintSuggestions] = useState(false);
  const [complaintSuggestions, setComplaintSuggestions] = useState<string[]>([]);
  const [otherComplaint, setOtherComplaint] = useState<string>('');
  const [systemSymptoms, setSystemSymptoms] = useState<ISymptomMap>();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const params = useParams();
  const complaintsHFC = watch('complaints');
  const hasSetComplaintDurations = useRef(false);
  const complaintFieldsContainerRef = useRef<HTMLDivElement>(null);

  const storageKey = useMemo(
    () => `consultation_${params?.appointmentId}_symptoms_draft`,
    [params],
  );

  // Restore draft if no server symptoms yet
  useEffect(() => {
    if (!symptoms) {
      const draft = LocalStorageManager.getJSON<IConsultationSymptoms>(storageKey);
      if (draft) {
        // Apply draft values
        setValue('complaints', draft.complaints ?? []);
        setValue(
          'symptoms',
          draft.symptoms ?? {
            [SymptomsType.Neurological]: [],
            [SymptomsType.Cardiovascular]: [],
            [SymptomsType.Gastrointestinal]: [],
            [SymptomsType.Genitourinary]: [],
            [SymptomsType.Musculoskeletal]: [],
            [SymptomsType.Integumentary]: [],
            [SymptomsType.Endocrine]: [],
          },
        );
        setValue('medicinesTaken', draft.medicinesTaken ?? []);
      }
    }
  }, [symptoms, storageKey, setValue]);

  // Persist draft on any form value change (debounced via RAF batching)
  useEffect(() => {
    const subscription = watch((value) => {
      // Only persist if not already saved on server (symptoms selector empty or undefined)
      if (!symptoms) {
        LocalStorageManager.setJSON(storageKey, value as IConsultationSymptoms);
      }
    });
    return (): void => subscription.unsubscribe();
  }, [watch, symptoms, storageKey]);

  const clearDraft = useCallback(() => {
    LocalStorageManager.removeJSON(storageKey);
  }, [storageKey]);

  const selectedComplaints = useMemo(
    () => complaintsHFC?.map(({ complaint }) => complaint),
    [complaintsHFC],
  );

  const handleSelectedComplaint = useCallback(
    (suggestion: string, shouldRemove = true): void => {
      if (!selectedComplaints.includes(suggestion)) {
        append({
          complaint: suggestion,
          duration: { value: '', type: DurationType.Days },
        });
        // Scroll to the complaint fields after a short delay to ensure DOM is updated
        setTimeout(() => {
          complaintFieldsContainerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 100);
      } else if (shouldRemove) {
        const index = complaintsHFC.findIndex(({ complaint }) => complaint === suggestion);
        if (index !== -1) {
          remove(index);
        }
      }
    },
    [append, complaintsHFC, remove, selectedComplaints],
  );

  const addComplaint = useCallback((): void => {
    if (!otherComplaint) {
      return;
    }
    const complaintExists =
      complaintSuggestions.includes(otherComplaint) || selectedComplaints.includes(otherComplaint);
    if (!complaintExists) {
      setComplaintSuggestions((prev) => [...prev, otherComplaint]);
      append({ complaint: otherComplaint, duration: { value: '', type: DurationType.Days } });
      setOtherComplaint('');
      // Scroll to the complaint fields after a short delay to ensure DOM is updated
      setTimeout(() => {
        complaintFieldsContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [append, complaintSuggestions, otherComplaint, selectedComplaints]);

  const fetchSymptoms = useCallback(async (): Promise<void> => {
    setIsLoadingSymptoms(true);
    const { payload } = await dispatch(getSystemSymptoms());
    setSystemSymptoms(payload as ISymptomMap);
    setIsLoadingSymptoms(false);
  }, [dispatch]);

  const handleSubmitAndGoToLabs = async (data: IConsultationSymptoms): Promise<void> => {
    const appointmentId = String(params.appointmentId);
    const existingSymptoms: Partial<IAppointmentSymptoms> | undefined = _.cloneDeep({
      ...symptoms,
      appointmentId,
    });
    if (existingSymptoms) {
      delete existingSymptoms.id;
      delete existingSymptoms.createdAt;
    }
    setIsLoading(true);
    const consultationSymptomsRequest: IConsultationSymptomsRequest = {
      ...data,
      appointmentId,
    };
    if (_.isEqual(existingSymptoms, consultationSymptomsRequest)) {
      goToLabs();
      clearDraft();
      setIsLoading(false);
      return;
    }

    const { payload } = await dispatch(addConsultationSymptom(consultationSymptomsRequest));
    toast(payload as Toast);
    setIsLoading(false);
    if (!showErrorToast(payload)) {
      clearDraft();
      goToLabs();
    }
  };

  useEffect(() => {
    void fetchSymptoms();
    const handleComplaintSuggestions = async (): Promise<void> => {
      setIsLoadingComplaintSuggestions(true);
      const { payload } = await dispatch(getComplaintSuggestions());
      if (!showErrorToast(payload)) {
        setComplaintSuggestions(payload as string[]);
        setIsLoadingComplaintSuggestions(false);
        return;
      }
      toast(payload as Toast);
      setIsLoadingComplaintSuggestions(false);
    };
    void handleComplaintSuggestions();
  }, [dispatch, fetchSymptoms]);

  const systemSymptomsEntries = useMemo(
    () => Object.entries(systemSymptoms ?? {}),
    [systemSymptoms],
  );

  const getSystemTitle = useCallback((id: string): string => {
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

  const hasSelectedSymptoms = useCallback(
    (id: string): boolean => {
      const selectedSymptoms = watch(`symptoms.${id as SymptomsType}`) as IPatientSymptom[];
      return selectedSymptoms && selectedSymptoms.length > 0;
    },
    [watch],
  );

  useEffect(() => {
    if (symptoms) {
      // transform legacy shape if server still returns old structure complaints: string[] & duration: IDuration
      const legacyComplaints = (
        symptoms as unknown as {
          complaints?: unknown;
          duration?: { value: string; type: DurationType };
        }
      ).complaints;
      if (Array.isArray(legacyComplaints) && legacyComplaints.every((c) => typeof c === 'string')) {
        const legacyDuration = (
          symptoms as unknown as { duration?: { value: string; type: DurationType } }
        ).duration ?? {
          value: '',
          type: DurationType.Days,
        };
        (symptoms as unknown as IConsultationSymptoms).complaints = legacyComplaints.map(
          (complaint) => ({
            complaint,
            duration: legacyDuration,
          }),
        );
      }
      const {
        medicinesTaken,
        complaints,
        symptoms: patientSymptoms,
      } = symptoms as IConsultationSymptoms;

      if (!isLoadingComplaintSuggestions) {
        for (const { complaint, duration } of complaints) {
          if (complaintSuggestions.includes(complaint)) {
            handleSelectedComplaint(complaint, false);
          } else {
            setComplaintSuggestions((prev) => [...prev, complaint]);
            append({ complaint, duration });
          }
        }
      }

      setValue('medicinesTaken', medicinesTaken);
      if (complaints && complaints.length > 0 && !hasSetComplaintDurations.current) {
        setValue('complaints', complaints);
        complaints.forEach((complaintObj, idx) => {
          setValue(`complaints.${idx}.duration.value`, complaintObj.duration?.value ?? '');
          setValue(
            `complaints.${idx}.duration.type`,
            complaintObj.duration?.type ?? DurationType.Days,
          );
        });
        hasSetComplaintDurations.current = true;
      }
      if (systemSymptoms) {
        setValue('symptoms', patientSymptoms);
        let symptomsMap = _.cloneDeep(systemSymptoms);
        const sectionsWithSymptoms: string[] = [];

        Object.entries(systemSymptoms).forEach(([id, systemSymptomList]) => {
          const formattedPatientSymptoms = (patientSymptoms[id as SymptomsType] ?? []).map(
            ({ name }) => name,
          );

          if (formattedPatientSymptoms.length > 0) {
            sectionsWithSymptoms.push(id);
          }

          const updatedSystemSymptoms = systemSymptomList.filter(
            ({ name }) => !formattedPatientSymptoms.includes(name),
          );
          symptomsMap = {
            ...symptomsMap,
            [id]: updatedSystemSymptoms,
          };
        });

        setExpandedSections(sectionsWithSymptoms);

        if (!_.isEqual(systemSymptoms, symptomsMap)) {
          setSystemSymptoms(symptomsMap);
        }
      }
    }
  }, [
    symptoms,
    systemSymptoms,
    isLoadingComplaintSuggestions,
    setValue,
    complaintSuggestions,
    handleSelectedComplaint,
    append,
  ]);

  const [bulkDurationValue, setBulkDurationValue] = useState<string>('');
  const [bulkDurationType, setBulkDurationType] = useState<DurationType>(DurationType.Days);

  const handleApplyBulkDuration = useCallback(() => {
    if (!bulkDurationValue || Number(bulkDurationValue) <= 0) {
      return;
    }
    complaintFields.forEach((field, idx) => {
      setValue(`complaints.${idx}.duration.value`, bulkDurationValue);
      setValue(`complaints.${idx}.duration.type`, bulkDurationType);
    });
    void trigger('complaints');
  }, [bulkDurationType, bulkDurationValue, complaintFields, setValue, trigger]);

  return (
    <DndProvider backend={HTML5Backend}>
      <form onSubmit={handleSubmit(handleSubmitAndGoToLabs)}>
        {/*TODO: Coming soon*/}
        {/*<FornixVoiceSummary />*/}
        <h1 className="text-xl font-bold">Complaint</h1>
        <div className="mt-8 flex flex-wrap gap-5">
          {isLoadingComplaintSuggestions ? (
            <Loading message="Please wait. Loading complaint suggestions" />
          ) : (
            complaintSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSelectedComplaint(suggestion)}
                className={cn(
                  'cursor-pointer rounded-[100px] p-2.5',
                  selectedComplaints.includes(suggestion) ? 'bg-primary text-white' : 'bg-gray-200',
                )}
              >
                {suggestion}
              </button>
            ))
          )}
        </div>
        <div className="mt-8 flex flex-wrap items-end gap-4">
          <Input
            value={otherComplaint}
            onChange={({ target }) => setOtherComplaint(target.value)}
            labelName="Add complaint if not part of suggestions"
            className="max-w-xs bg-transparent"
          />
          <Button
            disabled={!otherComplaint}
            onClick={() => addComplaint()}
            type="button"
            className="self-end"
            child="Add"
          />
        </div>
        {complaintFields.length > 1 && (
          <div className="mt-6 flex flex-wrap items-end gap-4 rounded-md bg-gray-50 p-4">
            <Input
              value={bulkDurationValue}
              onChange={(e) => setBulkDurationValue(e.target.value)}
              type="number"
              placeholder="Duration"
              labelName="Duration (All)"
              className="w-32 bg-transparent"
            />
            <SelectInputV2
              className="max-w-40"
              options={durationTypes}
              onChange={(value) => setBulkDurationType(value as DurationType)}
              value={bulkDurationType}
            />
            <Button
              type="button"
              disabled={!bulkDurationValue || Number(bulkDurationValue) <= 0}
              onClick={handleApplyBulkDuration}
              child="Apply to All"
            />
          </div>
        )}
        {complaintFields.length > 0 && (
          <div ref={complaintFieldsContainerRef} className="mt-10">
            <h2 className="text-lg font-semibold">Set Duration Per Complaint</h2>
            <div className="mt-4 space-y-6">
              {complaintFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-wrap items-end gap-4 rounded-md border p-4 shadow-sm"
                >
                  <div className="min-w-45 flex-1">
                    <Input
                      value={field.complaint}
                      readOnly
                      labelName="Complaint"
                      className="bg-transparent"
                    />
                  </div>
                  <div>
                    <Input
                      {...register(`complaints.${index}.duration.value`)}
                      placeholder="Duration"
                      labelName="Duration"
                      className="w-28 bg-transparent"
                      error={errors?.complaints?.[index]?.duration?.value?.message}
                    />
                  </div>
                  <SelectInput
                    control={control}
                    name={`complaints.${index}.duration.type`}
                    options={durationTypes}
                    placeholder="Type"
                    className="w-32 bg-transparent"
                    ref={register(`complaints.${index}.duration.type`).ref}
                  />
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => remove(index)}
                    child="Remove"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <h1 className="mt-12 text-xl font-bold">Symptoms</h1>
        {isLoadingSymptoms ? (
          <Loading message="Please wait. Loading System Symptoms.." />
        ) : (
          <Accordion
            type="multiple"
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="mt-4"
          >
            {systemSymptomsEntries.map(([id, symptoms]) => (
              <AccordionItem key={id} value={id} className="border-b">
                <AccordionTrigger className="cursor-pointer text-left transition-colors hover:bg-gray-50 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getSystemTitle(id)}</span>
                    {hasSelectedSymptoms(id) && (
                      <span className="bg-primary rounded-full px-2 py-0.5 text-xs text-white">
                        {(watch(`symptoms.${id as SymptomsType}`) as IPatientSymptom[])?.length ||
                          0}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {expandedSections.includes(id) && (
                    <SelectSymptoms
                      symptoms={symptoms}
                      id={id}
                      control={control}
                      trigger={trigger}
                      selectedSymptoms={watch(`symptoms.${id as SymptomsType}`)}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        <h1 className="mt-12 text-xl font-bold">Medication Taken</h1>
        <MedicationTaken medicationsTaken={watch('medicinesTaken')} control={control} />
        <div className="mt-20"></div>
        <div className="fixed bottom-0 left-0 z-50 flex w-full justify-end border-t border-gray-300 bg-white p-4 shadow-md">
          <Button isLoading={isLoading} disabled={!isValid || isLoading} child="Go to Labs" />
        </div>
      </form>
    </DndProvider>
  );
};

export default Symptoms;
