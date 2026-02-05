import React, { JSX } from 'react';
import LabTestItem from './LabTestItem';

type LabSubCategorySectionProps = {
  subCategory: string;
  tests: string[];
  mainCategory: string;
  selectedTests: Map<string, { category: string; categoryType: string }>;
  onToggleTest: (test: string, category: string, categoryType: string) => void;
};

const LabSubCategorySection = ({
  subCategory,
  tests,
  mainCategory,
  selectedTests,
  onToggleTest,
}: LabSubCategorySectionProps): JSX.Element => {
  const createTestToggleHandler = (test: string) => (): void => {
    onToggleTest(test, mainCategory, subCategory);
  };

  return (
    <div className="max-h-fit space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">{subCategory}</h4>
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
