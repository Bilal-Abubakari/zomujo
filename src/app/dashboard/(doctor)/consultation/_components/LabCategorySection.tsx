import React, { JSX } from 'react';
import LabSubCategorySection from './LabSubCategorySection';

type LabCategorySectionProps = {
  mainCategory: string;
  subCategories: Record<string, string[]>;
  selectedTests: Map<string, { category: string; categoryType: string }>;
  onToggleTest: (test: string, category: string, categoryType: string) => void;
  onToggleSubCategory: (
    subCategory: string,
    mainCategory: string,
    tests: string[],
    checked: boolean,
  ) => void;
};

const LabCategorySection = ({
  mainCategory,
  subCategories,
  selectedTests,
  onToggleTest,
  onToggleSubCategory,
}: LabCategorySectionProps): JSX.Element => (
  <div className="border-b last:border-b-0">
    <div className="sticky -top-5 z-10 bg-gray-50 px-4 py-3">
      <h3 className="text-lg font-bold text-gray-800">{mainCategory}</h3>
    </div>
    <div className="space-y-4 p-4">
      {Object.entries(subCategories).map(([subCategory, tests]) => (
        <LabSubCategorySection
          key={subCategory}
          subCategory={subCategory}
          tests={tests}
          mainCategory={mainCategory}
          selectedTests={selectedTests}
          onToggleTest={onToggleTest}
          onToggleSubCategory={onToggleSubCategory}
        />
      ))}
    </div>
  </div>
);

export default LabCategorySection;
