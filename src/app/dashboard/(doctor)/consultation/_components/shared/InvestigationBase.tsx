'use client';
import React, { JSX, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/dialog';

export interface InvestigationBaseRef {
  hasUnsavedChanges: boolean;
}

interface InvestigationBaseProps {
  title: string;
  description: string;
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

function InvestigationBase(
  props: InvestigationBaseProps,
  ref: React.Ref<InvestigationBaseRef>,
): JSX.Element {
  const {
    title,
    description,
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
              <iframe
                title="Investigation pdf"
                id="investigation-pdf"
                src={pdfUrl}
                className="mt-5 h-full w-full"
              />
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
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-1 text-xs text-gray-600">{description}</p>
          </div>
          <div className="flex gap-2">
            {hasExistingData && (
              <Button
                onClick={() => void onPreviewPdf()}
                child={previewButtonText}
                variant="outline"
                size="sm"
                className="text-xs"
              />
            )}
            <Button
              onClick={() => void onSubmit()}
              disabled={isSubmitting || selectedCount === 0}
              isLoading={isSubmitting}
              child={submitButtonText}
              className="text-xs"
              size="sm"
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Selected Tests Summary */}
          {selectedCount > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-900">
                  {selectedCount} test{selectedCount === 1 ? '' : 's'} selected
                </span>
                <button
                  type="button"
                  onClick={onClearSelections}
                  className="cursor-pointer text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Clear all selections
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTestNames.map((testName) => (
                  <Badge key={testName} variant="secondary" className="px-3 py-1 text-xs">
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

export default React.forwardRef(InvestigationBase) as (
  props: InvestigationBaseProps & { ref?: React.Ref<InvestigationBaseRef> },
) => JSX.Element;
