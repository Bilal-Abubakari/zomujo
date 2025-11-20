import React, { JSX, useEffect, useMemo, useState } from 'react';
import { Info, TestTubeDiagonal, Trash2, AlertCircle, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { CategoryType, ILab, ILaboratoryRequest, LaboratoryTest } from '@/types/labs.interface';
import { z } from 'zod';
import { LabTestSection } from '@/types/labs.enum';
import { fetchLabs } from '@/lib/features/appointments/consultation/fetchLabs';
import { showErrorToast } from '@/lib/utils';
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
import { LocalStorageManager } from '@/lib/localStorage';

const labsSchema = z.object({
  fasting: z.boolean(),
  testName: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  categoryType: z.string().optional(),
});

type LabFormData = z.infer<typeof labsSchema>;

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
  const [selectedTests, setSelectedTests] = useState<
    Map<string, { category: string; categoryType: string }>
  >(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySpecimens, setCategorySpecimens] = useState<Map<string, string>>(new Map());
  const { watch, setValue, handleSubmit, reset } = useForm<LabFormData>({
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
  const storageKey = `consultation_${params?.appointmentId}_labs_draft`;

  on(NotificationEvent.NewNotification, (data: unknown) => {
    const { payload } = data as INotification;
    if (payload.topic === NotificationTopic.LabUpload) {
      void fetchConsultationLabs();
    }
  });

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

  const addLabRequest = async (data: LabFormData): Promise<void> => {
    // Validate specimens per category: each selected category must have a specimen provided
    const selectedCategories = Array.from(
      new Set(Array.from(selectedTests.values()).map((m) => m.category)),
    );
    const missingCategories = selectedCategories.filter(
      (cat) => !categorySpecimens.get(cat) || !categorySpecimens.get(cat)?.trim(),
    );

    if (missingCategories.length > 0) {
      toast({
        title: 'Specimen required',
        description: `Please provide specimen for: ${missingCategories.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    // Create lab requests from all selected tests
    const newLabRequests: ILaboratoryRequest[] = Array.from(selectedTests.entries()).map(
      ([testName, meta]) => {
        const specimenToUse = categorySpecimens.get(meta.category)!.trim();
        return {
          testName,
          category: meta.category as LabTestSection,
          categoryType: meta.categoryType as CategoryType,
          notes: '', // Notes removed as per requirement
          fasting: data.fasting || false,
          specimen: specimenToUse,
        };
      },
    );

    if (newLabRequests.length === 0) {
      toast({
        title: 'No tests selected',
        description: 'Please select at least one laboratory test',
        variant: 'destructive',
      });
      return;
    }

    setCurrentRequestedLabs((prev) => [...prev, ...newLabRequests]);
    setSelectedTests(new Map()); // Clear selections
    setCategorySpecimens(new Map()); // Clear category specimens
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

  const toggleTestSelection = (testName: string, category: string, categoryType: string): void => {
    setSelectedTests((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(testName)) {
        newMap.delete(testName);
      } else {
        newMap.set(testName, { category, categoryType });
      }
      return newMap;
    });
  };

  const filteredLabs = useMemo(() => {
    if (!labs) {
      return null;
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return labs;
    }

    const filtered: Partial<LaboratoryTest> = {};

    Object.entries(labs).forEach(([mainCategory, subCategories]) => {
      const filteredSubCategories: Record<string, string[]> = {};

      Object.entries(subCategories).forEach(([subCategory, tests]) => {
        const testsArray = tests as string[];
        const filteredTests = testsArray.filter(
          (test: string) =>
            test.toLowerCase().includes(query) ||
            subCategory.toLowerCase().includes(query) ||
            mainCategory.toLowerCase().includes(query),
        );

        if (filteredTests.length > 0) {
          filteredSubCategories[subCategory] = filteredTests;
        }
      });

      if (Object.keys(filteredSubCategories).length > 0) {
        filtered[mainCategory as LabTestSection] = filteredSubCategories as Record<
          CategoryType,
          string[]
        >;
      }
    });

    return filtered as LaboratoryTest;
  }, [labs, searchQuery]);

  // Restore draft
  useEffect(() => {
    if (!requestedAppointmentLabs || requestedAppointmentLabs.length === 0) {
      const draft = LocalStorageManager.getJSON<{
        currentRequestedLabs: ILaboratoryRequest[];
        selectedTests: [string, { category: string; categoryType: string }][];
        categorySpecimens: [string, string][];
        fasting: boolean;
      }>(storageKey);
      if (draft) {
        setCurrentRequestedLabs(draft.currentRequestedLabs ?? []);
        setSelectedTests(new Map(draft.selectedTests ?? []));
        setCategorySpecimens(new Map(draft.categorySpecimens ?? []));
        setValue('fasting', draft.fasting ?? false);
      }
    }
  }, [requestedAppointmentLabs, storageKey, setValue]);

  // Persist draft whenever relevant state changes and there is no saved labs on server
  useEffect(() => {
    if (!requestedAppointmentLabs || requestedAppointmentLabs.length === 0) {
      const draft = {
        currentRequestedLabs,
        selectedTests: Array.from(selectedTests.entries()),
        categorySpecimens: Array.from(categorySpecimens.entries()),
        fasting: watch('fasting'),
      };
      LocalStorageManager.setJSON(storageKey, draft);
    }
  }, [
    currentRequestedLabs,
    selectedTests,
    categorySpecimens,
    watch,
    requestedAppointmentLabs,
    storageKey,
  ]);

  const clearDraft = (): void => {
    LocalStorageManager.removeJSON(storageKey);
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
    // Fix logic: remove matching by both testName & specimen
    setCurrentRequestedLabs((prev) =>
      prev.filter(
        ({ testName, specimen }) => !(testName === name && specimen === requestSpeciment),
      ),
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
        clearDraft();
        goToDiagnoseAndPrescribe();
      }
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    clearDraft();
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
      <Modal
        setState={(value) => setUpdateLabs(typeof value === 'function' ? value(updateLabs) : value)}
        open={updateLabs}
        showClose={true}
        className="h-full w-full max-w-[90%] p-5"
        content={
          <div className="w-full overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Add Laboratory Request</h2>
              <p className="mt-1 text-gray-600">
                Select laboratory tests for the patient. You can select multiple tests. Provide a
                specimen for each category you select.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(addLabRequest)}>
              {/* Fasting Checkbox */}
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <Checkbox
                  name="fasting"
                  id="fasting"
                  checked={watch('fasting')}
                  onCheckedChange={(checked) => setValue('fasting', !!checked)}
                />
                <Label htmlFor="fasting" className="cursor-pointer">
                  Fasting required for all tests
                </Label>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Search for tests, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Selected Tests Summary */}
              {selectedTests.size > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-900">
                      {selectedTests.size} test{selectedTests.size !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTests(new Map())}
                      className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from(selectedTests.keys()).map((testName) => (
                      <Badge key={testName} variant="secondary" className="px-3 py-1">
                        {testName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Tests Grid */}
              <div className="max-h-[50vh] overflow-y-auto rounded-lg border">
                {filteredLabs && Object.entries(filteredLabs).length > 0 ? (
                  Object.entries(filteredLabs).map(([mainCategory, subCategories]) => {
                    const hasSelectedTestsInCategory = Array.from(selectedTests.values()).some(
                      (meta) => meta.category === mainCategory,
                    );
                    const specimenValue = categorySpecimens.get(mainCategory) || '';
                    const specimenMissing = hasSelectedTestsInCategory && !specimenValue.trim();
                    return (
                      <div key={mainCategory} className="border-b last:border-b-0">
                        <div className="sticky top-0 z-10 bg-gray-50 px-4 py-3">
                          <h3 className="text-lg font-bold text-gray-800">{mainCategory}</h3>
                        </div>
                        <div className="space-y-4 p-4">
                          {/* Category-specific specimen field - show when tests selected in this category */}
                          {hasSelectedTestsInCategory && (
                            <div
                              className={`mb-4 rounded-md border ${
                                specimenMissing
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-amber-200 bg-amber-50'
                              } p-3`}
                            >
                              <Input
                                labelName={`Specimen for ${mainCategory} (required)`}
                                placeholder="Enter specimen (e.g., Blood, Urine)"
                                value={specimenValue}
                                onChange={(e) => {
                                  const newSpecimens = new Map(categorySpecimens);
                                  if (e.target.value) {
                                    newSpecimens.set(mainCategory, e.target.value);
                                  } else {
                                    newSpecimens.delete(mainCategory);
                                  }
                                  setCategorySpecimens(newSpecimens);
                                }}
                                className="bg-white"
                              />
                              <p
                                className={`mt-1 text-xs ${
                                  specimenMissing ? 'text-red-600' : 'text-amber-700'
                                }`}
                              >
                                {specimenMissing
                                  ? 'Specimen is required for selected tests in this category.'
                                  : `Provide specimen for all ${mainCategory} tests`}
                              </p>
                            </div>
                          )}

                          {Object.entries(subCategories).map(([subCategory, tests]) => (
                            <div key={subCategory} className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-700">{subCategory}</h4>
                              <div className="grid grid-cols-1 gap-3 pl-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {(tests as string[]).map((test: string) => (
                                  <div key={test} className="flex items-start space-x-2">
                                    <Checkbox
                                      id={`${mainCategory}-${subCategory}-${test}`}
                                      checked={selectedTests.has(test)}
                                      onCheckedChange={() =>
                                        toggleTestSelection(test, mainCategory, subCategory)
                                      }
                                    />
                                    <Label
                                      htmlFor={`${mainCategory}-${subCategory}-${test}`}
                                      className="cursor-pointer text-sm leading-tight"
                                    >
                                      {test}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery ? (
                      <>
                        <Search className="mx-auto mb-2 text-gray-400" size={40} />
                        <p>No tests found matching &quot;{searchQuery}&quot;</p>
                      </>
                    ) : (
                      <p>Loading laboratory tests...</p>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky Action Buttons */}
              <div className="sticky bottom-0 z-20 flex justify-end space-x-3 border-t bg-white/95 p-4 backdrop-blur">
                <Button
                  disabled={isLoading}
                  onClick={() => {
                    setUpdateLabs(false);
                    setSelectedTests(new Map());
                    setCategorySpecimens(new Map());
                    setSearchQuery('');
                  }}
                  child="Cancel"
                  type="button"
                  variant="secondary"
                />
                <Button
                  isLoading={isLoading}
                  disabled={
                    selectedTests.size === 0 ||
                    Array.from(
                      new Set(Array.from(selectedTests.values()).map((m) => m.category)),
                    ).some(
                      (cat) => !categorySpecimens.get(cat) || !categorySpecimens.get(cat)?.trim(),
                    ) ||
                    isLoading
                  }
                  child={
                    selectedTests.size > 0
                      ? `Add ${selectedTests.size} Test${selectedTests.size !== 1 ? 's' : ''}`
                      : 'Add Tests'
                  }
                  type="submit"
                />
              </div>
            </form>
          </div>
        }
      />
    </>
  );
};

export default Labs;
