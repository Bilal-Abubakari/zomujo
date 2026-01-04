import React, { JSX } from 'react';
import SpecimenInput from './SpecimenInput';
import LabSubCategorySection from './LabSubCategorySection';

type LabCategorySectionProps = {
  mainCategory: string;
  subCategories: Record<string, string[]>;
  selectedTests: Map<string, { category: string; categoryType: string }>;
  categorySpecimens: Map<string, string>;
  onSpecimenChange: (category: string, value: string) => void;
  onToggleTest: (test: string, category: string, categoryType: string) => void;
  extractSpecimenOptions: (testName: string) => string[] | null;
};

const LabCategorySection = ({
  mainCategory,
  subCategories,
  selectedTests,
  categorySpecimens,
  onSpecimenChange,
  onToggleTest,
  extractSpecimenOptions,
}: LabCategorySectionProps): JSX.Element => {
  const hasSelectedTestsInCategory = Array.from(selectedTests.values()).some(
    (meta) => meta.category === mainCategory,
  );
  const specimenValue = categorySpecimens.get(mainCategory) || '';
  const specimenMissing = hasSelectedTestsInCategory && !specimenValue.trim();

  return (
    <div className="border-b last:border-b-0">
      <div className="sticky top-0 z-10 bg-gray-50 px-4 py-3">
        <h3 className="text-lg font-bold text-gray-800">{mainCategory}</h3>
      </div>
      <div className="space-y-4 p-4">
        {hasSelectedTestsInCategory && (
          <SpecimenInput
            mainCategory={mainCategory}
            selectedTestsInCategory={Array.from(selectedTests.entries()).filter(
              ([, meta]) => meta.category === mainCategory,
            )}
            specimenValue={specimenValue}
            specimenMissing={specimenMissing}
            onSpecimenChange={(value) => onSpecimenChange(mainCategory, value)}
            extractSpecimenOptions={extractSpecimenOptions}
          />
        )}

        {Object.entries(subCategories).map(([subCategory, tests]) => (
          <LabSubCategorySection
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
};

export default LabCategorySection;
