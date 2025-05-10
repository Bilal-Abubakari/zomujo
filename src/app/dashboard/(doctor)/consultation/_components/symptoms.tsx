import React, { JSX, useEffect, useMemo, useState } from 'react';
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
import { SelectInput } from '@/components/ui/select';
import { durationTypes, MODE } from '@/constants/constants';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  IConsultationSymptomsHFC,
  IConsultationSymptomsRequest,
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
import Loading from '@/components/loadingOverlay/loading';
import MedicationTaken from '@/app/dashboard/(doctor)/consultation/_components/medicationTaken';
import { useParams } from 'next/navigation';
import { selectSymptoms } from '@/lib/features/appointments/appointmentSelector';
import _ from 'lodash';
import { IAppointmentSymptoms } from '@/types/appointment.interface';

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
  medicinesTaken: z.array(
    z.object({
      name: requiredStringSchema(),
      dose: z.string(),
    }),
  ),
});

type SymptomsProps = {
  goToLabs: () => void;
};

const Symptoms = ({ goToLabs }: SymptomsProps): JSX.Element => {
  const symptoms = useAppSelector(selectSymptoms);
  const [isLoading, setIsLoading] = useState(false);
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
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(false);
  const [isLoadingComplaintSuggestions, setIsLoadingComplaintSuggestions] = useState(false);
  const [complaintSuggestions, setComplaintSuggestions] = useState<string[]>([]);
  const [otherComplaint, setOtherComplaint] = useState<string>('');
  const [systemSymptoms, setSystemSymptoms] = useState<ISymptomMap>();
  const params = useParams();
  const complaintsHFC = watch('complaints');

  const selectedComplaints = useMemo(() => complaintsHFC?.map(({ name }) => name), [complaintsHFC]);

  const handleSelectedComplaint = (suggestion: string, shouldRemove = true): void => {
    if (!selectedComplaints.includes(suggestion)) {
      append({
        name: suggestion,
      });
    } else if (shouldRemove) {
      const index = complaintsHFC.findIndex(({ name }) => name === suggestion);
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
      complaintSuggestions.includes(otherComplaint) || selectedComplaints.includes(otherComplaint);
    if (!complaintExists) {
      setComplaintSuggestions((prev) => [...prev, otherComplaint]);
      append({
        name: otherComplaint,
      });
      setOtherComplaint('');
    }
  };

  const fetchSymptoms = async (): Promise<void> => {
    setIsLoadingSymptoms(true);
    const { payload } = await dispatch(getSystemSymptoms());
    setSystemSymptoms(payload as ISymptomMap);
    setIsLoadingSymptoms(false);
  };

  const handleSubmitAndGoToLabs = async (data: IConsultationSymptomsHFC): Promise<void> => {
    const existingSymptoms: Partial<IAppointmentSymptoms> | undefined = _.cloneDeep(symptoms);
    if (existingSymptoms) {
      delete existingSymptoms.id;
      delete existingSymptoms.createdAt;
    }
    setIsLoading(true);
    const complaints = data.complaints.map(({ name }) => name);
    const consultationSymptomsRequest: IConsultationSymptomsRequest = {
      ...data,
      complaints,
      appointmentId: String(params.appointmentId),
    };
    if (_.isEqual(existingSymptoms, consultationSymptomsRequest)) {
      goToLabs();
      setIsLoading(false);
      return;
    }

    const { payload } = await dispatch(addConsultationSymptom(consultationSymptomsRequest));
    toast(payload as Toast);
    setIsLoading(false);
    if (!showErrorToast(payload)) {
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
  }, []);

  useEffect(() => {
    if (symptoms) {
      const { medicinesTaken, duration, complaints, symptoms: patientSymptoms } = symptoms;
      setValue('duration', duration, {
        shouldValidate: true,
      });

      if (!isLoadingComplaintSuggestions) {
        complaints.forEach((complaint) => {
          if (complaintSuggestions.includes(complaint)) {
            handleSelectedComplaint(complaint, false);
          } else {
            setOtherComplaint(complaint);
            addComplaint();
            setOtherComplaint('');
          }
        });
      }

      setValue('medicinesTaken', medicinesTaken);
      if (systemSymptoms) {
        setValue('symptoms', patientSymptoms);
        let symptomsMap = _.cloneDeep(systemSymptoms);
        Object.entries(systemSymptoms).forEach(([id, symptoms]) => {
          const formattedPatientSymptoms = (patientSymptoms[id as SymptomsType] ?? []).map(
            ({ name }) => name,
          );
          const updatedSystemSymptoms = symptoms.filter(
            ({ name }) => !formattedPatientSymptoms.includes(name),
          );
          symptomsMap = {
            ...symptomsMap,
            [id]: updatedSystemSymptoms,
          };
        });
        if (!_.isEqual(systemSymptoms, symptomsMap)) {
          setSystemSymptoms(symptomsMap);
        }
      }
    }
  }, [symptoms, systemSymptoms, isLoadingComplaintSuggestions]);

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
            type="button"
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
        {isLoadingSymptoms ? (
          <Loading message="Please wait. Loading System Symptoms.." />
        ) : (
          Object.entries(systemSymptoms ?? {}).map(([id, symptoms]) => (
            <SelectSymptoms
              key={`${id}-${JSON.stringify(symptoms)}`}
              symptoms={symptoms}
              id={id}
              control={control}
              setValue={setValue}
              selectedSymptoms={watch(`symptoms.${id as SymptomsType}`)}
            />
          ))
        )}
        <h1 className="mt-12 text-xl font-bold">Medication Taken</h1>
        <MedicationTaken medicationsTaken={watch('medicinesTaken')} control={control} />
        <div className="mt-20"></div>
        <div className="fixed bottom-0 left-0 flex w-full justify-end border-t border-gray-300 bg-white p-4 shadow-md">
          <Button isLoading={isLoading} disabled={!isValid || isLoading} child="Go to Labs" />
        </div>
      </form>
    </DndProvider>
  );
};

export default Symptoms;
