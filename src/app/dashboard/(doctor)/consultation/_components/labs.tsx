import React, { JSX, useEffect, useMemo, useState } from 'react';
import { Info, TestTubeDiagonal, Trash2, AlertCircle } from 'lucide-react';
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
import { CategoryType, ILab, ILaboratoryRequest, LaboratoryTest } from '@/types/labs.interface';
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
import {
  addLabRequests,
  getConsultationLabs,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { selectPreviousLabs, selectRecordId } from '@/lib/features/patients/patientsSelector';
import { useParams } from 'next/navigation';
import { selectRequestedLabs } from '@/lib/features/appointments/appointmentSelector';
import { LabCard } from '@/app/dashboard/(doctor)/consultation/_components/labCard';
import { Modal } from '@/components/ui/dialog';
import Signature from '@/components/signature/signature';
import { selectDoctorSignature } from '@/lib/features/doctors/doctorsSelector';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  INotification,
  NotificationEvent,
  NotificationTopic,
} from '@/types/notification.interface';
import useWebSocket from '@/hooks/useWebSocket';

const labsSchema = z.object({
  category: z.enum(LabTestSection),
  categoryType: z.union([
    z.enum(ChemicalPathologyCategory),
    z.enum(HaematologyCategory),
    z.enum(ImmunologyCategory),
    z.enum(MicrobiologyCategory),
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
  const { on } = useWebSocket();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const [currentRequestedLabs, setCurrentRequestedLabs] = useState<ILaboratoryRequest[]>([]);
  const [labs, setLabs] = useState<LaboratoryTest | null>(null);
  const [openAddSignature, setOpenAddSignature] = useState(false);
  const [addSignature, setAddSignature] = useState(false);
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
  const [consultationLabs, setConsultationLabs] = useState<ILab[]>([]);
  const requestedAppointmentLabs = useAppSelector(selectRequestedLabs);
  const previousLabs = useAppSelector(selectPreviousLabs);
  const doctorSignature = useAppSelector(selectDoctorSignature);
  const hasSignature = !!doctorSignature;
  const [showPreviousLabs, setShowPreviousLabs] = useState(false);
  const params = useParams();
  const category = watch('category');
  const categoryType = watch('categoryType');

  on(NotificationEvent.NewNotification, (data: unknown) => {
    const { payload } = data as INotification;
    if (payload.topic === NotificationTopic.LabUpload) {
      void fetchConsultationLabs();
    }
  });

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

  const getLabsData = async (): Promise<void> => {
    const response = await fetchLabs();
    if (response) {
      setLabs(response);
    }
  };

  const fetchConsultationLabs = async (): Promise<void> => {
    setIsLoadingLabs(true);
    const { payload } = await dispatch(getConsultationLabs(String(params.appointmentId)));
    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setIsLoadingLabs(false);
      return;
    }
    setConsultationLabs(payload as ILab[]);
    setIsLoadingLabs(false);
  };

  const addLabRequest = async (data: ILaboratoryRequest): Promise<void> => {
    setCurrentRequestedLabs((prev) => [...prev, data]);
    reset();
    setUpdateLabs(false);

    // Show signature alert if no signature exists
    if (!hasSignature) {
      setTimeout(() => {
        const alertElement = document.getElementById('signature-alert');
        if (alertElement) {
          alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (updateLabs && !labs) {
      void getLabsData();
    }
  }, [updateLabs, labs]);

  useEffect(() => {
    void fetchConsultationLabs();
  }, []);

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
    setCurrentRequestedLabs((prev) =>
      prev.filter(({ testName, specimen }) => testName !== name && specimen !== requestSpeciment),
    );
  };

  const handleSubmitAndGoToExamination = async (): Promise<void> => {
    setIsLoading(true);
    const totalLabRequests = [...(requestedAppointmentLabs ?? []), ...currentRequestedLabs];

    // Check if there are lab requests and signature is required but not added
    if (totalLabRequests.length > 0 && !hasSignature) {
      setOpenAddSignature(true);
      setIsLoading(false);
      return;
    }

    if (currentRequestedLabs.length) {
      const { payload } = await dispatch(
        addLabRequests({
          labs: currentRequestedLabs,
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

  useEffect(() => {
    if (addSignature) {
      setOpenAddSignature(true);
    }
  }, [addSignature]);

  useEffect(() => {
    if (!openAddSignature) {
      setAddSignature(false);
    }
  }, [openAddSignature]);

  const renderLabsContent = (): JSX.Element => {
    if (isLoadingLabs) {
      return (
        <div className="mt-5 flex items-center justify-center py-10">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <span className="ml-3 text-gray-500">Loading labs...</span>
        </div>
      );
    }

    if (consultationLabs?.length) {
      return (
        <div className="mt-5 flex flex-wrap gap-5">
          {consultationLabs.map(({ testName, id, fileUrl, status, createdAt, notes }) => (
            <LabCard
              key={id}
              testName={testName}
              fileUrl={fileUrl}
              status={status}
              date={createdAt}
              notes={notes}
            />
          ))}
        </div>
      );
    }

    return <div className="mt-5 text-gray-500">No labs conducted yet</div>;
  };

  return (
    <>
      <Modal
        setState={setOpenAddSignature}
        open={openAddSignature}
        content={
          <Signature
            signatureAdded={() => setOpenAddSignature(false)}
            hasExistingSignature={hasSignature}
          />
        }
        showClose={true}
      />
      <div>
        <h1 className="text-xl font-bold">Patient&#39;s Labs</h1>
        <h2 className="mt-10 flex items-center font-bold max-sm:text-sm">
          Requested Labs <Info className="ml-2" size={20} />
          {!!previousLabs?.length && (
            <button
              onClick={() => setShowPreviousLabs((prev) => !prev)}
              className="hover:text-primary ml-5 cursor-pointer text-gray-500 max-sm:ml-3"
            >
              {showPreviousLabs ? 'Click to hide previous labs' : 'Click to Show previous labs'}
            </button>
          )}
        </h2>
        {renderLabsContent()}
        {showPreviousLabs && previousLabs?.length && (
          <>
            <h2 className="mt-10 flex items-center font-bold">Labs From Previous Consultations</h2>
            <div className="mt-5 flex flex-wrap gap-5">
              {previousLabs.map(({ testName, id, fileUrl, status, createdAt, notes }) => (
                <LabCard
                  key={id}
                  testName={testName}
                  fileUrl={fileUrl}
                  status={status}
                  date={createdAt}
                  notes={notes}
                />
              ))}
            </div>
          </>
        )}
        <h2 className="mt-10 flex items-center font-bold">Request Lab</h2>

        {[...(requestedAppointmentLabs ?? []), ...currentRequestedLabs].length > 0 && (
          <Alert id="signature-alert" variant="info" className="my-4 border-amber-500 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-amber-800">
                {hasSignature
                  ? 'You can edit your digital signature if needed.'
                  : 'Lab requests require your digital signature before proceeding.'}
              </span>
              <button
                onClick={() => setOpenAddSignature(true)}
                className="ml-4 text-sm font-semibold text-amber-700 underline hover:text-amber-900"
              >
                {hasSignature ? 'Edit signature' : 'Add now'}
              </button>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-5 mb-20 flex flex-wrap gap-5">
          <AddCardButton onClick={() => setUpdateLabs(true)} />
          {(currentRequestedLabs ?? []).map((lab) => requestedLab(lab))}
        </div>
        {[...(requestedAppointmentLabs ?? []), ...currentRequestedLabs].length > 0 && (
          <div className="fixed right-4 bottom-16 flex items-center space-x-2 rounded-lg border bg-white p-4 shadow-lg">
            <Label htmlFor="signature-labs">
              {hasSignature ? 'Edit digital Signature' : 'Add digital Signature'}
            </Label>
            <Switch
              checked={addSignature}
              id="signature-labs"
              onCheckedChange={() => setAddSignature((prev) => !prev)}
            />
          </div>
        )}
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
