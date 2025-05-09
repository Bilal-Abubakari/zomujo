import React, { JSX, useEffect, useMemo, useState } from 'react';
import { Info, TestTubeDiagonal, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { PdfFile } from '@/assets/images';
import { StatusBadge } from '@/components/ui/statusBadge';
import { RequestStatus } from '@/types/shared.enum';
import { getFormattedDate } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { CategoryType, ILaboratoryRequest, LaboratoryTest } from '@/types/labs.interface';
import { z } from 'zod';
import { SelectInput } from '@/components/ui/select';
import {
  ChemicalPathologyCategory,
  HaematologyCategory,
  ImmunologyCategory,
  LabTestSection,
  MicrobiologyCategory,
} from '@/types/labs.enum';
import { fetchLabs } from '@/lib/features/appointments/consultation/fetchLabs';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import { capitalize, showErrorToast } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import AddCardButton from '@/components/ui/addCardButton';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addLabRequests } from '@/lib/features/appointments/consultation/consultationThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { selectPreviousLabs, selectRecordId } from '@/lib/features/patients/patientsSelector';
import { useParams } from 'next/navigation';
import {
  selectConductedLabs,
  selectRequestedLabs,
} from '@/lib/features/appointments/appointmentSelector';

const labsSchema = z.object({
  category: z.nativeEnum(LabTestSection),
  categoryType: z.union([
    z.nativeEnum(ChemicalPathologyCategory),
    z.nativeEnum(HaematologyCategory),
    z.nativeEnum(ImmunologyCategory),
    z.nativeEnum(MicrobiologyCategory),
  ]),
  testName: requiredStringSchema(),
  notes: requiredStringSchema(),
  fasting: z.boolean(),
  specimen: requiredStringSchema(),
});

type LabsProps = {
  updateLabs: boolean;
  setUpdateLabs: (value: boolean) => void;
  goToDiagnoseAndPrescribe: () => void;
};

