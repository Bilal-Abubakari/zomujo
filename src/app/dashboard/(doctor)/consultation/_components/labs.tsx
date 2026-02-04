import React, { JSX, useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { CategoryType, ILaboratoryRequest, LaboratoryTest } from '@/types/labs.interface';
import { z } from 'zod';
import { LabTestSection } from '@/types/labs.enum';
import { RequestStatus } from '@/types/shared.enum';
import { fetchLabs } from '@/lib/features/appointments/consultation/fetchLabs';
import { showErrorToast } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  getConsultationLabs,
  addLabRequests,
  downloadLabRequestPdf,
  getConsultationAppointment,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';
import { useParams } from 'next/navigation';
import { selectRequestedLabs } from '@/lib/features/appointments/appointmentSelector';
import { Modal } from '@/components/ui/dialog';
import LabCategorySection from '@/app/dashboard/(doctor)/consultation/_components/LabCategorySection';
import {
  INotification,
  NotificationEvent,
  NotificationTopic,
} from '@/types/notification.interface';
import useWebSocket from '@/hooks/useWebSocket';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';

const labsSchema = z.object({
  fasting: z.boolean(),
  testName: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  categoryType: z.string().optional(),
});

type LabFormData = z.infer<typeof labsSchema>;

export interface LabsRef {
  hasUnsavedChanges: boolean;
}

const Labs = React.forwardRef<LabsRef>((_, ref): JSX.Element => {
  const { on } = useWebSocket();
  const [labs, setLabs] = useState<LaboratoryTest | null>(null);
  const [selectedTests, setSelectedTests] = useState<
    Map<string, { category: string; categoryType: string }>
  >(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySpecimens, setCategorySpecimens] = useState<Map<string, string>>(new Map());
  const { handleSubmit } = useForm<LabFormData>({
    resolver: zodResolver(labsSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      fasting: false,
    },
  });
  const dispatch = useAppDispatch();
  const requestedAppointmentLabs = useAppSelector(
    selectRequestedLabs,
  ) as unknown as ILaboratoryRequest[];
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const recordId = useAppSelector(selectRecordId);
  const params = useParams();
  const [showPreview, setShowPreview] = useState(false);

  // Expose hasUnsavedChanges to parent via ref
  React.useImperativeHandle(ref, () => ({
    hasUnsavedChanges,
  }));

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
    const { payload } = await dispatch(getConsultationLabs(String(params.appointmentId)));
    if (showErrorToast(payload)) {
      toast(payload as Toast);
    }
  };

  const fetchPdf = async (): Promise<void> => {
    setIsLoadingPdf(true);
    const result = await dispatch(downloadLabRequestPdf(String(params.appointmentId)));
    setIsLoadingPdf(false);
    if (result.payload instanceof Blob) {
      const url = URL.createObjectURL(result.payload);
      setPdfUrl(url);
      setShowPreview(true);
    } else {
      toast(result.payload as Toast);
    }
  };

  const handleSaveLabs = async (data: LabFormData): Promise<void> => {
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

    const newLabRequests: ILaboratoryRequest[] = Array.from(selectedTests.entries()).map(
      ([testName, meta]) => {
        const specimenToUse = categorySpecimens.get(meta.category)!.trim();

        let existingId = '';
        let existingStatus = RequestStatus.Pending;

        if (requestedAppointmentLabs) {
          for (const lab of requestedAppointmentLabs) {
            if (lab.testName === testName) {
              existingId = lab.id;
              existingStatus = lab.status;
              break;
            }
          }
        }

        return {
          id: existingId,
          testName,
          category: meta.category as LabTestSection,
          categoryType: meta.categoryType as CategoryType,
          notes: '',
          fasting: data.fasting || false,
          specimen: specimenToUse,
          status: existingStatus,
        };
      },
    );

    const payload = {
      appointmentId: String(params.appointmentId),
      labs: newLabRequests,
      recordId,
    };

    // Uses PUT endpoint now
    const result = await dispatch(addLabRequests(payload));

    if (showErrorToast(result.payload)) {
      toast(result.payload as Toast);
      return;
    }

    // Refresh data
    void dispatch(getConsultationAppointment(String(params.appointmentId)));
    void fetchConsultationLabs();
    toast({
      title: 'Success',
      description: 'Laboratory requests updated successfully',
      variant: 'default',
    });

    // Open preview automatically
    void fetchPdf();
    setHasUnsavedChanges(false);
  };

  const extractSpecimenOptions = (testName: string): string[] | null => {
    const MAX_INPUT_LENGTH = 1000;
    if (testName.length > MAX_INPUT_LENGTH) {
      return null;
    }
    const openParenIndex = testName.indexOf('(');
    const closeParenIndex = testName.indexOf(')', openParenIndex);
    if (openParenIndex === -1 || closeParenIndex === -1 || closeParenIndex <= openParenIndex) {
      return null;
    }
    const content = testName.slice(openParenIndex + 1, closeParenIndex).trim();
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
      }
      return newMap;
    });
    setHasUnsavedChanges(true);
  };

  const handleSpecimenChange = (category: string, value: string): void => {
    const newSpecimens = new Map(categorySpecimens);
    if (value) {
      newSpecimens.set(category, value);
    } else {
      newSpecimens.delete(category);
    }
    setCategorySpecimens(newSpecimens);
    setHasUnsavedChanges(true);
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

  // Populate data from store
  useEffect(() => {
    if (requestedAppointmentLabs) {
      const prevTests = new Map<string, { category: string; categoryType: string }>();
      const prevSpecimens = new Map<string, string>();
      requestedAppointmentLabs.forEach((lab) => {
        prevTests.set(lab.testName, { category: lab.category, categoryType: lab.categoryType });
        prevSpecimens.set(lab.category, lab.specimen);
      });
      setSelectedTests(prevTests);
      setCategorySpecimens(prevSpecimens);
      setHasUnsavedChanges(false);
    }
  }, [requestedAppointmentLabs]);

  useEffect(() => {
    if (!labs) {
      void getLabsData();
    }
  }, [labs]);

  useEffect(() => {
    void fetchConsultationLabs();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return (): void => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(
    () => (): void => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    },
    [pdfUrl],
  );

  return (
    <>
      <Modal
        open={showPreview}
        className="h-full w-full max-w-7xl"
        setState={setShowPreview}
        showClose={true}
        content={
          <div className="h-full w-full">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="mt-5 h-full w-full" />
            ) : (
              <div className="flex h-full items-center justify-center">Loading PDF...</div>
            )}
          </div>
        }
      />

      <div className="relative w-full">
        {/*<div className="mb-6 flex items-center justify-between">*/}
        {/*  <div>*/}
        {/*    <h2 className="text-xl font-bold">Laboratory Request</h2>*/}
        {/*    <p className="mt-1 text-sm text-gray-600">*/}
        {/*      Select laboratory tests for the patient. Changes are saved when you click &quot;Update*/}
        {/*      Request&quot;.*/}
        {/*    </p>*/}
        {/*  </div>*/}
        {/*</div>*/}

        <form className="space-y-6" onSubmit={handleSubmit(handleSaveLabs)}>
          {/* Search Bar */}
          <div className="sticky top-0 z-20 flex justify-between">
            <div>
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
            <div className="flex gap-2">
              {requestedAppointmentLabs && requestedAppointmentLabs.length > 0 && (
                <Button
                  type="button"
                  onClick={() => void fetchPdf()}
                  child="Preview Request PDF"
                  variant="outline"
                  size="sm"
                />
              )}
              <Button child="Save and Preview" size="sm" disabled={selectedTests.size === 0} />
            </div>
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
                  onClick={() => {
                    setSelectedTests(new Map());
                    setCategorySpecimens(new Map());
                    setHasUnsavedChanges(true);
                  }}
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  Clear all selections
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
          <div className="mb-20 max-h-125 overflow-y-auto rounded-lg border bg-white p-4">
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
          {/*<div className="sticky bottom-0 z-20 flex justify-end space-x-3 border-t bg-white/95 p-4 backdrop-blur">*/}
          {/*  <Button*/}
          {/*    disabled={isAddingTests}*/}
          {/*    child={isAddingTests ? 'Updating Request...' : 'Update & Save Request'}*/}
          {/*    type="submit"*/}
          {/*  />*/}
          {/*</div>*/}
        </form>
        {isLoadingPdf && <LoadingOverlay message="Generating PDF..." />}
      </div>
    </>
  );
});

Labs.displayName = 'Labs';

export default Labs;
