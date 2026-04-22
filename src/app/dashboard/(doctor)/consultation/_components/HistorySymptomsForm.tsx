import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  addConsultationSymptom,
  getComplaintSuggestions,
  getSystemSymptoms,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { cn, showErrorToast } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
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
import { Loader2, Trash2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LocalStorageManager } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DurationType } from '@/types/shared.enum';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import Loading from '@/components/loadingOverlay/loading';
import { useParams } from 'next/navigation';
import { selectSymptoms } from '@/lib/features/appointments/appointmentSelector';
import _ from 'lodash';
import { IAppointmentSymptoms } from '@/types/appointment.interface';

const SelectSymptoms = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/selectSymptoms'),
  { loading: () => <LoadingFallback />, ssr: false },
);
const MedicationTaken = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/medicationTaken'),
  { loading: () => <LoadingFallback />, ssr: false },
);

const LoadingFallback = (): JSX.Element => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin" size={24} />
  </div>
);

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

type HistorySymptomsFormProps = {
  goToNext: () => void;
};

const HistorySymptomsForm = ({ goToNext }: HistorySymptomsFormProps): JSX.Element => {
  const { state, isMobile } = useSidebar();
  const symptoms = useAppSelector(selectSymptoms);
  const params = useParams();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComplaintSuggestions, setIsLoadingComplaintSuggestions] = useState(false);
  const [complaintSuggestions, setComplaintSuggestions] = useState<string[]>([]);
  const [otherComplaint, setOtherComplaint] = useState<string>('');
  const [systemSymptoms, setSystemSymptoms] = useState<ISymptomMap>();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [bulkDurationValue, setBulkDurationValue] = useState<string>('');
  const [bulkDurationType, setBulkDurationType] = useState<DurationType>(DurationType.Days);

  const hasSetComplaintDurations = useRef(false);
  const complaintFieldsContainerRef = useRef<HTMLDivElement>(null);

  const storageKey = useMemo(() => `consultation_${params?.appointmentId}_history_draft`, [params]);

  const {
    control,
    formState: { errors },
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

  const complaintsHFC = watch('complaints');

  const selectedComplaints = useMemo(
    () => complaintsHFC?.map(({ complaint }) => complaint),
    [complaintsHFC],
  );

  // Restore draft from local storage
  useEffect(() => {
    if (!symptoms) {
      const draft = LocalStorageManager.getJSON<IConsultationSymptoms>(storageKey);
      if (draft) {
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
  }, [symptoms, storageKey]);

  // Persist draft to local storage on form changes
  useEffect(() => {
    const subscription = watch((value) => {
      if (!symptoms) {
        LocalStorageManager.setJSON(storageKey, value as IConsultationSymptoms);
      }
    });
    return (): void => subscription.unsubscribe();
  }, [symptoms, storageKey]);

  const clearDraft = useCallback(() => {
    LocalStorageManager.removeJSON(storageKey);
  }, [storageKey]);

  const scrollToComplaintFields = (): void => {
    setTimeout(() => {
      complaintFieldsContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 100);
  };

  const handleSelectedComplaint = useCallback(
    (suggestion: string, shouldRemove = true): void => {
      if (!selectedComplaints.includes(suggestion)) {
        append({
          complaint: suggestion,
          duration: { value: '', type: DurationType.Days },
        });
        scrollToComplaintFields();
      } else if (shouldRemove) {
        const index = complaintsHFC.findIndex(({ complaint }) => complaint === suggestion);
        if (index !== -1) {
          remove(index);
        }
      }
    },
    [complaintsHFC, selectedComplaints],
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
      scrollToComplaintFields();
    }
  }, [complaintSuggestions, otherComplaint, selectedComplaints]);

  const fetchSymptoms = useCallback(async (): Promise<void> => {
    const { payload } = await dispatch(getSystemSymptoms());
    setSystemSymptoms(payload as ISymptomMap);
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
      goToNext();
      clearDraft();
      setIsLoading(false);
      return;
    }

    const { payload } = await dispatch(addConsultationSymptom(consultationSymptomsRequest));
    toast(payload as Toast);
    setIsLoading(false);
    if (!showErrorToast(payload)) {
      clearDraft();
      goToNext();
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

  const handleApplyBulkDuration = useCallback(() => {
    if (!bulkDurationValue || Number(bulkDurationValue) <= 0) {
      return;
    }
    complaintFields.forEach((_, idx) => {
      setValue(`complaints.${idx}.duration.value`, bulkDurationValue);
      setValue(`complaints.${idx}.duration.type`, bulkDurationType);
    });
    void trigger('complaints');
  }, [bulkDurationType, bulkDurationValue, complaintFields]);

  // Populate form with existing symptoms data
  useEffect(() => {
    if (!symptoms) {
      return;
    }

    const {
      medicinesTaken,
      complaints,
      symptoms: patientSymptoms,
    } = symptoms as IConsultationSymptoms;

    setValue('medicinesTaken', medicinesTaken);
    if (complaints?.length > 0 && !hasSetComplaintDurations.current) {
      setValue('complaints', complaints);
      hasSetComplaintDurations.current = true;
    }

    if (systemSymptoms) {
      setValue('symptoms', patientSymptoms);
      const sectionsWithSymptoms = Object.keys(systemSymptoms).filter(
        (id) => (patientSymptoms[id as SymptomsType] ?? []).length > 0,
      );
      setExpandedSections(sectionsWithSymptoms);

      const symptomsMap = Object.fromEntries(
        Object.entries(systemSymptoms).map(([id, systemSymptomList]) => {
          const formattedPatientSymptoms = new Set(
            (patientSymptoms[id as SymptomsType] ?? []).map(({ name }) => name),
          );
          const updatedSystemSymptoms = systemSymptomList.filter(
            ({ name }) => !formattedPatientSymptoms.has(name),
          );
          return [id, updatedSystemSymptoms];
        }),
      ) as ISymptomMap;

      if (!_.isEqual(systemSymptoms, symptomsMap)) {
        setSystemSymptoms(symptomsMap);
      }
    }
  }, [symptoms, systemSymptoms, isLoadingComplaintSuggestions, complaintSuggestions]);

  return (
    <DndProvider backend={HTML5Backend}>
      <form onSubmit={handleSubmit(handleSubmitAndGoToLabs)}>
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
              className="bg-transparent"
              wrapperClassName="max-w-32"
              defaultMaxWidth={false}
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
                    label="Type"
                    className="w-28 bg-transparent"
                    ref={register(`complaints.${index}.duration.type`).ref}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    child={<Trash2 size={16} />}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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

        <div className="mt-10">
          <MedicationTaken control={control} medicationsTaken={watch('medicinesTaken') || []} />
        </div>

        <div
          className={cn(
            'fixed bottom-0 z-50 flex justify-between border-t border-gray-300 bg-white p-4 shadow-md',
            !isMobile && state === 'expanded'
              ? 'left-(--sidebar-width) w-[calc(100%-var(--sidebar-width))]'
              : 'left-0 w-full',
          )}
        >
          <div></div>
          <Button
            isLoading={isLoading}
            disabled={isLoading}
            child="Continue to Labs"
            type="submit"
          />
        </div>
      </form>
    </DndProvider>
  );
};

export default HistorySymptomsForm;
