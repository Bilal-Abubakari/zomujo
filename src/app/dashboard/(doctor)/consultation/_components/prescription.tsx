import React, { JSX, useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectInputV2, Combobox, SelectOption } from '@/components/ui/select';
import { doseRegimenOptions, routeOptions } from '@/constants/constants';
import { IPrescription, IPrescriptionResponse } from '@/types/medical.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useParams } from 'next/navigation';
import {
  savePrescriptions,
  generatePrescription,
  deletePrescription,
  getConsultationAppointment,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { getDrugs } from '@/lib/features/records/recordsThunk';
import { selectPrescriptions } from '@/lib/features/appointments/appointmentSelector';
import { Toast, toast } from '@/hooks/use-toast';
import { cn, showErrorToast } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
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
import { Modal } from '@/components/ui/dialog';
import { useDebounce } from 'use-debounce';

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
  goToPrevious: () => void;
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
  goToPrevious,
  updatePrescription,
  setUpdatePrescription,
}: PrescriptionProps): JSX.Element => {
  const { state, isMobile } = useSidebar();
  const dispatch = useAppDispatch();
  const params = useParams();
  const appointmentId = String(params.appointmentId);
  const existingPrescriptions = useAppSelector(selectPrescriptions);
  const [localPrescriptions, setLocalPrescriptions] = useState<IPrescription[]>([]);
  const [isSavingAndGenerating, setIsSavingAndGenerating] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  const [search, setSearch] = useState('');
  const [value] = useDebounce(search, 500);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [drugOptions, setDrugOptions] = useState<SelectOption[]>([]);

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

  useEffect(() => {
    const handleSearch = async (): Promise<void> => {
      setIsLoadingSearch(true);
      const { payload } = await dispatch(getDrugs(value));
      setDrugOptions(payload as SelectOption[]);
      setIsLoadingSearch(false);
    };
    void handleSearch();
  }, [value]);

  useEffect(() => {
    if (existingPrescriptions.length === 0 && localPrescriptions.length === 0) {
      const draft = LocalStorageManager.getJSON<IPrescription[]>(storageKey);
      if (draft && Array.isArray(draft)) {
        setLocalPrescriptions(draft);
      }
    }
  }, []);

  // Save draft
  useEffect(() => {
    if (existingPrescriptions.length === 0) {
      LocalStorageManager.setJSON(storageKey, localPrescriptions);
    }
  }, [localPrescriptions, existingPrescriptions.length, storageKey]);

  const clearDraft = (): void => {
    LocalStorageManager.removeJSON(storageKey);
  };

  const combinedPrescriptions: (IPrescriptionResponse | IPrescription)[] = useMemo(
    () => [...existingPrescriptions, ...localPrescriptions],
    [existingPrescriptions, localPrescriptions],
  );

  const onAddPrescription = (data: PrescriptionFormValues): void => {
    setLocalPrescriptions([...localPrescriptions, data]);
    setUpdatePrescription(false);
    setSearch('');
    reset();
  };

  const removeLocalPrescription = (index: number): void => {
    const newPrescriptions = [...localPrescriptions];
    newPrescriptions.splice(index, 1);
    setLocalPrescriptions(newPrescriptions);
  };

  const handleDeletePrescription = async (index: number, id?: string): Promise<void> => {
    if (index >= existingPrescriptions.length) {
      removeLocalPrescription(index - existingPrescriptions.length);
      return;
    }

    if (!id) {
      return;
    }

    setDeletingIndex(index);
    const { payload } = await dispatch(deletePrescription(id));
    toast(payload as Toast);

    if (!showErrorToast(payload)) {
      await dispatch(getConsultationAppointment(appointmentId));
    }
    setDeletingIndex(null);
  };

  const handleOpenNotesModal = (): void => {
    if (combinedPrescriptions.length === 0) {
      toast({ title: 'Please add prescriptions first.', variant: 'destructive' });
      return;
    }
    setShowNotesModal(true);
  };

  const handleSaveAndGenerate = async (): Promise<void> => {
    setShowNotesModal(false);
    setIsSavingAndGenerating(true);

    if (localPrescriptions.length > 0) {
      const prescriptionsPayload = combinedPrescriptions
        .map((p) => ({
          ...p,
          appointmentId,
        }))
        .filter((p) => !('id' in p));

      const request: IPrescriptionRequest = {
        appointmentId,
        prescriptions: prescriptionsPayload,
      };

      const saveResult = await dispatch(savePrescriptions(request)).unwrap();
      toast(saveResult);

      if (showErrorToast(saveResult)) {
        setIsSavingAndGenerating(false);
        return;
      }

      clearDraft();
      setLocalPrescriptions([]);
      await dispatch(getConsultationAppointment(appointmentId));
    }

    const result = await dispatch(generatePrescription({ appointmentId, notes: prescriptionNotes })).unwrap();

    if (showErrorToast(result)) {
      setIsSavingAndGenerating(false);
      return;
    }

    setPdfUrl(result as string);
    setShowPdfPreview(true);

    toast({ title: 'Prescription generated successfully!', variant: 'default' });

    await dispatch(getConsultationAppointment(appointmentId));

    setIsSavingAndGenerating(false);
  };

  const handleNextWithWarning = (): void => {
    if (localPrescriptions.length > 0) {
      setShowUnsavedWarning(true);
    } else {
      goToNext();
    }
  };

  const handleProceedWithoutSaving = (): void => {
    setShowUnsavedWarning(false);
    goToNext();
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
            <Combobox
              label="Name of Drug"
              onChange={(value) => setValue('name', value, { shouldValidate: true })}
              options={drugOptions}
              value={search}
              placeholder="Search name of drug"
              searchPlaceholder="Search for drug..."
              defaultMaxWidth={false}
              onSearchChange={(value) => setSearch(value)}
              isLoadingResults={isLoadingSearch}
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
        <div className="flex gap-2">
          <Button
            onClick={handleOpenNotesModal}
            isLoading={isSavingAndGenerating}
            disabled={isSavingAndGenerating || combinedPrescriptions.length === 0}
            child="Save & Generate PDF"
            variant="outline"
          />
          <Button onClick={() => setUpdatePrescription(true)} child="Add Prescription" />
        </div>
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
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeletePrescription(index, 'id' in p ? p.id : undefined)}
                isLoading={deletingIndex === index}
                disabled={deletingIndex === index}
                showChildWhenLoading={false}
                child={<Trash2 size={16} />}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        setState={setShowNotesModal}
        open={showNotesModal}
        content={
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Prescription Notes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add any additional notes to include in the prescription (optional).
            </p>
            <textarea
              value={prescriptionNotes}
              onChange={(e) => setPrescriptionNotes(e.target.value)}
              placeholder="Enter notes here..."
              rows={4}
              className="mt-4 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setShowNotesModal(false)}
                variant="outline"
                child="Cancel"
              />
              <Button onClick={() => void handleSaveAndGenerate()} child="Save & Generate PDF" />
            </div>
          </div>
        }
        showClose={true}
      />

      <Modal
        open={showPdfPreview}
        className="h-full w-full max-w-7xl"
        setState={setShowPdfPreview}
        showClose={true}
        content={
          <div className="h-full w-full">
            {pdfUrl ? (
              <iframe title="Prescription PDF" src={pdfUrl} className="mt-5 h-full w-full" />
            ) : (
              <div className="flex h-full items-center justify-center">Loading PDF...</div>
            )}
          </div>
        }
      />

      {addPrescriptionDrawer}

      <Modal
        setState={setShowUnsavedWarning}
        open={showUnsavedWarning}
        content={
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Unsaved Prescriptions</h3>
            <p className="mt-2 text-sm text-gray-600">
              You have {localPrescriptions.length} unsaved prescription
              {localPrescriptions.length > 1 ? 's' : ''}. Are you sure you want to proceed without
              saving?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setShowUnsavedWarning(false)}
                variant="outline"
                child="Go Back & Save"
              />
              <Button
                onClick={handleProceedWithoutSaving}
                child="Proceed Without Saving"
                variant="destructive"
              />
            </div>
          </div>
        }
        showClose={true}
      />

      <div
        className={cn(
          'fixed bottom-0 z-50 flex justify-between gap-4 border-t border-gray-300 bg-white p-4 shadow-md',
          !isMobile && state === 'expanded'
            ? 'left-(--sidebar-width) w-[calc(100%-var(--sidebar-width))]'
            : 'left-0 w-full',
        )}
      >
        <Button onClick={goToPrevious} variant="outline" child="Back to Investigation" />
        <Button onClick={handleNextWithWarning} child="Continue to Review" />
      </div>
    </div>
  );
};

export default Prescription;
