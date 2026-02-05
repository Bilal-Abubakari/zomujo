'use client';
import React, { JSX, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { IRadiology, RadiologyCategoryType, RadiologyTest } from '@/types/radiology.interface';
import { z } from 'zod';
import { RadiologySection } from '@/types/radiology.enum';
import { fetchRadiology } from '@/lib/features/appointments/consultation/fetchRadiology';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Toast, toast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { showErrorToast } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  getConsultationRadiology,
  downloadRadiologyRequestPdf,
  addRadiologyRequests,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import InvestigationBase, {
  InvestigationBaseRef,
} from '@/app/dashboard/(doctor)/consultation/_components/shared/InvestigationBase';
import {
  useInvestigationFilter,
  usePdfPreview,
} from '@/app/dashboard/(doctor)/consultation/_components/shared/investigationHooks';
import { MainCategorySection } from '@/app/dashboard/(doctor)/consultation/_components/shared/TestSelectionComponents';
import { QuestionsSection } from '@/app/dashboard/(doctor)/consultation/_components/shared/QuestionsSection';
import { RadiologyForm, radiologySchema } from '@/schemas/radiology.schema';

export type RadiologyRef = InvestigationBaseRef;

const Radiology = React.forwardRef<RadiologyRef>((_, ref): JSX.Element => {
  const dispatch = useAppDispatch();
  const recordId = useAppSelector(selectRecordId);
  const [radiologyTests, setRadiologyTests] = useState<RadiologyTest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [consultationRadiology, setConsultationRadiology] = useState<IRadiology[]>([]);
  const [isLoadingRadiology, setIsLoadingRadiology] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isAddingRadiology, setIsAddingRadiology] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const params = useParams();

  const filteredRadiology = useInvestigationFilter(radiologyTests, searchQuery);
  const pdfPreview = usePdfPreview();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RadiologyForm>({
    resolver: zodResolver(radiologySchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      tests: [],
      questions: [''],
    },
  });

  const selectedTests = watch('tests');
  const questions = watch('questions');

  const getRadiologyData = async (): Promise<void> => {
    const response = await fetchRadiology();
    if (response) {
      setRadiologyTests(response);
    }
  };

  const fetchConsultationRadiology = async (): Promise<void> => {
    setIsLoadingRadiology(true);
    const { payload } = await dispatch(getConsultationRadiology(String(params.appointmentId)));

    if (showErrorToast(payload)) {
      toast(payload as Toast);
    } else {
      const rads = payload as IRadiology[];
      setConsultationRadiology(rads);
      if (rads.length > 0) {
        const latest = rads[0];
        setValue('tests', latest.tests || []);
        setValue('history', latest.history || '');
        setValue(
          'questions',
          latest.questions && latest.questions.length > 0 ? latest.questions : [''],
        );
      }
    }
    setIsLoadingRadiology(false);
  };

  const fetchPdf = async (): Promise<void> => {
    setIsLoadingPdf(true);
    const result = await dispatch(
      downloadRadiologyRequestPdf(String(params.appointmentId)),
    ).unwrap();
    setIsLoadingPdf(false);

    if (showErrorToast(result)) {
      toast(result as Toast);
      return;
    }

    // Clean up old PDF URL before creating new one
    pdfPreview.cleanup(pdfUrl);
    const url = pdfPreview.createUrl(result as Blob);
    setPdfUrl(url);
    setShowPreview(true);
  };

  const handleSaveRadiology = async (data: z.infer<typeof radiologySchema>): Promise<void> => {
    setIsAddingRadiology(true);
    const payload = {
      appointmentId: String(params.appointmentId),
      recordId,
      ...data,
    };

    const result = await dispatch(addRadiologyRequests(payload));
    if (showErrorToast(result.payload)) {
      toast(result.payload as Toast);
      setIsAddingRadiology(false);
      return;
    }

    void fetchConsultationRadiology();
    setIsAddingRadiology(false);
    setHasUnsavedChanges(false);
    toast({
      title: 'Success',
      description: 'Radiology request updated successfully',
      variant: 'default',
    });

    void fetchPdf();
  };

  const toggleTest = (
    testName: string,
    category: RadiologySection,
    categoryType: RadiologyCategoryType,
  ): void => {
    const currentTests = watch('tests') || [];
    const exists = currentTests.find((t) => t.testName === testName);

    if (exists) {
      setValue(
        'tests',
        currentTests.filter((t) => t.testName !== testName),
        { shouldValidate: true, shouldDirty: true },
      );
    } else {
      setValue('tests', [...currentTests, { testName, category, categoryType }], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    setHasUnsavedChanges(true);
  };

  const radiologyTestSection = (
    <div className="relative overflow-y-auto">
      {filteredRadiology &&
        Object.entries(filteredRadiology).map(([mainCat, subCats]) => (
          <MainCategorySection
            key={mainCat}
            mainCategory={mainCat}
            subCategories={subCats as Record<string, string[]>}
            selectedTests={selectedTests}
            onToggleTest={(testName, mainCategory, subCategory) =>
              toggleTest(
                testName,
                mainCategory as RadiologySection,
                subCategory as RadiologyCategoryType,
              )
            }
            isTestSelected={(testName, tests) =>
              Array.isArray(tests) ? tests.some((t) => t.testName === testName) : false
            }
          />
        ))}
      {errors.tests && <p className="text-sm text-red-500">{errors.tests.message}</p>}
    </div>
  );

  useEffect(() => {
    if (!radiologyTests) {
      void getRadiologyData();
    }
  }, [radiologyTests]);

  useEffect(() => {
    void fetchConsultationRadiology();
  }, [params.appointmentId]);

  useEffect(() => {
    if (questions.length === 0) {
      setValue('questions', ['']);
    }
  }, [questions]);

  return (
    <>
      <InvestigationBase
        ref={ref}
        title="Radiology Request"
        description="Select radiology tests and provide details. Changes are saved when you click Save and Preview."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSelections={() => {
          setValue('tests', [], { shouldValidate: true, shouldDirty: true });
          setHasUnsavedChanges(true);
        }}
        onSubmit={() => handleSubmit(handleSaveRadiology)()}
        onPreviewPdf={fetchPdf}
        isLoading={isLoadingRadiology}
        isSubmitting={isAddingRadiology}
        hasExistingData={consultationRadiology !== null && consultationRadiology.length > 0}
        pdfUrl={pdfUrl}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        hasUnsavedChanges={hasUnsavedChanges}
        getSelectedCount={() => selectedTests?.length || 0}
        getSelectedTestNames={() => selectedTests?.map((t) => t.testName) || []}
        renderContent={() => (
          <form
            onSubmit={handleSubmit(handleSaveRadiology)}
            className="max-h-125 space-y-6 overflow-y-auto"
          >
            <div className="mb-40 space-y-6">
              <div>
                <Label>History/Clinical Information</Label>
                <Textarea
                  placeholder="Relevant clinical history..."
                  {...register('history')}
                  className={errors.history ? 'border-red-500' : ''}
                />
                {errors.history && <p className="text-sm text-red-500">{errors.history.message}</p>}
              </div>

              <QuestionsSection
                questions={questions}
                register={register}
                setValue={setValue}
                errors={errors}
              />

              <div className="space-y-4 overflow-auto rounded-lg border bg-white p-4">
                <div className="relative">
                  <Search
                    className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
                    size={20}
                  />
                  <Input
                    type="text"
                    placeholder="Search radiology tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 pl-10"
                  />
                </div>
                {radiologyTestSection}
              </div>
            </div>
          </form>
        )}
      />
      {isLoadingPdf && <LoadingOverlay message="Generating PDF..." />}
    </>
  );
});

Radiology.displayName = 'Radiology';

export default Radiology;
