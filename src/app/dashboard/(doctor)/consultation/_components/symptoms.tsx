import React, { JSX, useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import {
  getComplaintSuggestions,
  getSystemSymptoms,
} from '@/lib/features/consultation/consultationThunk';
import { cn, showErrorToast } from '@/lib/utils';
import { toast, Toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SelectInput } from '@/components/ui/select';
import { durationTypes, MODE } from '@/constants/constants';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  IConsultationSymptomsHFC,
  ISymptomMap,
  SymptomsType,
} from '@/types/consultation.interface';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import SelectSymptoms from '@/app/dashboard/(doctor)/consultation/_components/selectSymptoms';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DurationType } from '@/types/shared.enum';
import { requiredStringSchema } from '@/schemas/zod.schemas';

const symptomsSchema = z.object({
  complaints: z.array(
    z.object({
      name: requiredStringSchema(),
    }),
  ),
  duration: z.object({
    value: requiredStringSchema(),
    type: z.nativeEnum(DurationType),
  }),
  symptoms: z.object({
    [SymptomsType.Neurological]: z.array(
      z.object({
        name: requiredStringSchema(),
        notes: z.string().optional(),
      }),
    ),
    [SymptomsType.Cardiovascular]: z.array(
      z.object({
        name: requiredStringSchema(),
        notes: z.string().optional(),
      }),
    ),
    [SymptomsType.Gastrointestinal]: z.array(
      z.object({
        name: requiredStringSchema(),
        notes: z.string().optional(),
      }),
    ),
    [SymptomsType.Genitourinary]: z.array(
      z.object({
        name: requiredStringSchema(),
        notes: z.string().optional(),
      }),
    ),
    [SymptomsType.Musculoskeletal]: z.array(
      z.object({
        name: requiredStringSchema(),
        notes: z.string().optional(),
      }),
    ),
    [SymptomsType.Integumentary]: z.array(
      z.object({
        name: requiredStringSchema(),
        notes: z.string().optional(),
      }),
    ),
    [SymptomsType.Endocrine]: z.array(
      z.object({
        name: requiredStringSchema(),
        notes: z.string().optional(),
      }),
    ),
  }),
});

const Symptoms = (): JSX.Element => {
  const {
    control,
    formState: { isValid },
    register,
    watch,
    setValue,
    handleSubmit,
  } = useForm<IConsultationSymptomsHFC>({
    resolver: zodResolver(symptomsSchema),
    mode: MODE.ON_TOUCH,
  });
  const { append, remove } = useFieldArray({
    control,
    name: 'complaints',
  });
  const dispatch = useAppDispatch();
  const [complaintSuggestions, setComplaintSuggestions] = useState<string[]>([]);
  const [otherComplaint, setOtherComplaint] = useState<string>('');
  const [systemSymptoms, setSystemSymptoms] = useState<ISymptomMap>();
  const complaintsHFC = watch('complaints');

  const complaints = useMemo(() => complaintsHFC?.map(({ name }) => name), [complaintsHFC]);

  const handleSelectedComplaint = (suggestion: string): void => {
    if (!complaints.includes(suggestion)) {
      append({
        name: suggestion,
      });
    } else {
      const index = watch('complaints').findIndex((complaint) => complaint.name === suggestion);
      if (index !== -1) {
        remove(index);
      }
    }
  };

  const addComplaint = (): void => {
    if (!otherComplaint) {
      return;
    }
    const complaintExists =
      complaintSuggestions.includes(otherComplaint) || complaints.includes(otherComplaint);
    if (!complaintExists) {
      setComplaintSuggestions((prev) => [...prev, otherComplaint]);
      append({
        name: otherComplaint,
      });
      setOtherComplaint('');
    }
  };

  const fetchSymptoms = async (): Promise<void> => {
    const { payload } = await dispatch(getSystemSymptoms());
    setSystemSymptoms(payload as ISymptomMap);
  };

  const handleSubmitAndGoToLabs = async (
    consultationSymptoms: IConsultationSymptomsHFC,
  ): Promise<void> => {
    //TODO: Make request as soon as backend endpoint is ready
    console.log('consultationSymptoms', consultationSymptoms);
  };

  useEffect(() => {
    void fetchSymptoms();
    const handleComplaintSuggestions = async (): Promise<void> => {
      const { payload } = await dispatch(getComplaintSuggestions());
      if (!showErrorToast(payload)) {
        setComplaintSuggestions(payload as string[]);
        return;
      }
      toast(payload as Toast);
    };
    void handleComplaintSuggestions();
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <form onSubmit={handleSubmit(handleSubmitAndGoToLabs)}>
        <h1 className="text-xl font-bold">Complaint</h1>
        <form className="mt-8 flex flex-wrap gap-5">
          {complaintSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSelectedComplaint(suggestion)}
              className={cn(
                'cursor-pointer rounded-[100px] p-2.5',
                complaints.includes(suggestion) ? 'bg-primary text-white' : 'bg-gray-200',
              )}
            >
              {suggestion}
            </button>
          ))}
        </form>
        <div className="mt-8 flex gap-2">
          <Input
            value={otherComplaint}
            onChange={({ target }) => setOtherComplaint(target.value)}
            labelName="Add complaint if not part of suggestions"
            className="bg-transparent"
          />
          <Button
            disabled={!otherComplaint}
            onClick={() => addComplaint()}
            className="self-end"
            child="Add"
          />
        </div>
        <h1 className="mt-8 text-xl font-bold">Duration</h1>
        <div className="mt-5 flex max-w-lg">
          <Input
            {...register('duration.value')}
            className="max-w-sm bg-transparent"
            placeholder={'Number of days, weeks or months'}
            type="number"
          />
          <SelectInput
            ref={register('duration.type').ref}
            control={control}
            options={durationTypes}
            name="duration.type"
            placeholder="Select days, weeks or months"
            className="bg-transparent"
          />
        </div>
        <h1 className="mt-12 text-xl font-bold">Symptoms</h1>
        {Object.entries(systemSymptoms ?? {}).map(([id, symptoms]) => (
          <SelectSymptoms
            key={id}
            symptoms={symptoms}
            id={id}
            control={control}
            setValue={setValue}
            selectedSymptoms={watch(`symptoms.${id as SymptomsType}`)}
          />
        ))}
        <div className="mt-20"></div>
        <div className="fixed bottom-0 left-0 flex w-full justify-end border-t border-gray-300 bg-white p-4 shadow-md">
          <Button
            disabled={!isValid}
            onClick={() => console.log('Go to Labs')}
            child="Go to Labs"
          />
        </div>
      </form>
    </DndProvider>
  );
};

export default Symptoms;
