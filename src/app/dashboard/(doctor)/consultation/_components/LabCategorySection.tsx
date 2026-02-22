import React, { JSX } from 'react';
import LabSubCategorySection from './LabSubCategorySection';
import { LabTestSection } from '@/types/labs.enum';
import { CategoryType } from '@/types/labs.interface';

type LabCategorySectionProps = {
  mainCategory: LabTestSection;
  subCategories: Record<CategoryType, string[]>;
  onToggleTest: (test: string, category: LabTestSection, categoryType: CategoryType) => void;
  onToggleSubCategory: (
    subCategory: CategoryType,
    mainCategory: LabTestSection,
    tests: string[],
    checked: boolean,
  ) => void;
  isTestSelected: (test: string, categoryType: CategoryType) => boolean;
};

const LabCategorySection = ({
  mainCategory,
  subCategories,
  onToggleTest,
  onToggleSubCategory,
  isTestSelected,
}: LabCategorySectionProps): JSX.Element => (
  <div className="border-b last:border-b-0">
    <div className="sticky top-0 z-10 bg-gray-50 px-4 py-3">
      <h3 className="text-lg font-bold text-gray-800">{mainCategory}</h3>
    </div>
    <div className="space-y-4 p-4">
      {Object.entries(subCategories).map(([subCategory, tests]) => (
        <LabSubCategorySection
          key={subCategory}
          subCategory={subCategory as CategoryType}
          tests={tests}
          mainCategory={mainCategory}
          onToggleTest={onToggleTest}
          onToggleSubCategory={onToggleSubCategory}
          isTestSelected={isTestSelected}
        />
      ))}
    </div>
  </div>
);

export default LabCategorySection;
