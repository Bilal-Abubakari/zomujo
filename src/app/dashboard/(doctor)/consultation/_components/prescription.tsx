import React, { JSX, useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectInputV2 } from '@/components/ui/select';
import { doseRegimenOptions, routeOptions } from '@/constants/constants';
import { IPrescription } from '@/types/medical.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useParams } from 'next/navigation';
import {
  savePrescriptions,
  generatePrescription,
  getConsultationDetail,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { selectPrescriptions } from '@/lib/features/appointments/appointmentSelector';
import { Toast, toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { AlertMessage } from '@/components/ui/alert';
import { IPrescriptionRequest } from '@/types/consultation.interface';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Trash2 } from 'lucide-react';
import { LocalStorageManager } from '@/lib/localStorage';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const prescriptionSchema = z.object({
  name: requiredStringSchema(),
  doses: requiredStringSchema(),
  route: requiredStringSchema(),
  numOfDays: requiredStringSchema().refine((val) => Number(val) > 0, {
    message: 'Number of days must be a positive number',
  }),
  doseRegimen: requiredStringSchema(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

interface PrescriptionProps {
  goToNext: () => void;
  updatePrescription: boolean;
  setUpdatePrescription: (value: boolean) => void;
}

const defaultMedicine: IPrescription = {
  name: '',
  doses: '',
  route: '',
  numOfDays: '',
  doseRegimen: '',
};

const Prescription = ({
  goToNext,
  updatePrescription,
  setUpdatePrescription,
}: PrescriptionProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const appointmentId = String(params.appointmentId);
  const existingPrescriptions = useAppSelector(selectPrescriptions);
  const [localPrescriptions, setLocalPrescriptions] = useState<IPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    setValue,
    watch,
    reset,
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    mode: 'onChange',
    defaultValues: defaultMedicine,
  });

  const storageKey = `consultation_${appointmentId}_prescription_draft`;

  // Restore draft
  useEffect(() => {
    if (existingPrescriptions.length === 0 && localPrescriptions.length === 0) {
      const draft = LocalStorageManager.getJSON<IPrescription[]>(storageKey);
      if (draft && Array.isArray(draft)) {
        setLocalPrescriptions(draft);
      }
    }
  }, [existingPrescriptions.length, localPrescriptions.length, storageKey]);

  // Save draft
  useEffect(() => {
    if (existingPrescriptions.length === 0) {
      LocalStorageManager.setJSON(storageKey, localPrescriptions);
    }
  }, [localPrescriptions, existingPrescriptions.length, storageKey]);

  const clearDraft = (): void => {
    LocalStorageManager.removeJSON(storageKey);
  };

  const combinedPrescriptions = useMemo(
    () => [...existingPrescriptions, ...localPrescriptions],
    [existingPrescriptions, localPrescriptions],
  );

  const onAddPrescription = (data: PrescriptionFormValues): void => {
    setLocalPrescriptions([...localPrescriptions, data]);
    setUpdatePrescription(false);
    reset();
  };

  const removeLocalPrescription = (index: number): void => {
    const newPrescriptions = [...localPrescriptions];
    newPrescriptions.splice(index, 1);
    setLocalPrescriptions(newPrescriptions);
  };

  const handleSave = async (): Promise<void> => {
    if (combinedPrescriptions.length === 0) {
      goToNext();
      return;
    }

    const prescriptionsPayload = combinedPrescriptions.map((p) => ({
      ...p,
      appointmentId,
    }));

    setIsLoading(true);
    const request: IPrescriptionRequest = {
      appointmentId,
      prescriptions: prescriptionsPayload,
    };

    const { payload } = await dispatch(savePrescriptions(request));
    toast(payload as Toast);

    if (!showErrorToast(payload)) {
      clearDraft();
      setLocalPrescriptions([]);
      dispatch(getConsultationDetail(appointmentId));
      if (isGenerating) {
        /* empty */
      } else {
        goToNext();
      }
    }
    setIsLoading(false);
  };

  const handleGenerate = async (): Promise<void> => {
    if (localPrescriptions.length > 0) {
      toast({ title: 'Please save prescriptions before generating.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    const { payload } = await dispatch(generatePrescription({ appointmentId, notes: '' }));
    toast(payload as Toast);
    if (!showErrorToast(payload)) {
      dispatch(getConsultationDetail(appointmentId));
    }
    setIsGenerating(false);
  };

  const addPrescriptionDrawer = (
    <Drawer direction="right" open={updatePrescription} onOpenChange={setUpdatePrescription}>
      <DrawerContent className="overflow-y-auto">
        <div className="mx-auto w-full max-w-sm p-4">
          <DrawerHeader className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-center text-lg">Add Prescription</DrawerTitle>
              <DrawerDescription className="text-center text-sm">
                Add medication for the patient
              </DrawerDescription>
            </div>
          </DrawerHeader>
          <form className="space-y-4" onSubmit={handleSubmit(onAddPrescription)}>
            <Input
              labelName="Name of Drug"
              placeholder="Enter name of drug"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              labelName="Dose Taken"
              placeholder="eg: 10mg"
              {...register('doses')}
              error={errors.doses?.message}
            />
            <SelectInputV2
              label="Route"
              options={routeOptions}
              value={watch('route')}
              onChange={(value) => setValue('route', value, { shouldValidate: true })}
              placeholder="Select route"
              className="bg-transparent"
            />
            <Input
              labelName="Number of Days"
              placeholder="eg: 7"
              type="number"
              {...register('numOfDays')}
              error={errors.numOfDays?.message}
            />
            <SelectInputV2
              label="Dose Regimen"
              options={doseRegimenOptions}
              value={watch('doseRegimen')}
              onChange={(value) => setValue('doseRegimen', value, { shouldValidate: true })}
              placeholder="Select dose regimen"
              className="bg-transparent"
            />

            <div className="space-x-3 pt-6">
              <Button disabled={!isValid} child="Add Drug" type="submit" />
              <Button
                onClick={() => setUpdatePrescription(false)}
                child="Cancel"
                type="button"
                variant="secondary"
              />
            </div>
          </form>
          <DrawerFooter></DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );

  return (
    <div className="mb-24 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Prescriptions</h3>
        <Button onClick={() => setUpdatePrescription(true)} child="Add Prescription" />
      </div>

      {combinedPrescriptions.length === 0 ? (
        <AlertMessage
          message='No prescriptions added. Click "Add Prescription" to add drugs.'
          variant="info"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {combinedPrescriptions.map((p, index) => (
            <div
              key={`${index}-${p.name}`}
              className="flex items-center justify-between rounded-md border bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500">
                  {p.doses} - {p.route} - {p.doseRegimen} for {p.numOfDays} days
                </p>
              </div>
              {/* Only allow deleting local ones or if we implement delete endpoint */}
              {index >= existingPrescriptions.length && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeLocalPrescription(index - existingPrescriptions.length)}
                  child={<Trash2 size={16} />}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {addPrescriptionDrawer}

      <div className="fixed bottom-0 left-0 flex w-full justify-end gap-4 border-t border-gray-300 bg-white p-4 shadow-md">
        <Button
          onClick={handleGenerate}
          isLoading={isGenerating}
          disabled={
            isGenerating || combinedPrescriptions.length === 0 || localPrescriptions.length > 0
          }
          child="Generate Prescription"
          variant="outline"
        />

        <Button onClick={handleSave} isLoading={isLoading} child="Next: Diagnosis" />

        <Button onClick={goToNext} child="Skip" variant="secondary" />
      </div>
    </div>
  );
};

export default Prescription;
