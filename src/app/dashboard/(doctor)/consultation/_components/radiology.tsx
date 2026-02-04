'use client';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { IRadiology, RadiologyCategoryType, RadiologyTest } from '@/types/radiology.interface';
import { z } from 'zod';
import {
  InterventionalRadiologyCategory,
  PlainRadiologyCategory,
  RadiologySection,
  SpecializedImagingCategory,
  UltrasoundScansCategory,
} from '@/types/radiology.enum';
import { fetchRadiology } from '@/lib/features/appointments/consultation/fetchRadiology';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Toast, toast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { Modal } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { showErrorToast } from '@/lib/utils';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  getConsultationRadiology,
  downloadRadiologyRequestPdf,
  addRadiologyRequests,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';

const radiologySchema = z.object({
  tests: z
    .array(
      z.object({
        testName: z.string(),
        category: z.enum(RadiologySection),
        categoryType: z.union([
          z.enum(PlainRadiologyCategory),
          z.enum(UltrasoundScansCategory),
          z.enum(SpecializedImagingCategory),
          z.enum(InterventionalRadiologyCategory),
        ]),
      }),
    )
    .min(1),
  procedureRequest: z
    .string()
    .min(5, 'Examination/Procedure Request is required (minimum 5 characters)'),
  history: z.string().min(5, 'History/Relevant/Symptoms is required (minimum 5 characters)'),
  questions: z
    .array(requiredStringSchema())
    .max(3, 'Maximum 3 questions allowed')
    .min(1, 'At least one question'),
});

type TestItemProps = {
  test: string;
  mainCategory: string;
  subCategory: string;
  isChecked: boolean;
  onToggle: () => void;
};

const TestItem = ({
  test,
  mainCategory,
  subCategory,
  isChecked,
  onToggle,
}: TestItemProps): JSX.Element => (
  <div className="flex items-start space-x-2">
    <Checkbox
      id={`${mainCategory}-${subCategory}-${test}`}
      checked={isChecked}
      onCheckedChange={onToggle}
    />
    <Label
      htmlFor={`${mainCategory}-${subCategory}-${test}`}
      className="cursor-pointer text-sm leading-tight"
    >
      {test}
    </Label>
  </div>
);

type SubCategorySectionProps = {
  subCategory: string;
  tests: string[];
  mainCategory: string;
  selectedTests: { testName: string }[] | undefined;
  onToggleTest: (
    test: string,
    mainCategory: RadiologySection,
    subCategory: RadiologyCategoryType,
  ) => void;
};

const SubCategorySection = ({
  subCategory,
  tests,
  mainCategory,
  selectedTests,
  onToggleTest,
}: SubCategorySectionProps): JSX.Element => (
  <div className="space-y-2">
    <h4 className="text-sm font-semibold text-gray-700">{subCategory}</h4>
    <div className="grid grid-cols-1 gap-3 pl-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {tests.map((test: string) => (
        <TestItem
          key={test}
          test={test}
          mainCategory={mainCategory}
          subCategory={subCategory}
          isChecked={!!selectedTests?.find(({ testName }) => testName === test)}
          onToggle={() =>
            onToggleTest(
              test,
              mainCategory as RadiologySection,
              subCategory as RadiologyCategoryType,
            )
          }
        />
      ))}
    </div>
  </div>
);

type MainCategorySectionProps = {
  mainCategory: string;
  subCategories: Record<string, string[]>;
  selectedTests: { testName: string }[] | undefined;
  onToggleTest: (
    test: string,
    mainCategory: RadiologySection,
    subCategory: RadiologyCategoryType,
  ) => void;
};

const MainCategorySection = ({
  mainCategory,
  subCategories,
  selectedTests,
  onToggleTest,
}: MainCategorySectionProps): JSX.Element => (
  <div className="border-b last:border-b-0">
    <div className="sticky top-0 z-10 bg-gray-50 px-4 py-3">
      <h3 className="text-lg font-bold text-gray-800">{mainCategory}</h3>
    </div>
    <div className="space-y-4 p-4">
      {Object.entries(subCategories).map(([subCategory, tests]) => (
        <SubCategorySection
          key={subCategory}
          subCategory={subCategory}
          tests={tests}
          mainCategory={mainCategory}
          selectedTests={selectedTests}
          onToggleTest={onToggleTest}
        />
      ))}
    </div>
  </div>
);

export interface RadiologyRef {
  hasUnsavedChanges: boolean;
}

