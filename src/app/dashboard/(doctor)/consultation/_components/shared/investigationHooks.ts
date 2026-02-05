import { useMemo } from 'react';

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

    const filtered: Record<string, Record<string, string[]>> = {};

    Object.entries(data as Record<string, unknown>).forEach(([mainCategory, subCategories]) => {
      const filteredSubCategories: Record<string, string[]> = {};

      Object.entries(subCategories as Record<string, unknown>).forEach(([subCategory, tests]) => {
        const testsArray = tests as string[];
        const filteredTests = testsArray.filter(
          (test: string) =>
            test.toLowerCase().includes(query) ||
            subCategory.toLowerCase().includes(query) ||
            mainCategory.toLowerCase().includes(query),
        );

        if (filteredTests.length > 0) {
          filteredSubCategories[subCategory] = filteredTests;
        }
      });

      if (Object.keys(filteredSubCategories).length > 0) {
        filtered[mainCategory] = filteredSubCategories;
      }
    });

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
