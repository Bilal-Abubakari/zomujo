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
import React, { ChangeEvent, JSX, useEffect, useMemo, useState } from 'react';
import { AlertMessage } from '@/components/ui/alert';
import AddCardButton from '@/components/ui/addCardButton';
import { ConditionStatus } from '@/types/shared.enum';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { conditionStatusOptions, MODE } from '@/constants/constants';
import { z } from 'zod';
import { getConditions } from '@/lib/features/records/recordsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useDebounce } from 'use-debounce';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  DiagnosisCard,
  DiagnosesList,
  ConditionsList,
} from '@/app/dashboard/(doctor)/consultation/_components/ConditionCard';
import { IDiagnosis, IPrescription } from '@/types/medical.interface';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { addDiagnosisAndPrescription } from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams } from 'next/navigation';
import { selectConditions } from '@/lib/features/patients/patientsSelector';
import { Toast, toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { selectDiagnoses } from '@/lib/features/appointments/appointmentSelector';
import { requiredStringSchema } from '@/schemas/zod.schemas';

const conditionsSchema = z.object({
  name: z.string(),
  prescriptions: z
    .array(
      z.object({
        name: requiredStringSchema(),
        doses: requiredStringSchema(),
        instructions: z.string().optional(),
        frequency: z.string(),
      }),
    )
    .min(1),
  notes: z.string().optional(),
  status: z.enum(ConditionStatus),
  diagnosedAt: z.string(),
});

const defaultMedicine: IPrescription = {
  name: '',
  doses: '',
  instructions: '',
  frequency: '',
};

type DiagnosePrescribeProps = {
  updateDiagnosis: boolean;
  setUpdateDiagnosis: (value: boolean) => void;
  goToReview: () => void;
};

const DiagnosePrescribe = ({
  updateDiagnosis,
  setUpdateDiagnosis,
  goToReview,
}: DiagnosePrescribeProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    setValue,
    formState: { isValid, errors },
    handleSubmit,
    watch,
    control,
    register,
    reset,
  } = useForm<IDiagnosis>({
    defaultValues: {
      diagnosedAt: new Date().toISOString(),
    },
    resolver: zodResolver(conditionsSchema),
    mode: MODE.ON_TOUCH,
  });
  const { append, remove } = useFieldArray({
    control,
    name: 'prescriptions',
  });
  const params = useParams();
  const savedDiagnoses = useAppSelector(selectDiagnoses);
  const [conditionOptions, setConditionOptions] = useState<SelectOption[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [diagnoses, setDiagnoses] = useState<IDiagnosis[]>([]);
  const doctorName = useAppSelector(selectUserName);
  const existingConditions = useAppSelector(selectConditions);

  const [search, setSearch] = useState('');
  const [value] = useDebounce(search, 1000);
  const dispatch = useAppDispatch();
  const [addMedicine, setAddMedicine] = useState<IPrescription>(defaultMedicine);
  const combinedDiagnoses = useMemo(
    () => [...savedDiagnoses, ...diagnoses],
    [savedDiagnoses, diagnoses],
  );

  const onAddDiagnosis = (diagnosis: IDiagnosis): void => {
    setDiagnoses([
      {
        ...diagnosis,
      },
      ...diagnoses,
    ]);
    setSearch('');
    reset();
    setUpdateDiagnosis(false);
  };

  const onSubmit = async (): Promise<void> => {
    if (diagnoses.length <= 0) {
      goToReview();
      return;
    }
    setIsLoading(true);
    const { payload } = await dispatch(
      addDiagnosisAndPrescription({
        diagnoses,
        appointmentId: String(params.appointmentId),
      }),
    );
    toast(payload as Toast);
    if (!showErrorToast(payload)) {
      goToReview();
    }
    setIsLoading(false);
  };

  const handleAddMedicineChange = ({
    target,
  }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = target;
    setAddMedicine((prev) => ({
      ...prev,
      [name]: value,
    }));
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
              <DrawerTitle className="text-center text-lg">Diagnosis and Prescription</DrawerTitle>
              <DrawerDescription className="text-center text-sm">
                Diagnose your patient and add medication to be taken
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
            <Textarea
              labelName="Notes"
              placeholder="Add short notes about the condition"
              {...register('notes')}
              error={errors?.notes?.message}
            />
            {watch('name') && (
              <>
                <div className="mt-8 text-center text-sm text-gray-500">
                  Add drugs you took for this condition
                </div>
                <div className="space-y-4">
                  <Input
                    labelName="Name of Drug"
                    placeholder="Enter name of drug for condition"
                    name="name"
                    value={addMedicine.name}
                    onChange={handleAddMedicineChange}
                  />
                  <Input
                    labelName="Dose Taken"
                    placeholder="eg: 10mg"
                    name="doses"
                    value={addMedicine.doses}
                    onChange={handleAddMedicineChange}
                  />
                  <Input
                    labelName="Frequency"
                    placeholder="eg: once daily"
                    name="frequency"
                    value={addMedicine.frequency}
                    onChange={handleAddMedicineChange}
                  />
                  <Textarea
                    labelName="Instructions"
                    placeholder="Instructions for taking this medicine"
                    name="instructions"
                    value={addMedicine.instructions}
                    onChange={handleAddMedicineChange}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    disabled={!addMedicine.name || !addMedicine.doses}
                    child="Add Drug"
                    onClick={() => {
                      append(addMedicine);
                      setAddMedicine(defaultMedicine);
                    }}
                    type="submit"
                  />
                </div>
              </>
            )}
            <div className="mt-8 text-center text-sm text-gray-500">
              Preview of added condition and medicines
            </div>
            <DiagnosisCard
              status={watch('status')}
              notes={watch('notes')}
              name={watch('name')}
              diagnosedAt={watch('diagnosedAt')}
              doctor={doctorName}
              prescription={watch('prescriptions')}
              removeMedicine={remove}
            />
            <div className="space-x-3">
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
            message='No specific diagnosis has been recorded for this appointment. Click on the "+" icon to include a diagnosis for this encounter.'
            className="mb-4 max-w-4xl"
            variant="info"
          />
        )}
        <span className="font-bold">Add New Diagnosis</span>
        <div className="mt-5 mb-16 flex gap-4">
          <DiagnosesList remove={remove} doctorName={doctorName} conditions={combinedDiagnoses}>
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
          child="Review"
        />
      </div>
    </div>
  );
};

export default DiagnosePrescribe;
