import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { SelectInput } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { ConditionStatus } from '@/types/shared.enum';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { conditionStatusOptions, MODE } from '@/constants/constants';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { DiagnosesList } from '@/app/dashboard/(doctor)/consultation/_components/ConditionCard';
import { IDiagnosis } from '@/types/medical.interface';
import { selectUserName } from '@/lib/features/auth/authSelector';
import {
  saveDiagnosis,
  deleteDiagnosis,
  getConsultationAppointment,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams } from 'next/navigation';
import { Toast, toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { selectDiagnoses } from '@/lib/features/appointments/appointmentSelector';
import { LocalStorageManager } from '@/lib/localStorage';
import { IDiagnosisOnlyRequest } from '@/types/consultation.interface';
import { Textarea } from '@/components/ui/textarea';
import { Plus, AlertCircle } from 'lucide-react';

const conditionsSchema = z.object({
  name: z.string().min(1, 'Impression is required'),
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isRemovingIndex, setIsRemovingIndex] = useState<number | null>(null);
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
  const [diagnoses, setDiagnoses] = useState<Omit<IDiagnosis, 'prescriptions'>[]>([]);
  const doctorName = useAppSelector(selectUserName);

  const dispatch = useAppDispatch();

  const combinedDiagnoses = useMemo(
    () => [...savedDiagnoses, ...diagnoses.map((d) => ({ ...d, prescriptions: [] }))],
    [savedDiagnoses, diagnoses],
  );

  const storageKey = `consultation_${params?.appointmentId}_diagnosis_only_draft`;

  useEffect(() => {
    void dispatch(getConsultationAppointment(String(params.appointmentId)));
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
  }, [storageKey]);

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
    if (editingIndex !== null) {
      // Update existing diagnosis
      const newDiagnoses = [...diagnoses];
      newDiagnoses[editingIndex] = diagnosis;
      setDiagnoses(newDiagnoses);
      setEditingIndex(null);
    } else {
      // Add new diagnosis
      setDiagnoses([
        {
          ...diagnosis,
        },
        ...diagnoses,
      ]);
    }
    reset({
      diagnosedAt: new Date().toISOString(),
      status: ConditionStatus.Active,
      name: '',
      notes: '',
    });
    setUpdateDiagnosis(false);
    clearDraft();
  };

  const editDiagnosis = (index: number): void => {
    if (index >= savedDiagnoses.length) {
      const localIndex = index - savedDiagnoses.length;
      const diagnosis = diagnoses[localIndex];
      setValue('name', diagnosis.name);
      setValue('status', diagnosis.status);
      setValue('notes', diagnosis.notes || '');
      setValue('diagnosedAt', diagnosis.diagnosedAt);
      setEditingIndex(localIndex);
      setUpdateDiagnosis(true);
    }
  };

  const removeDiagnosis = async (index: number): Promise<void> => {
    setIsRemovingIndex(index);
    try {
      if (index < savedDiagnoses.length) {
        const diagnosis = combinedDiagnoses[index];
        if ('id' in diagnosis) {
          const { payload } = await dispatch(deleteDiagnosis(diagnosis.id));
          toast(payload as Toast);
          if (!showErrorToast(payload)) {
            await dispatch(getConsultationAppointment(String(params.appointmentId)));
          }
        }
      } else {
        const localIndex = index - savedDiagnoses.length;
        const newDiagnoses = [...diagnoses];
        newDiagnoses.splice(localIndex, 1);
        setDiagnoses(newDiagnoses);
      }
    } finally {
      setIsRemovingIndex(null);
    }
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

  const addDiagnosisDrawer = (
    <Drawer
      direction="right"
      open={updateDiagnosis}
      onOpenChange={(open) => {
        if (!open) {
          setUpdateDiagnosis(false);
          setEditingIndex(null);
          reset({
            diagnosedAt: new Date().toISOString(),
            status: ConditionStatus.Active,
            name: '',
            notes: '',
          });
        }
      }}
    >
      <DrawerContent className="overflow-y-auto">
        <div className="mx-auto w-full max-w-md p-6">
          <DrawerHeader className="mb-6 px-0">
            <div className="flex flex-col gap-1">
              <DrawerTitle className="text-2xl font-semibold text-gray-900">
                {editingIndex !== null ? 'Edit Impression' : 'Add New Impression'}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-gray-500">
                {editingIndex !== null
                  ? 'Update the impression information below'
                  : 'Record your impression for this encounter'}
              </DrawerDescription>
            </div>
          </DrawerHeader>
          <form className="space-y-6" onSubmit={handleSubmit(onAddDiagnosis)}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Impression</label>
              <Input placeholder="Enter impression" {...register('name')} className="h-10" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Condition Status</label>
              <SelectInput
                ref={register('status').ref}
                control={control}
                options={conditionStatusOptions}
                name="status"
                placeholder="Select status"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Clinical Notes</label>
              <Textarea
                placeholder="Add observations, severity or specific details..."
                {...register('notes')}
                className="min-h-30 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                isLoading={isLoading}
                disabled={!isValid || isLoading}
                className="flex-1"
                child={editingIndex !== null ? 'Update Impression' : 'Save Impression'}
                type="submit"
              />
              <Button
                disabled={isLoading}
                onClick={() => {
                  setUpdateDiagnosis(false);
                  setEditingIndex(null);
                  reset({
                    diagnosedAt: new Date().toISOString(),
                    status: ConditionStatus.Active,
                    name: '',
                    notes: '',
                  });
                }}
                child="Cancel"
                type="button"
                variant="outline"
              />
            </div>
          </form>
          <DrawerFooter className="flex justify-between"></DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Impression</h1>
          <p className="mt-1 text-sm text-gray-500">
            Record and manage impression for this encounter
          </p>
        </div>
        {combinedDiagnoses.length > 0 && (
          <Button
            onClick={() => {
              setEditingIndex(null);
              setUpdateDiagnosis(true);
            }}
            variant="default"
            child={
              <>
                <Plus className="h-4 w-4" />
                Add Impression
              </>
            }
          />
        )}
      </div>

      <section className="rounded-lg border bg-white p-6">
        {combinedDiagnoses.length <= 0 ? (
          <button
            onClick={() => {
              setEditingIndex(null);
              setUpdateDiagnosis(true);
            }}
            className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="bg-primary/10 text-primary mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">No Impression Yet</h3>
            <p className="max-w-md text-center text-sm text-gray-500">
              Click to add a impression for this encounter
            </p>
          </button>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>Click on any card to edit or remove impression</span>
            </div>
            <DiagnosesList
              doctorName={doctorName}
              conditions={combinedDiagnoses as IDiagnosis[]}
              remove={removeDiagnosis}
              edit={editDiagnosis}
              isRemovingIndex={isRemovingIndex}
            />
          </>
        )}
      </section>

      {addDiagnosisDrawer}

      <div className="fixed bottom-0 left-0 flex w-full justify-end border-t border-gray-300 bg-white p-4 shadow-md">
        <Button
          onClick={() => onSubmit()}
          isLoading={isLoading}
          disabled={isLoading || combinedDiagnoses.length === 0}
          child="Next: Review"
        />
      </div>
    </div>
  );
};

export default Diagnosis;
