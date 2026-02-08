import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Combobox, SelectInput, SelectOption } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { AlertMessage } from '@/components/ui/alert';
import AddCardButton from '@/components/ui/addCardButton';
import { ConditionStatus } from '@/types/shared.enum';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { conditionStatusOptions, MODE } from '@/constants/constants';
import { z } from 'zod';
import { getConditions } from '@/lib/features/records/recordsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useDebounce } from 'use-debounce';
import {
  ConditionsList,
  DiagnosesList,
} from '@/app/dashboard/(doctor)/consultation/_components/ConditionCard';
import { IDiagnosis } from '@/types/medical.interface';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { saveDiagnosis } from '@/lib/features/appointments/consultation/consultationThunk'; // New thunk
import { useParams } from 'next/navigation';
import { selectConditions } from '@/lib/features/patients/patientsSelector';
import { Toast, toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { selectDiagnoses } from '@/lib/features/appointments/appointmentSelector';
import { LocalStorageManager } from '@/lib/localStorage';
import { IDiagnosisOnlyRequest } from '@/types/consultation.interface';
import { Textarea } from '@/components/ui/textarea';

const conditionsSchema = z.object({
  name: z.string(),
  notes: z.string().optional(),
  status: z.enum(ConditionStatus),
  diagnosedAt: z.string(),
});

type DiagnosisFormValues = z.infer<typeof conditionsSchema>;

type DiagnosisProps = {
  updateDiagnosis: boolean;
  setUpdateDiagnosis: (value: boolean) => void;
  goToNext: () => void;
};

const Diagnosis = ({
  updateDiagnosis,
  setUpdateDiagnosis,
  goToNext,
}: DiagnosisProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    setValue,
    formState: { isValid },
    handleSubmit,
    watch,
    control,
    register,
    reset,
  } = useForm<DiagnosisFormValues>({
    defaultValues: {
      diagnosedAt: new Date().toISOString(),
      status: ConditionStatus.Active,
    },
    resolver: zodResolver(conditionsSchema),
    mode: MODE.ON_TOUCH,
  });

  const params = useParams();
  const savedDiagnoses = useAppSelector(selectDiagnoses);
  const [conditionOptions, setConditionOptions] = useState<SelectOption[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [diagnoses, setDiagnoses] = useState<Omit<IDiagnosis, 'prescriptions'>[]>([]);
  const doctorName = useAppSelector(selectUserName);
  const existingConditions = useAppSelector(selectConditions);

  const [search, setSearch] = useState('');
  const [value] = useDebounce(search, 1000);
  const dispatch = useAppDispatch();

  const combinedDiagnoses = useMemo(
    () => [...savedDiagnoses, ...diagnoses.map((d) => ({ ...d, prescriptions: [] }))],
    [savedDiagnoses, diagnoses],
  );

  const storageKey = `consultation_${params?.appointmentId}_diagnosis_only_draft`;

  useEffect(() => {
    if (savedDiagnoses.length === 0 && diagnoses.length === 0) {
      const draft = LocalStorageManager.getJSON<{
        diagnoses: Omit<IDiagnosis, 'prescriptions'>[];
        form: Partial<DiagnosisFormValues>;
      }>(storageKey);
      if (draft) {
        setDiagnoses(draft.diagnoses ?? []);
        if (draft.form) {
          Object.entries(draft.form).forEach(([k, v]) => {
            setValue(k as keyof DiagnosisFormValues, v as never);
          });
        }
      }
    }
  }, [savedDiagnoses, diagnoses.length, storageKey, setValue]);

  useEffect(() => {
    if (savedDiagnoses.length === 0) {
      const formSnapshot: Partial<DiagnosisFormValues> = {
        name: watch('name'),
        status: watch('status'),
        notes: watch('notes'),
        diagnosedAt: watch('diagnosedAt'),
      };
      LocalStorageManager.setJSON(storageKey, {
        diagnoses,
        form: formSnapshot,
      });
    }
  }, [diagnoses, watch, savedDiagnoses.length, storageKey]);

  const clearDraft = (): void => {
    LocalStorageManager.removeJSON(storageKey);
  };

  const onAddDiagnosis = (diagnosis: DiagnosisFormValues): void => {
    setDiagnoses([
      {
        ...diagnosis,
      },
      ...diagnoses,
    ]);
    setSearch('');
    reset();
    setUpdateDiagnosis(false);
    clearDraft();
  };

  const onSubmit = async (): Promise<void> => {
    if (diagnoses.length <= 0) {
      goToNext();
      return;
    }
    setIsLoading(true);
    const diagnosisRequest: IDiagnosisOnlyRequest = {
      diagnoses: diagnoses,
      appointmentId: String(params.appointmentId),
    };

    const { payload } = await dispatch(saveDiagnosis(diagnosisRequest));
    toast(payload as Toast);
    if (!showErrorToast(payload)) {
      clearDraft();
      goToNext();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const handleSearch = async (): Promise<void> => {
      setIsLoadingSearch(true);
      const { payload } = await dispatch(getConditions(value));
      setConditionOptions(payload as SelectOption[]);
      setIsLoadingSearch(false);
    };
    void handleSearch();
  }, [value]);

  const addDiagnosisDrawer = (
    <Drawer direction="right" open={updateDiagnosis}>
      <DrawerContent className="overflow-y-auto">
        <div className="mx-auto w-full max-w-sm p-4">
          <DrawerHeader className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-center text-lg">Add Diagnosis</DrawerTitle>
              <DrawerDescription className="text-center text-sm">
                Diagnose your patient
              </DrawerDescription>
            </div>
          </DrawerHeader>
          <form className="space-y-4" onSubmit={handleSubmit(onAddDiagnosis)}>
            <Combobox
              label="Add Condition Diagnosed"
              onChange={(value) => setValue('name', value, { shouldValidate: true })}
              options={conditionOptions}
              value={search}
              placeholder="Search condition"
              searchPlaceholder="Search for condition..."
              defaultMaxWidth={false}
              onSearchChange={(value) => setSearch(value)}
              isLoadingResults={isLoadingSearch}
            />
            <SelectInput
              label="Status of Condition"
              ref={register('status').ref}
              control={control}
              options={conditionStatusOptions}
              name="status"
              placeholder="Select status of condition"
              className="bg-transparent"
            />
            <Textarea placeholder="Add notes" {...register('notes')} className="mt-4" />

            <div className="space-x-3 pt-6">
              <Button
                isLoading={isLoading}
                disabled={!isValid || isLoading}
                child="Save"
                type="submit"
              />
              <Button
                disabled={isLoading}
                onClick={() => {
                  setUpdateDiagnosis(false);
                }}
                child="Close"
                type="button"
                variant="secondary"
              />
            </div>
          </form>
          <DrawerFooter className="flex justify-between"></DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );

  return (
    <div>
      <span className="font-bold">Existing Conditions</span>
      <div className="mt-5 flex gap-4">{<ConditionsList conditions={existingConditions} />}</div>
      <div className="mt-10">
        {combinedDiagnoses.length <= 0 && (
          <AlertMessage
            message='No specific diagnosis has been recorded for this encounter. Click on the "+" icon to include a diagnosis for this encounter.'
            className="mb-4 max-w-4xl"
            variant="info"
          />
        )}
        <span className="font-bold">Add New Diagnosis</span>
        <div className="mt-5 mb-16 flex gap-4">
          <DiagnosesList
            // remove={remove} // Need to implement remove for new list?
            doctorName={doctorName}
            conditions={combinedDiagnoses as IDiagnosis[]}
          >
            <AddCardButton onClick={() => setUpdateDiagnosis(true)} />
          </DiagnosesList>
        </div>
      </div>
      {addDiagnosisDrawer}
      <div className="fixed bottom-0 left-0 flex w-full justify-end border-t border-gray-300 bg-white p-4 shadow-md">
        <Button
          onClick={() => onSubmit()}
          isLoading={isLoading}
          disabled={isLoading || combinedDiagnoses.length === 0}
          child="Next: Prescription"
        />
      </div>
    </div>
  );
};

export default Diagnosis;
