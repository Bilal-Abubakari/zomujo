import React, { JSX } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import LabTestItem from './LabTestItem';
import { LabTestSection } from '@/types/labs.enum';
import { CategoryType } from '@/types/labs.interface';

type LabSubCategorySectionProps = {
  subCategory: CategoryType;
  tests: string[];
  mainCategory: LabTestSection;
  onToggleTest: (test: string, category: LabTestSection, categoryType: CategoryType) => void;
  onToggleSubCategory: (
    subCategory: CategoryType,
    mainCategory: LabTestSection,
    tests: string[],
    checked: boolean,
  ) => void;
  isTestSelected: (test: string, categoryType: CategoryType) => boolean;
};

const LabSubCategorySection = ({
  subCategory,
  tests,
  mainCategory,
  onToggleTest,
  onToggleSubCategory,
  isTestSelected,
}: LabSubCategorySectionProps): JSX.Element => {
  const createTestToggleHandler = (test: string) => (): void => {
    onToggleTest(test, mainCategory, subCategory);
  };

  const isSubCategoryChecked = tests.every((test) => isTestSelected(test, subCategory));

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
            subCategory={subCategory}
            isChecked={isTestSelected(test, subCategory)}
            onToggle={createTestToggleHandler(test)}
          />
        ))}
      </div>
    </div>
  );
};

export default LabSubCategorySection;
