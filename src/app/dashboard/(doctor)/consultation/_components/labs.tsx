import React, { JSX, useEffect, useMemo, useState } from 'react';
import { Info, TestTubeDiagonal, Trash2, Search, X } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import AddCardButton from '@/components/ui/addCardButton';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getConsultationLabs } from '@/lib/features/appointments/consultation/consultationThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { selectPreviousLabs } from '@/lib/features/patients/patientsSelector';
import { useParams } from 'next/navigation';
import { selectRequestedLabs } from '@/lib/features/appointments/appointmentSelector';
import { LabCard } from '@/app/dashboard/(doctor)/consultation/_components/labCard';
import { Modal } from '@/components/ui/dialog';
import LabCategorySection from '@/app/dashboard/(doctor)/consultation/_components/LabCategorySection';
import {
  INotification,
  NotificationEvent,
  NotificationTopic,
} from '@/types/notification.interface';
import useWebSocket from '@/hooks/useWebSocket';
import { LocalStorageManager } from '@/lib/localStorage';
import { selectCurrentLabRequest } from '@/lib/features/appointments/consultation/consultationSelector';
import {
  removeLabRequest,
  setCurrentLabRequest,
} from '@/lib/features/appointments/consultation/consultationSlice';

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
};

const Labs = ({ updateLabs, setUpdateLabs }: LabsProps): JSX.Element => {
  const { on } = useWebSocket();
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const currentRequestedLabs = useAppSelector(selectCurrentLabRequest);
  const [labs, setLabs] = useState<LaboratoryTest | null>(null);
  const [selectedTests, setSelectedTests] = useState<
    Map<string, { category: string; categoryType: string }>
  >(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySpecimens, setCategorySpecimens] = useState<Map<string, string>>(new Map());
  const { watch, handleSubmit, reset } = useForm<LabFormData>({
    resolver: zodResolver(labsSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      fasting: false,
    },
  });
  const dispatch = useAppDispatch();
  const [consultationLabs, setConsultationLabs] = useState<ILab[]>([]);
  const requestedAppointmentLabs = useAppSelector(selectRequestedLabs);
  const previousLabs = useAppSelector(selectPreviousLabs);
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

    dispatch(setCurrentLabRequest(newLabRequests));
    setSelectedTests(new Map()); // Clear selections
    setCategorySpecimens(new Map()); // Clear category specimens
    reset();
    setUpdateLabs(false);
  };

  const extractSpecimenOptions = (testName: string): string[] | null => {
    const MAX_INPUT_LENGTH = 1000;
    if (testName.length > MAX_INPUT_LENGTH) {
      return null;
    }
    const match = testName.match(/\(([^)]+?)\)/);
    if (!match) {
      return null;
    }
    const content = match[1].trim();
    if (!content) {
      return null;
    }
    return content
      .split(',')
      .map((option) => option.trim())
      .filter((option) => option.length > 0);
  };

  const toggleTestSelection = (testName: string, category: string, categoryType: string): void => {
    setSelectedTests((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(testName)) {
        newMap.delete(testName);

        const remainingTestsInCategory = Array.from(newMap.values()).some(
          (meta) => meta.category === category,
        );
        if (!remainingTestsInCategory) {
          setCategorySpecimens((specimens) => {
            const newSpecimens = new Map(specimens);
            newSpecimens.delete(category);
            return newSpecimens;
          });
        }
      } else {
        newMap.set(testName, { category, categoryType });

        const specimenOptions = extractSpecimenOptions(testName);

        if (specimenOptions?.length === 1) {
          const singleSpecimen = specimenOptions[0];
          setCategorySpecimens((specimens) => {
            const newSpecimens = new Map(specimens);
            if (!newSpecimens.has(category) || !newSpecimens.get(category)?.trim()) {
              newSpecimens.set(category, singleSpecimen);
            }
            return newSpecimens;
          });
        }
      }
      return newMap;
    });
  };

  const handleSpecimenChange = (category: string, value: string): void => {
    const newSpecimens = new Map(categorySpecimens);
    if (value) {
      newSpecimens.set(category, value);
    } else {
      newSpecimens.delete(category);
    }
    setCategorySpecimens(newSpecimens);
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

  useEffect(() => {
    if (updateLabs && !labs) {
      void getLabsData();
    }
  }, [updateLabs, labs]);

  useEffect(() => {
    if (updateLabs && !labs) {
      void getLabsData();
    }
  }, [updateLabs, labs]);

  // Populate selectedTests and categorySpecimens from currentRequestedLabs when modal opens
  useEffect(() => {
    if (updateLabs && currentRequestedLabs.length > 0) {
      const testsMap = new Map<string, { category: string; categoryType: string }>();
      const specimensMap = new Map<string, string>();

      currentRequestedLabs.forEach((lab) => {
        testsMap.set(lab.testName, {
          category: lab.category,
          categoryType: lab.categoryType,
        });
        // Set specimen for the category if not already set
        if (!specimensMap.has(lab.category)) {
          specimensMap.set(lab.category, lab.specimen);
        }
      });

      setSelectedTests(testsMap);
      setCategorySpecimens(specimensMap);
    }
  }, [updateLabs]);

  useEffect(() => {
    void fetchConsultationLabs();
  }, []);

  const requestedLab = ({ testName, notes, specimen }: ILaboratoryRequest): JSX.Element => (
    <div className="w-56 rounded-[8px] bg-[linear-gradient(180deg,rgba(197,216,255,0.306)_0%,rgba(197,216,255,0.6)_61.43%)] p-4">
      <div className="mb-3 flex justify-between">
        <span className="text-grayscale-600 flex items-center gap-2">
          <TestTubeDiagonal /> {testName}
        </span>
        <Trash2
          onClick={() => dispatch(removeLabRequest({ name: testName, requestSpecimen: specimen }))}
          className="cursor-pointer text-red-500"
        />
      </div>
      <p className="text-grayscale-600 max-w-xs text-xs">{notes}</p>
      <span className="text-xs">Specimen Type: {specimen}</span>
      {/*<div className="text-grayscale-600 mt-2 max-w-xs text-xs">*/}
      {/*  Fasting: <Badge>{fasting ? 'Yes' : 'No'}</Badge>*/}
      {/*</div>*/}
    </div>
  );

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
        <div className="mt-5 mb-20 flex flex-wrap gap-5">
          <AddCardButton onClick={() => setUpdateLabs(true)} />
          {(currentRequestedLabs ?? []).map((lab) => requestedLab(lab))}
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
              {/*<div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-4">*/}
              {/*  <Checkbox*/}
              {/*    name="fasting"*/}
              {/*    id="fasting"*/}
              {/*    checked={watch('fasting')}*/}
              {/*    onCheckedChange={(checked) => setValue('fasting', !!checked)}*/}
              {/*  />*/}
              {/*  <Label htmlFor="fasting" className="cursor-pointer">*/}
              {/*    Fasting required for all tests*/}
              {/*  </Label>*/}
              {/*</div>*/}

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
                  Object.entries(filteredLabs).map(([mainCategory, subCategories]) => (
                    <LabCategorySection
                      key={mainCategory}
                      mainCategory={mainCategory}
                      subCategories={subCategories as Record<string, string[]>}
                      selectedTests={selectedTests}
                      categorySpecimens={categorySpecimens}
                      onSpecimenChange={handleSpecimenChange}
                      onToggleTest={toggleTestSelection}
                      extractSpecimenOptions={extractSpecimenOptions}
                    />
                  ))
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
                  disabled={
                    selectedTests.size === 0 ||
                    Array.from(
                      new Set(Array.from(selectedTests.values()).map((m) => m.category)),
                    ).some(
                      (cat) => !categorySpecimens.get(cat) || !categorySpecimens.get(cat)?.trim(),
                    )
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
