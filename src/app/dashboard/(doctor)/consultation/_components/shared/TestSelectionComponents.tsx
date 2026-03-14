import React, { JSX } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export type TestItemProps = {
  test: string;
  mainCategory: string;
  subCategory: string;
  isChecked: boolean;
  onToggle: () => void;
};

export const TestItem = ({
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

export type SubCategorySectionProps<TTest> = {
  subCategory: string;
  tests: string[];
  mainCategory: string;
  selectedTests: TTest[] | Map<string, { category: string; categoryType: string }>;
  onToggleTest: (test: string, mainCategory: string, subCategory: string) => void;
  isTestSelected: (testName: string, selectedTests: TTest[] | Map<string, unknown>) => boolean;
  onToggleSubCategory?: (
    subCategory: string,
    mainCategory: string,
    tests: string[],
    checked: boolean,
  ) => void;
};

export function SubCategorySection<TTest>({
  subCategory,
  tests,
  mainCategory,
  selectedTests,
  onToggleTest,
  isTestSelected,
  onToggleSubCategory,
}: Readonly<SubCategorySectionProps<TTest>>): JSX.Element {
  const isSubCategoryChecked = onToggleSubCategory
    ? tests.every((test) => isTestSelected(test, selectedTests))
    : false;

  return (
    <div className="space-y-2">
      {onToggleSubCategory ? (
        <div className="flex items-center space-x-2">
          <Label className="cursor-pointer text-sm font-semibold text-gray-700">
            {subCategory}
          </Label>
          <Checkbox
            checked={isSubCategoryChecked}
            onCheckedChange={(checked) =>
              onToggleSubCategory(subCategory, mainCategory, tests, checked as boolean)
            }
          />
        </div>
      ) : (
        <h4 className="text-sm font-semibold text-gray-700">{subCategory}</h4>
      )}
      <div className="grid grid-cols-1 gap-3 pl-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tests.map((test: string) => (
          <TestItem
            key={test}
            test={test}
            mainCategory={mainCategory}
            subCategory={subCategory}
            isChecked={isTestSelected(test, selectedTests)}
            onToggle={() => onToggleTest(test, mainCategory, subCategory)}
          />
        ))}
      </div>
    </div>
  );
}

export type MainCategorySectionProps<TTest> = {
  mainCategory: string;
  subCategories: Record<string, string[]>;
  selectedTests: TTest[] | Map<string, { category: string; categoryType: string }>;
  onToggleTest: (test: string, mainCategory: string, subCategory: string) => void;
  isTestSelected: (testName: string, selectedTests: TTest[] | Map<string, unknown>) => boolean;
  onToggleSubCategory?: (
    subCategory: string,
    mainCategory: string,
    tests: string[],
    checked: boolean,
  ) => void;
  additionalContent?: JSX.Element | null;
};

export function MainCategorySection<TTest>({
  mainCategory,
  subCategories,
  selectedTests,
  onToggleTest,
  isTestSelected,
  onToggleSubCategory,
  additionalContent,
}: Readonly<MainCategorySectionProps<TTest>>): JSX.Element {
  return (
    <div className="border-b last:border-b-0">
      <div className="sticky top-0 z-10 bg-gray-50 px-4 py-3">
        <h3 className="text-lg font-bold text-gray-800">{mainCategory}</h3>
      </div>
      <div className="space-y-4 p-4">
        {additionalContent}
        {Object.entries(subCategories).map(([subCategory, tests]) => (
          <SubCategorySection
            key={subCategory}
            subCategory={subCategory}
            tests={tests}
            mainCategory={mainCategory}
            selectedTests={selectedTests}
            onToggleTest={onToggleTest}
            isTestSelected={isTestSelected}
            onToggleSubCategory={onToggleSubCategory}
          />
        ))}
      </div>
    </div>
  );
}