const Radiology = React.forwardRef<RadiologyRef>((_, ref): JSX.Element => {
  const dispatch = useAppDispatch();
  const recordId = useAppSelector(selectRecordId);
  const [radiologyTests, setRadiologyTests] = useState<RadiologyTest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [consultationRadiology, setConsultationRadiology] = useState<IRadiology[]>([]);
  const [isLoadingRadiology, setIsLoadingRadiology] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isAddingRadiology, setIsAddingRadiology] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const params = useParams();

  React.useImperativeHandle(ref, () => ({
    hasUnsavedChanges,
  }));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof radiologySchema>>({
    resolver: zodResolver(radiologySchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      tests: [],
      questions: [''],
    },
  });

  const selectedTests = watch('tests');

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
        setValue('procedureRequest', latest.procedureRequest || '');
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
    const result = await dispatch(
      downloadRadiologyRequestPdf(String(params.appointmentId)),
    ).unwrap();
    if (showErrorToast(result)) {
      toast(result as Toast);
      return;
    }
    const url = URL.createObjectURL(result as Blob);
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

    const result = await dispatch(addRadiologyRequests(payload)); // PUT
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

    // Open preview automatically
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

  const filteredRadiology = useMemo(() => {
    if (!radiologyTests) {
      return null;
    }
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return radiologyTests;
    }

    const filtered: Record<string, Record<string, string[]>> = {};
    Object.entries(radiologyTests).forEach(([mainCat, subCats]) => {
      const filteredSubs: Record<string, string[]> = {};
      Object.entries(subCats as Record<string, string[]>).forEach(([subCat, tests]) => {
        const ft = tests.filter(
          (x) =>
            x.toLowerCase().includes(query) ||
            mainCat.toLowerCase().includes(query) ||
            subCat.toLowerCase().includes(query),
        );
        if (ft.length) {
          filteredSubs[subCat] = ft;
        }
      });
      if (Object.keys(filteredSubs).length) {
        filtered[mainCat] = filteredSubs;
      }
    });
    return filtered as unknown as RadiologyTest;
  }, [radiologyTests, searchQuery]);

  useEffect(() => {
    if (!radiologyTests) {
      void getRadiologyData();
    }
  }, [radiologyTests]);

  useEffect(() => {
    void fetchConsultationRadiology();
  }, [params.appointmentId]);

  useEffect(() => {
    if (watch('questions').length === 0) {
      setValue('questions', ['']);
    }
  }, [watch('questions')]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (hasUnsavedChanges) {
        e.preventDefault();
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

      {isLoadingRadiology && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      )}

      <div className="relative h-full w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Radiology Request</h2>
            <p className="mt-1 text-sm text-gray-600">
              Select radiology tests and provide details. Changes are saved when you click
              &quot;Save and Preview&quot;.
            </p>
          </div>
          <div className="flex gap-2">
            {consultationRadiology && consultationRadiology.length > 0 && (
              <Button
                onClick={() => void fetchPdf()}
                child="Preview Request PDF"
                variant="outline"
                size="sm"
              />
            )}
            <Button
              onClick={handleSubmit(handleSaveRadiology)}
              disabled={isAddingRadiology || selectedTests.length === 0}
              isLoading={isAddingRadiology}
              child="Save and Preview"
              size="sm"
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit(handleSaveRadiology)}
          className="max-h-125 space-y-6 overflow-y-auto"
        >
          <div className="mb-40 space-y-6">
            <div>
              <Label>Examination/Procedure Request</Label>
              <Textarea
                placeholder="Describe the examination or procedure..."
                {...register('procedureRequest')}
                className={errors.procedureRequest ? 'border-red-500' : ''}
              />
              {errors.procedureRequest && (
                <p className="text-sm text-red-500">{errors.procedureRequest.message}</p>
              )}
            </div>
            <div>
              <Label>History/Clinical Information</Label>
              <Textarea
                placeholder="Relevant clinical history..."
                {...register('history')}
                className={errors.history ? 'border-red-500' : ''}
              />
              {errors.history && <p className="text-sm text-red-500">{errors.history.message}</p>}
            </div>
            <div>
              <Label>Clinical Questions</Label>
              <div className="space-y-2">
                {watch('questions').map(
                  (
                    _,
                    index, // Use watch to iterate over array length
                  ) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Question ${index + 1}`}
                        {...register(`questions.${index}`)}
                      />
                      {watch('questions').length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentQ = watch('questions');
                            setValue(
                              'questions',
                              currentQ.filter((_, i) => i !== index),
                            );
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ),
                )}
                {watch('questions').length < 3 && (
                  <button
                    type="button"
                    onClick={() => setValue('questions', [...watch('questions'), ''])}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Add Question
                  </button>
                )}
              </div>
              {errors.questions && (
                <p className="text-sm text-red-500">{errors.questions?.message}</p>
              )}
            </div>

            {/* Selected Tests Summary */}
            {selectedTests && selectedTests.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900">
                    {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('tests', [], { shouldValidate: true, shouldDirty: true });
                      setHasUnsavedChanges(true);
                    }}
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    Clear all selections
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTests.map((test) => (
                    <Badge key={test.testName} variant="secondary" className="px-3 py-1">
                      {test.testName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 overflow-auto rounded-lg border bg-white p-4">
              {/* Search Bar */}
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

              <div className="relative overflow-y-auto">
                {filteredRadiology &&
                  Object.entries(filteredRadiology).map(([mainCat, subCats]) => (
                    <MainCategorySection
                      key={mainCat}
                      mainCategory={mainCat}
                      subCategories={subCats as Record<string, string[]>}
                      selectedTests={selectedTests}
                      onToggleTest={toggleTest}
                    />
                  ))}
                {errors.tests && <p className="text-sm text-red-500">{errors.tests.message}</p>}
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
});

Radiology.displayName = 'Radiology';

export default Radiology;
