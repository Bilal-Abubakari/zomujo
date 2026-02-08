import React, { JSX, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { CategoryType, ILaboratoryRequest, LaboratoryTest } from '@/types/labs.interface';
import { z } from 'zod';
import { LabTestSection } from '@/types/labs.enum';
import { RequestStatus } from '@/types/shared.enum';
import { fetchLabs } from '@/lib/features/appointments/consultation/fetchLabs';
import { showErrorToast } from '@/lib/utils';
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
import LabCategorySection from '@/app/dashboard/(doctor)/consultation/_components/LabCategorySection';
import {
  INotification,
  NotificationEvent,
  NotificationTopic,
} from '@/types/notification.interface';
import useWebSocket from '@/hooks/useWebSocket';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import InvestigationBase, {
  InvestigationBaseRef,
} from '@/app/dashboard/(doctor)/consultation/_components/shared/InvestigationBase';
import {
  useInvestigationFilter,
  usePdfPreview,
} from '@/app/dashboard/(doctor)/consultation/_components/shared/investigationHooks';

const labsSchema = z.object({
  fasting: z.boolean(),
  testName: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  categoryType: z.string().optional(),
});

type LabFormData = z.infer<typeof labsSchema>;

export type LabsRef = InvestigationBaseRef;

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

  // Use shared hooks
  const filteredLabs = useInvestigationFilter(labs, searchQuery);
  const pdfPreview = usePdfPreview();

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
      // Clean up old PDF URL before creating new one
      pdfPreview.cleanup(pdfUrl);
      const url = pdfPreview.createUrl(result.payload);
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
      (cat) => !categorySpecimens.get(cat)?.trim(),
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

    void dispatch(getConsultationAppointment(String(params.appointmentId)));
    void fetchConsultationLabs();
    toast({
      title: 'Success',
      description: 'Laboratory requests updated successfully',
      variant: 'default',
    });

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

  return (
    <>
      <InvestigationBase
        ref={ref}
        title="Laboratory Request"
        description="Select laboratory tests for the patient. Changes are saved when you click Save and Preview."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSelections={() => {
          setSelectedTests(new Map());
          setCategorySpecimens(new Map());
          setHasUnsavedChanges(true);
        }}
        onSubmit={() => handleSubmit(handleSaveLabs)()}
        onPreviewPdf={fetchPdf}
        isSubmitting={false}
        hasExistingData={requestedAppointmentLabs !== null && requestedAppointmentLabs.length > 0}
        pdfUrl={pdfUrl}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        hasUnsavedChanges={hasUnsavedChanges}
        getSelectedCount={() => selectedTests.size}
        getSelectedTestNames={() => Array.from(selectedTests.keys())}
        renderContent={() => (
          <div className="mb-20 max-h-125 overflow-y-auto rounded-lg border bg-white p-4">
            {filteredLabs && Object.entries(filteredLabs).length > 0 ? (
              Object.entries(filteredLabs).map(([mainCategory, subCategories]) => (
                <LabCategorySection
                  key={mainCategory}
                  mainCategory={mainCategory}
                  subCategories={subCategories}
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
        )}
      />
      {isLoadingPdf && <LoadingOverlay message="Generating PDF..." />}
    </>
  );
});

Labs.displayName = 'Labs';

export default Labs;
