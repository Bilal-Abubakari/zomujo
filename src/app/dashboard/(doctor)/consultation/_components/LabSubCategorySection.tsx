import React, { JSX } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import LabTestItem from './LabTestItem';

type LabSubCategorySectionProps = {
  subCategory: string;
  tests: string[];
  mainCategory: string;
  selectedTests: Map<string, { category: string; categoryType: string }>;
  onToggleTest: (test: string, category: string, categoryType: string) => void;
  onToggleSubCategory: (
    subCategory: string,
    mainCategory: string,
    tests: string[],
    checked: boolean,
  ) => void;
};

const LabSubCategorySection = ({
  subCategory,
  tests,
  mainCategory,
  selectedTests,
  onToggleTest,
  onToggleSubCategory,
}: LabSubCategorySectionProps): JSX.Element => {
  const createTestToggleHandler = (test: string) => (): void => {
    onToggleTest(test, mainCategory, subCategory);
  };

  const isSubCategoryChecked = tests.every((test) => selectedTests.has(test));

  return (
    <div className="max-h-fit space-y-2">
      <div className="flex items-center space-x-2">
        <Label className="cursor-pointer text-sm font-semibold text-gray-700">{subCategory}</Label>
        <Checkbox
          checked={isSubCategoryChecked}
          onCheckedChange={(checked) =>
            onToggleSubCategory(subCategory, mainCategory, tests, checked as boolean)
          }
        />
      </div>
      <div className="grid grid-cols-1 gap-3 pl-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tests.map((test: string) => (
          <LabTestItem
            key={test}
            test={test}
            mainCategory={mainCategory}
            subCategory={subCategory}
            isChecked={selectedTests.has(test)}
            onToggle={createTestToggleHandler(test)}
          />
        ))}
      </div>
    </div>
  );
};

export default LabSubCategorySection;
