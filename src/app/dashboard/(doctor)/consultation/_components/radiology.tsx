'use client';
import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Info, Microscope, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import {
  IRadiology,
  IRadiologyRequest,
  RadiologyCategoryType,
  RadiologyTest,
} from '@/types/radiology.interface';
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
import AddCardButton from '@/components/ui/addCardButton';
import { Toast, toast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { Modal } from '@/components/ui/dialog';
import { LocalStorageManager } from '@/lib/localStorage';
import { Textarea } from '@/components/ui/textarea';
import { generateUUID, showErrorToast } from '@/lib/utils';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectCurrentRadiologyRequest } from '@/lib/features/appointments/consultation/consultationSelector';
import { setCurrentRadiologyRequest } from '@/lib/features/appointments/consultation/consultationSlice';
import { getConsultationRadiology } from '@/lib/features/appointments/consultation/consultationThunk';
import { RadiologyCard } from '@/app/dashboard/(doctor)/consultation/_components/labCard';
import { RequestStatus } from '@/types/shared.enum';

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

type RadiologyProps = {
  updateRadiology: boolean;
  setUpdateRadiology: (value: boolean) => void;
};

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

const Radiology = ({ updateRadiology, setUpdateRadiology }: RadiologyProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const currentRequestedRadiology = useAppSelector(selectCurrentRadiologyRequest);
  const [radiologyTests, setRadiologyTests] = useState<RadiologyTest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [questionsTracker, setQuestionsTracker] = useState<string[]>([generateUUID()]);
  const [consultationRadiology, setConsultationRadiology] = useState<IRadiology[]>([]);
  const [isLoadingRadiology, setIsLoadingRadiology] = useState(false);

  const {
    reset,
    register,
    control,
    trigger,
    watch,
    setValue,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<IRadiologyRequest>({
    resolver: zodResolver(radiologySchema),
    mode: MODE.ON_TOUCH,
  });

  const { append, remove } = useFieldArray({
    control,
    name: `tests`,
  });
  const params = useParams();
  const storageKey = `consultation_${params?.appointmentId}_radiology_draft`;
  const testsWatch = watch('tests');

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
      setIsLoadingRadiology(false);
      return;
    }
    setConsultationRadiology(payload as IRadiology[]);
    setIsLoadingRadiology(false);
  };

  const saveRadiologyRequest = async (data: IRadiologyRequest): Promise<void> => {
    dispatch(setCurrentRadiologyRequest(data));
    setUpdateRadiology(false);
    reset();
    setSearchQuery('');
    toast({
      title: 'Radiology request added',
      description: `${data.tests.length} test(s) added successfully`,
    });
  };

  const addRadiologyQuestionTree = async (): Promise<void> => {
    const isCurrentQuestionFieldValid = await trigger('questions');
    if (!isCurrentQuestionFieldValid) {
      toast({
        title: 'Invalid question',
        description: 'Please enter a valid question before adding another one.',
        variant: 'default',
      });
    }
    if (questionsTracker.length < 3 && isCurrentQuestionFieldValid) {
      setQuestionsTracker((prev) => [...prev, generateUUID()]);
    }
  };

  const removeRadiologyQuestionTree = (index: number, tracker: string): void => {
    if (questionsTracker.length > 1) {
      setQuestionsTracker((prev) => prev.filter((item) => item !== tracker));
      const questions = watch('questions');
      questions.splice(index, 1);
      setValue('questions', questions, { shouldValidate: true });
      return;
    }
    toast({
      title: 'You must have at least one question',
      description: 'Please add another question before removing this one.',
      variant: 'default',
    });
  };

  const testExists = useCallback(
    (test: string) => testsWatch.some(({ testName }) => testName === test),
    [testsWatch],
  );

  const toggleTestSelection = (
    testName: string,
    category: RadiologySection,
    categoryType: RadiologyCategoryType,
  ): void => {
    if (testExists(testName)) {
      const index = testsWatch.findIndex(({ testName: name }) => name === testName);
      remove(index);
      return;
    }
    append({
      testName,
      category,
      categoryType,
    });
  };

  const filterTestsByQuery = useCallback(
    (tests: string[], query: string, subCategory: string, mainCategory: string): string[] =>
      tests.filter(
        (test: string) =>
          test.toLowerCase().includes(query) ||
          subCategory.toLowerCase().includes(query) ||
          mainCategory.toLowerCase().includes(query),
      ),
    [],
  );

  const filterSubCategories = useCallback(
    (subCategories: Record<string, string[]>, query: string, mainCategory: string) => {
      const filteredSubCategories: Record<string, string[]> = {};

      Object.entries(subCategories).forEach(([subCategory, tests]) => {
        const filteredTests = filterTestsByQuery(tests, query, subCategory, mainCategory);
        if (filteredTests.length > 0) {
          filteredSubCategories[subCategory] = filteredTests;
        }
      });

      return filteredSubCategories;
    },
    [filterTestsByQuery],
  );

  const filteredRadiologyTests = useMemo(() => {
    if (!radiologyTests) {
      return null;
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return radiologyTests;
    }

    const filtered: Partial<RadiologyTest> = {};

    Object.entries(radiologyTests).forEach(([mainCategory, subCategories]) => {
      const filteredSubCategories = filterSubCategories(
        subCategories as Record<string, string[]>,
        query,
        mainCategory,
      );

      if (Object.keys(filteredSubCategories).length > 0) {
        filtered[mainCategory as RadiologySection] = filteredSubCategories as Record<
          RadiologyCategoryType,
          string[]
        >;
      }
    });

    return filtered as RadiologyTest;
  }, [radiologyTests, searchQuery, filterSubCategories]);

  // Persist draft
  useEffect(() => {
    const draft = {
      currentRequestedRadiology,
      // selectedTests: Array.from(selectedTests.entries()),
    };
    LocalStorageManager.setJSON(storageKey, draft);
  }, [currentRequestedRadiology, storageKey]);

  useEffect(() => {
    if (updateRadiology && !radiologyTests) {
      void getRadiologyData();
    }
  }, [updateRadiology, radiologyTests]);

  useEffect(() => {
    void fetchConsultationRadiology();
  }, []);

  const renderRadiologyContent = (): JSX.Element => {
    if (isLoadingRadiology) {
      return (
        <div className="mt-5 flex items-center justify-center py-10">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <span className="ml-3 text-gray-500">Loading radiology...</span>
        </div>
      );
    }

    if (consultationRadiology?.length) {
      return (
        <div className="mt-5 flex flex-wrap gap-5">
          {consultationRadiology.map(
            ({ id, tests, createdAt, procedureRequest, history, questions }) =>
              tests.map((test, index) => {
                const additionalInfo = [
                  procedureRequest && `Procedure: ${procedureRequest}`,
                  history && `History: ${history}`,
                  questions && questions.length > 0 && `Questions: ${questions.join(', ')}`,
                ]
                  .filter(Boolean)
                  .join('\n');

                return (
                  <RadiologyCard
                    key={`${id}-${index}`}
                    testName={test.testName}
                    fileUrl={test.fileUrl ?? null}
                    status={test.fileUrl ? RequestStatus.Completed : RequestStatus.Pending}
                    date={createdAt}
                    additionalInfo={additionalInfo}
                  />
                );
              }),
          )}
        </div>
      );
    }

    return <div className="mt-5 text-gray-500">No radiology tests conducted yet</div>;
  };

  return (
    <>
      <div>
        <h1 className="text-xl font-bold">Radiology Investigations</h1>
        <p className="mt-1 text-sm text-gray-600">
          Request imaging and radiology studies for the patient
        </p>

        <h2 className="mt-10 flex items-center font-bold max-sm:text-sm">
          Requested Radiology <Info className="ml-2" size={20} />
        </h2>
        {renderRadiologyContent()}

        <h2 className="mt-10 flex items-center font-bold max-sm:text-sm">
          Request Radiology <Info className="ml-2" size={20} />
        </h2>
        <div className="mt-5 mb-20 flex flex-wrap gap-5">
          <AddCardButton onClick={() => setUpdateRadiology(true)} />
          {currentRequestedRadiology && (
            <div className="relative w-56 rounded-[8px] bg-[linear-gradient(180deg,rgba(197,216,255,0.306)_0%,rgba(197,216,255,0.6)_61.43%)] p-4">
              <div className="mb-3 flex justify-between">
                <span className="text-grayscale-600 flex items-center gap-2">
                  <Microscope size={16} /> Radiology Request
                </span>
                <button
                  onClick={() => dispatch(setCurrentRadiologyRequest(null))}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-semibold">Tests:</p>
                <ul className="list-inside list-disc">
                  {currentRequestedRadiology.tests.map((test, index) => (
                    <li key={`${index}-${test.testName}`}>{test.testName}</li>
                  ))}
                </ul>
              </div>
              <div
                className="mt-2 cursor-pointer text-xs text-gray-500"
                title={`Procedure: ${currentRequestedRadiology.procedureRequest}\nHistory: ${currentRequestedRadiology.history}\nQuestions: ${currentRequestedRadiology.questions.join(', ')}`}
              >
                Hover for details
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        setState={(value) =>
          setUpdateRadiology(typeof value === 'function' ? value(updateRadiology) : value)
        }
        open={updateRadiology}
        showClose={true}
        className="h-full w-full max-w-[90%] p-5"
        content={
          <div className="w-full overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Add Radiology Request</h2>
              <p className="mt-1 text-gray-600">
                Select radiology investigations for the patient. Provide clinical indication and
                other relevant details.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(saveRadiologyRequest)}>
              <div>
                <Textarea
                  labelName={`Examination / Procedure Request`}
                  placeholder="Enter the examination or procedure being requested"
                  className="min-h-12.5 bg-white"
                  {...register('procedureRequest')}
                  error={errors?.procedureRequest?.message}
                />
              </div>
              <div>
                <Textarea
                  labelName={`History/Relevant/Symptoms`}
                  placeholder="Enter the examination or procedure being requested"
                  className="min-h-12.5 bg-white"
                  {...register('history')}
                  error={errors?.history?.message}
                />
              </div>
              <div className="flex items-center space-x-3">
                <span>Questions to be answered by this examination</span>
                {questionsTracker.length < 3 && (
                  <Button
                    type="button"
                    onClick={() => void addRadiologyQuestionTree()}
                    variant="link"
                    child="Add Question"
                  />
                )}
              </div>
              {questionsTracker.map((tracker, index) => (
                <div className="flex items-center space-x-2" key={tracker}>
                  <span>{index + 1}.</span>
                  <Input {...register(`questions.${index}`)} className="w-full max-w-full" />
                  <Trash2
                    onClick={() => removeRadiologyQuestionTree(index, tracker)}
                    className="cursor-pointer text-red-400"
                  />
                </div>
              ))}
              {/* Search Bar */}
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Search for radiology tests, imaging modalities..."
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
              {testsWatch?.length > 0 && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-900">
                      {testsWatch.length} test{testsWatch.length === 1 ? '' : 's'} selected
                    </span>
                    <button
                      type="button"
                      onClick={() => setValue('tests', [], { shouldValidate: true })}
                      className="text-sm text-purple-600 underline hover:text-purple-800"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {testsWatch.map(({ testName }) => (
                      <Badge key={testName} variant="secondary" className="px-3 py-1">
                        {testName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Radiology Tests Grid */}
              <div className="max-h-[50vh] overflow-y-auto rounded-lg border">
                {filteredRadiologyTests && Object.entries(filteredRadiologyTests).length > 0 ? (
                  Object.entries(filteredRadiologyTests).map(([mainCategory, subCategories]) => (
                    <MainCategorySection
                      key={mainCategory}
                      mainCategory={mainCategory}
                      subCategories={subCategories as Record<string, string[]>}
                      selectedTests={testsWatch}
                      onToggleTest={toggleTestSelection}
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
                      <p>Loading radiology tests...</p>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky Action Buttons */}
              <div className="sticky -bottom-6 z-20 flex justify-end space-x-3 border-t bg-white/95 p-4 backdrop-blur">
                <Button
                  onClick={() => {
                    reset();
                    setUpdateRadiology(false);
                    setSearchQuery('');
                  }}
                  child="Cancel"
                  type="button"
                  variant="secondary"
                />
                <Button
                  disabled={!isValid}
                  child={
                    testsWatch?.length > 0
                      ? `Add ${testsWatch.length} Test${testsWatch.length === 1 ? '' : 's'}`
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

export default Radiology;
