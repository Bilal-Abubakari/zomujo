'use client';
import React, { JSX, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/dialog';

export interface InvestigationBaseRef {
  hasUnsavedChanges: boolean;
}

interface InvestigationBaseProps<TData, TTest> {
  title: string;
  description: string;
  data: TData | null;
  selectedTests: TTest[] | Map<string, { category: string; categoryType: string }>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSelections: () => void;
  onSubmit: () => Promise<void>;
  onPreviewPdf: () => Promise<void>;
  isLoading?: boolean;
  isSubmitting?: boolean;
  hasExistingData: boolean;
  pdfUrl: string | null;
  showPreview: boolean;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  hasUnsavedChanges: boolean;
  renderContent: () => JSX.Element;
  getSelectedCount: () => number;
  getSelectedTestNames: () => string[];
  submitButtonText?: string;
  previewButtonText?: string;
}

function InvestigationBase<TData, TTest>(
  props: InvestigationBaseProps<TData, TTest>,
  ref: React.Ref<InvestigationBaseRef>,
): JSX.Element {
  const {
    title,
    description,
    searchQuery,
    onSearchChange,
    onClearSelections,
    onSubmit,
    onPreviewPdf,
    isLoading = false,
    isSubmitting = false,
    hasExistingData,
    pdfUrl,
    showPreview,
    setShowPreview,
    hasUnsavedChanges,
    renderContent,
    getSelectedCount,
    getSelectedTestNames,
    submitButtonText = 'Save and Preview',
    previewButtonText = 'Preview Request PDF',
  } = props;

  React.useImperativeHandle(ref, () => ({
    hasUnsavedChanges,
  }));

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return (): void => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(
    () => (): void => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    },
    [pdfUrl],
  );

  const selectedCount = getSelectedCount();
  const selectedTestNames = getSelectedTestNames();

  return (
    <>
      <Modal
        open={showPreview}
        className="h-full w-full max-w-7xl"
        setState={setShowPreview}
        showClose={true}
        content={
          <div className="h-full w-full">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="mt-5 h-full w-full" />
            ) : (
              <div className="flex h-full items-center justify-center">Loading PDF...</div>
            )}
          </div>
        }
      />

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      )}

      <div className="relative h-full w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <div className="flex gap-2">
            {hasExistingData && (
              <Button
                onClick={() => void onPreviewPdf()}
                child={previewButtonText}
                variant="outline"
                size="sm"
              />
            )}
            <Button
              onClick={() => void onSubmit()}
              disabled={isSubmitting || selectedCount === 0}
              isLoading={isSubmitting}
              child={submitButtonText}
              size="sm"
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search for tests, categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10 pl-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Selected Tests Summary */}
          {selectedCount > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900">
                  {selectedCount} test{selectedCount !== 1 ? 's' : ''} selected
                </span>
                <button
                  type="button"
                  onClick={onClearSelections}
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  Clear all selections
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTestNames.map((testName) => (
                  <Badge key={testName} variant="secondary" className="px-3 py-1">
                    {testName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          {renderContent()}
        </div>
      </div>
    </>
  );
}

export default React.forwardRef(InvestigationBase) as <TData, TTest>(
  props: InvestigationBaseProps<TData, TTest> & { ref?: React.Ref<InvestigationBaseRef> },
) => JSX.Element;
