import { useMemo } from 'react';

/**
 * Filters an array of tests based on the query, also checking subCategory and mainCategory
 * @param tests - Array of test names
 * @param query - Lowercase search query
 * @param subCategory - Subcategory name
 * @param mainCategory - Main category name
 * @returns Filtered array of tests
 */
function filterTests(
  tests: string[],
  query: string,
  subCategory: string,
  mainCategory: string,
): string[] {
  return tests.filter(
    (test: string) =>
      test.toLowerCase().includes(query) ||
      subCategory.toLowerCase().includes(query) ||
      mainCategory.toLowerCase().includes(query),
  );
}

/**
 * Filters subcategories based on the query
 * @param subCategories - Record of subcategory to tests array
 * @param query - Lowercase search query
 * @param mainCategory - Main category name
 * @returns Filtered subcategories
 */
function filterSubCategories(
  subCategories: Record<string, unknown>,
  query: string,
  mainCategory: string,
): Record<string, string[]> {
  return Object.entries(subCategories).reduce(
    (subAcc, [subCategory, tests]) => {
      const testsArray = tests as string[];
      const filteredTests = filterTests(testsArray, query, subCategory, mainCategory);
      if (filteredTests.length > 0) {
        subAcc[subCategory] = filteredTests;
      }
      return subAcc;
    },
    {} as Record<string, string[]>,
  );
}

/**
 * Generic hook for filtering investigation data (labs or radiology)
 * @param data - The full dataset (labs or radiology tests)
 * @param searchQuery - The search query string
 * @returns Filtered data based on search query
 */
export function useInvestigationFilter<T>(data: T | null, searchQuery: string): T | null {
  return useMemo(() => {
    if (!data) {
      return null;
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return data;
    }

    const filtered = Object.entries(data as Record<string, unknown>).reduce(
      (acc, [mainCategory, subCategories]) => {
        const filteredSubCategories = filterSubCategories(
          subCategories as Record<string, unknown>,
          query,
          mainCategory,
        );
        if (Object.keys(filteredSubCategories).length > 0) {
          acc[mainCategory] = filteredSubCategories;
        }
        return acc;
      },
      {} as Record<string, Record<string, string[]>>,
    );

    return filtered as T;
  }, [data, searchQuery]);
}

/**
 * Generic hook for managing PDF preview state
 * @returns Object with PDF state and handlers
 */
export function usePdfPreview(): {
  cleanup: (pdfUrl: string | null) => void;
  createUrl: (blob: Blob) => string;
} {
  return {
    cleanup: (pdfUrl: string | null): void => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    },
    createUrl: (blob: Blob): string => URL.createObjectURL(blob),
  };
}
