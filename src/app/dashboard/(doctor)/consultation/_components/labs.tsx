import React, { JSX, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { CategoryType, ILab, ILaboratoryRequest, LaboratoryTest } from '@/types/labs.interface';
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
import { LabsForm, labsSchema } from '@/schemas/labs.schema';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

type LabFormData = LabsForm;

export type LabsRef = InvestigationBaseRef;

const Labs = React.forwardRef<LabsRef>((_, ref): JSX.Element => {
  const { on } = useWebSocket();
  const [labs, setLabs] = useState<LaboratoryTest | null>(null);
  const [state, setState] = useState<{
    selectedTests: Map<string, { category: string; categoryType: string }>;
  }>({
    selectedTests: new Map(),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LabFormData>({
    resolver: zodResolver(labsSchema),
    mode: MODE.ON_TOUCH,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    }
  };

  const fetchConsultationLabs = async (): Promise<void> => {
    const response = await dispatch(getConsultationLabs(String(params.appointmentId))).unwrap();
    if (showErrorToast(response)) {
      toast(response as Toast);
      return;
    }
    const lab = response as ILab[];
    console.log('Lab', lab);
    setValue('labs', lab[0].data);
    setValue('history', lab[0].history, { shouldValidate: true });
    setValue('instructions', lab[0].instructions, { shouldValidate: true });
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
    console.log('Saving lab data', data);
    setIsSubmitting(true);
    const newLabRequests: ILaboratoryRequest[] = Array.from(state.selectedTests.entries()).map(
      ([testName, meta]) => {
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
          status: existingStatus,
        };
      },
    );

    const payload = {
      appointmentId: String(params.appointmentId),
      labs: newLabRequests,
      recordId,
      instructions: data.instructions,
      history: data.history,
    };

    // Uses PUT endpoint now
    const result = await dispatch(addLabRequests(payload));

    setIsSubmitting(false);

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

  const buildLabsArray = (): Pick<ILaboratoryRequest, 'categoryType' | 'category' | 'testName'>[] =>
    Array.from(state.selectedTests.entries()).map(([testName, meta]) => ({
      testName,
      category: meta.category as LabTestSection,
      categoryType: meta.categoryType as CategoryType,
    }));

  const toggleTestSelection = (testName: string, category: string, categoryType: string): void => {
    setState((prev) => {
      const newSelectedTests = new Map(prev.selectedTests);
      if (newSelectedTests.has(testName)) {
        newSelectedTests.delete(testName);
      } else {
        newSelectedTests.set(testName, { category, categoryType });
      }
      return { selectedTests: newSelectedTests };
    });
    setValue('labs', buildLabsArray(), { shouldValidate: true });
    setHasUnsavedChanges(true);
  };

  const toggleSubCategorySelection = (
    subCategory: string,
    mainCategory: string,
    tests: string[],
    checked: boolean,
  ): void => {
    setState((prev) => {
      const newSelectedTests = new Map(prev.selectedTests);
      tests.forEach((test) => {
        if (checked) {
          newSelectedTests.set(test, { category: mainCategory, categoryType: subCategory });
        } else {
          newSelectedTests.delete(test);
        }
      });
      return { selectedTests: newSelectedTests };
    });
    setValue('labs', buildLabsArray(), { shouldValidate: true });
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    if (requestedAppointmentLabs) {
      const prevTests = new Map<string, { category: string; categoryType: string }>();
      requestedAppointmentLabs.forEach((lab) => {
        prevTests.set(lab.testName, { category: lab.category, categoryType: lab.categoryType });
      });
      setState({
        selectedTests: prevTests,
      });
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
          setState({
            selectedTests: new Map(),
          });
          setValue('labs', [], { shouldValidate: true });
          setHasUnsavedChanges(true);
        }}
        onSubmit={() => handleSubmit(handleSaveLabs)()}
        onPreviewPdf={fetchPdf}
        isSubmitting={isSubmitting}
        hasExistingData={requestedAppointmentLabs !== null && requestedAppointmentLabs.length > 0}
        pdfUrl={pdfUrl}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        hasUnsavedChanges={hasUnsavedChanges}
        getSelectedCount={() => state.selectedTests.size}
        getSelectedTestNames={() => Array.from(state.selectedTests.keys())}
        isLoading={isLoading}
        renderContent={() => (
          <form
            onSubmit={handleSubmit(handleSaveLabs)}
            className="max-h-125 space-y-6 overflow-y-auto"
          >
            <div className="mb-40 space-y-6">
              <div>
                <Label>Clinical History</Label>
                <Textarea
                  placeholder="Relevant clinical history..."
                  {...register('history')}
                  className={errors.history ? 'border-red-500' : ''}
                />
                {errors.history && <p className="text-sm text-red-500">{errors.history.message}</p>}
              </div>

              <div>
                <Label>Instructions</Label>
                <Textarea
                  placeholder="Special instructions for the laboratory tests..."
                  {...register('instructions')}
                />
              </div>

              <div className="space-y-4 overflow-auto rounded-lg border bg-white p-4">
                <div className="relative">
                  <Search
                    className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
                    size={20}
                  />
                  <Input
                    type="text"
                    placeholder="Search laboratory tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 pl-10"
                  />
                </div>
                {filteredLabs && Object.entries(filteredLabs).length > 0 ? (
                  Object.entries(filteredLabs).map(([mainCategory, subCategories]) => (
                    <LabCategorySection
                      key={mainCategory}
                      mainCategory={mainCategory}
                      subCategories={subCategories}
                      selectedTests={state.selectedTests}
                      onToggleTest={toggleTestSelection}
                      onToggleSubCategory={toggleSubCategorySelection}
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
            </div>
          </form>
        )}
      />
      {isLoadingPdf && <LoadingOverlay message="Generating PDF..." />}
    </>
  );
});

Labs.displayName = 'Labs';

export default Labs;