const Labs = ({ updateLabs, setUpdateLabs, goToDiagnoseAndPrescribe }: LabsProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestedLabs, setRequestedLabs] = useState<ILaboratoryRequest[]>([]);
  const [labs, setLabs] = useState<LaboratoryTest | null>(null);
  const {
    register,
    control,
    watch,
    resetField,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ILaboratoryRequest>({
    resolver: zodResolver(labsSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      fasting: false,
    },
  });
  const dispatch = useAppDispatch();
  const recordId = useAppSelector(selectRecordId);
  const conductedLabs = useAppSelector(selectConductedLabs);
  const requestedAppointmentLabs = useAppSelector(selectRequestedLabs);
  const previousLabs = useAppSelector(selectPreviousLabs);
  const [showPreviousLabs, setShowPreviousLabs] = useState(false);
  const params = useParams();
  const category = watch('category');
  const categoryType = watch('categoryType');

  const labCard = (
    <div className="rounded-[8px] border border-gray-300 p-4">
      <span className="text-grayscale-600 text-sm font-medium">Blood test</span>
      <div className="mt-2 flex w-full flex-col items-center justify-center gap-2 bg-[#F5F5F5] px-8 py-4">
        <Image src={PdfFile} alt="Pdf file" />
        <span className="text-xs">Ferritin Lab request.pdf</span>
      </div>
      <StatusBadge status={RequestStatus.Completed} approvedTitle="Completed" />
      <div className="mt-3 flex justify-between">
        <span className="text-grayscale-600 text-xs">Dr. Amuzu Jacob</span>
        <span className="text-grayscale-600 text-xs">{getFormattedDate(new Date())}</span>
      </div>
    </div>
  );

  const labTestSectionsOptions = useMemo(() => {
    resetField('categoryType', { defaultValue: '' as CategoryType });
    return Object.entries(labs ?? {}).map(([key]) => ({
      label: key,
      value: key,
    }));
  }, [labs, category]);

  const categoryTypeOptions = useMemo(() => {
    resetField('categoryType', { defaultValue: '' as CategoryType });
    resetField('testName', { defaultValue: '' });
    return Object.entries(labs?.[category] ?? {}).map(([key]) => ({
      label: key,
      value: key,
    }));
  }, [category, labs]);

  const testNameOptions = useMemo(() => {
    resetField('testName', {
      defaultValue: '',
    });
    if (!labs || !category || !categoryType) {
      return [];
    }
    const categoryMap = labs[category] as Record<CategoryType, string[]>;

    return categoryMap[categoryType].map((value) => ({
      label: value,
      value: value,
    }));
  }, [categoryType, labs]);

  const addLabRequest = async (data: ILaboratoryRequest): Promise<void> => {
    setRequestedLabs((prev) => [...prev, data]);
    reset();
    setUpdateLabs(false);
  };

  useEffect(() => {
    const getLabsData = async (): Promise<void> => {
      const response = await fetchLabs();
      if (response) {
        setLabs(response);
      }
    };
    if (updateLabs && !labs) {
      void getLabsData();
    }
  }, [updateLabs, labs]);

  const requestedLab = ({
    testName,
    notes,
    fasting,
    specimen,
  }: ILaboratoryRequest): JSX.Element => (
    <div className="w-xs rounded-[8px] bg-[linear-gradient(180deg,rgba(197,216,255,0.306)_0%,rgba(197,216,255,0.6)_61.43%)] p-4">
      <div className="mb-3 flex justify-between">
        <span className="text-grayscale-600 flex items-center gap-2">
          <TestTubeDiagonal /> {testName}
        </span>
        <Trash2
          onClick={() => removeLabRequest(testName, specimen)}
          className="cursor-pointer text-red-500"
        />
      </div>
      <p className="text-grayscale-600 max-w-xs text-xs">{notes}</p>
      <span className="text-xs">Specimen Type: {specimen}</span>
      <div className="text-grayscale-600 mt-2 max-w-xs text-xs">
        Fasting: <Badge>{fasting ? 'Yes' : 'No'}</Badge>
      </div>
    </div>
  );

  const removeLabRequest = (name: string, requestSpeciment: string): void => {
    setRequestedLabs((prev) =>
      prev.filter(({ testName, specimen }) => testName !== name && specimen !== requestSpeciment),
    );
  };

  const handleSubmitAndGoToExamination = async (): Promise<void> => {
    setIsLoading(true);
    if (requestedLabs.length) {
      const { payload } = await dispatch(
        addLabRequests({
          labs: requestedLabs,
          appointmentId: String(params.appointmentId),
          recordId,
        }),
      );
      toast(payload as Toast);
      if (!showErrorToast(payload)) {
        goToDiagnoseAndPrescribe();
      }
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    goToDiagnoseAndPrescribe();
  };

  return (
    <>
      <div>
        <h1 className="text-xl font-bold">Patient&#39;s Labs</h1>
        <h2 className="mt-10 flex items-center font-bold">
          Conducted Labs <Info className="ml-2" size={20} />
          {!!previousLabs?.length && (
            <button
              onClick={() => setShowPreviousLabs(true)}
              className="hover:text-primary ml-5 cursor-pointer text-gray-500"
            >
              Click to Show previous labs
            </button>
          )}
        </h2>
        {conductedLabs?.length ? (
          <div className="mt-5 flex flex-wrap gap-5">{conductedLabs.map(() => labCard)}</div>
        ) : (
          <div className="mt-5 text-gray-500">No labs conducted yet</div>
        )}
        {showPreviousLabs && previousLabs?.length && (
          <div className="mt-5 flex flex-wrap gap-5">{previousLabs.map(() => labCard)}</div>
        )}
        <h2 className="mt-10 flex items-center font-bold">Request Lab</h2>
        <div className="mt-5 mb-20 flex flex-wrap gap-5">
          <AddCardButton onClick={() => setUpdateLabs(true)} />
          {[...(requestedAppointmentLabs ?? []), ...requestedLabs].map((lab) => requestedLab(lab))}
        </div>
        <div className="fixed bottom-0 left-0 flex w-full justify-end border-t border-gray-300 bg-white p-4 shadow-md">
          <Button
            onClick={() => handleSubmitAndGoToExamination()}
            disabled={false}
            isLoading={isLoading}
            child="Go to Diagnose and Prescribe"
          />
        </div>
      </div>
      <Drawer direction="right" open={updateLabs}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-4">
            <DrawerHeader className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg">Add Laboratory Request</DrawerTitle>
                <DrawerDescription>
                  Add a laboratory request for patient to send to the lab
                </DrawerDescription>
              </div>
            </DrawerHeader>
            <form className="space-y-4" onSubmit={handleSubmit(addLabRequest)}>
              <SelectInput
                ref={register('category').ref}
                control={control}
                options={labTestSectionsOptions}
                name="category"
                label="Laboratory Category"
                placeholder="Select laboratory category"
                className="bg-transparent"
              />
              {category && (
                <SelectInput
                  ref={register('categoryType').ref}
                  control={control}
                  options={categoryTypeOptions}
                  name="categoryType"
                  label={`${capitalize(category)} Category`}
                  placeholder={`Select ${capitalize(category)} category`}
                  className="bg-transparent"
                />
              )}
              {categoryType && (
                <SelectInput
                  ref={register('testName').ref}
                  control={control}
                  options={testNameOptions}
                  name="testName"
                  label={`${capitalize(categoryType)} Test`}
                  placeholder={`Select ${capitalize(categoryType)} test`}
                  className="bg-transparent"
                />
              )}
              <Textarea
                labelName="Notes"
                placeholder="Add short notes about laboratory test request"
                {...register('notes')}
                error={errors?.notes?.message}
              />
              <Input
                labelName="Specimen"
                error={errors.specimen?.message}
                placeholder="Enter specimen to be used"
                {...register('specimen')}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="fasting"
                  id="fasting"
                  checked={watch('fasting')}
                  onCheckedChange={(checked) => setValue('fasting', !!checked)}
                />
                <Label htmlFor="fasting">Fasting</Label>
              </div>
              <div className="space-x-3">
                <Button
                  isLoading={isLoading}
                  disabled={!isValid || isLoading}
                  child="Save"
                  type="submit"
                />
                <Button
                  disabled={isLoading}
                  onClick={() => setUpdateLabs(false)}
                  child="Close"
                  type="button"
                  variant="secondary"
                />
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Labs;
