import React, { JSX, useMemo } from 'react';
import { Input } from '@/components/ui/input';

type SpecimenInputProps = {
  mainCategory: string;
  selectedTestsInCategory: Array<[string, { category: string; categoryType: string }]>;
  specimenValue: string;
  specimenMissing: boolean;
  onSpecimenChange: (value: string) => void;
  extractSpecimenOptions: (testName: string) => string[] | null;
};

const SpecimenInput = ({
  mainCategory,
  selectedTestsInCategory,
  specimenValue,
  specimenMissing,
  onSpecimenChange,
  extractSpecimenOptions,
}: SpecimenInputProps): JSX.Element => {
  const { hasMultipleOptions, hasSingleOption, optionsList } = useMemo(() => {
    const hasMultipleOptions = selectedTestsInCategory.some(([testName]) => {
      const options = extractSpecimenOptions(testName);
      return (options?.length ?? 0) > 1;
    });

    const hasSingleOption = selectedTestsInCategory.some(([testName]) => {
      const options = extractSpecimenOptions(testName);
      return options?.length === 1;
    });

    const allOptions = new Set<string>();
    selectedTestsInCategory.forEach(([testName]) => {
      const options = extractSpecimenOptions(testName);
      if ((options?.length ?? 0) > 1) {
        options?.forEach((opt) => allOptions.add(opt));
      }
    });

    const optionsList = Array.from(allOptions).join(', ');

    return { hasMultipleOptions, hasSingleOption, optionsList };
  }, [selectedTestsInCategory, extractSpecimenOptions]);

  const getHelpText = (): string => {
    if (specimenMissing) {
      return 'Specimen is required for selected tests in this category.';
    }
    if (hasMultipleOptions) {
      return `Please specify specimen type. Options: ${optionsList}`;
    }
    if (hasSingleOption) {
      return 'Specimen auto-filled from test name';
    }
    return `Provide specimen for all ${mainCategory} tests`;
  };

  return (
    <div
      className={`mb-4 rounded-md border ${
        specimenMissing ? 'border-red-300 bg-red-50' : 'border-amber-200 bg-amber-50'
      } p-3`}
    >
      <Input
        labelName={`Specimen for ${mainCategory} (required)`}
        placeholder={
          hasMultipleOptions
            ? `Enter specimen (e.g., ${optionsList})`
            : 'Enter specimen (e.g., Blood, Urine)'
        }
        value={specimenValue}
        onChange={(e) => onSpecimenChange(e.target.value)}
        className="bg-white"
      />
      <p className={`mt-1 text-xs ${specimenMissing ? 'text-red-600' : 'text-amber-700'}`}>
        {getHelpText()}
      </p>
    </div>
  );
};

export default SpecimenInput;
