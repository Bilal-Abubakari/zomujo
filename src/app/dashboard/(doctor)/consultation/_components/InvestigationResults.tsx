'use client';
import React, { JSX, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import {
  selectAppointmentLabs,
  selectAppointmentRadiology,
} from '@/lib/features/appointments/appointmentSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/dialog';
import {
  FlaskConical,
  Microscope,
  FileText,
  ExternalLink,
  ChevronRight,
  TestTube2,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

interface InvestigationResultsProps {
  goToNext: () => void;
}

type PreviewFile = {
  url: string;
  label: string;
};

const InvestigationResults = ({ goToNext }: InvestigationResultsProps): JSX.Element => {
  const { state, isMobile } = useSidebar();
  const lab = useAppSelector(selectAppointmentLabs);
  const radiology = useAppSelector(selectAppointmentRadiology);
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const labFileUrls = lab?.fileUrls ?? [];
  const radiologyFileUrls = radiology?.fileUrls ?? [];

  const totalFiles = labFileUrls.length + radiologyFileUrls.length;
  const hasResults = totalFiles > 0;

  return (
    <>
      <Modal
        open={!!previewFile}
        setState={(val) => {
          if (!val) {
            setPreviewFile(null);
          }
        }}
        showClose
        className="w-full max-w-5xl"
        content={
          <div className="mt-6 h-[85vh]">
            {previewFile && (
              <iframe
                src={previewFile.url}
                className="h-full w-full rounded-lg border"
                title={previewFile.label}
              />
            )}
          </div>
        }
      />

      <div className="space-y-6 pb-24">
        {/* Header Banner */}
        <div className="rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <FlaskConical className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-blue-900">Post-Investigation Results</h2>
              <p className="mt-0.5 text-sm text-blue-700">
                Review the investigation results uploaded by the patient before proceeding with the
                consultation.
              </p>
            </div>
          </div>
          {hasResults && (
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {totalFiles} result{totalFiles === 1 ? '' : 's'} uploaded
              </span>
            </div>
          )}
        </div>

        {!hasResults && (
          <Card className="border-dashed border-amber-300 bg-amber-50">
            <CardContent className="py-10 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
              <p className="text-base font-medium text-amber-800">No results uploaded yet</p>
              <p className="mt-1 text-sm text-amber-600">
                The patient has not uploaded any lab or radiology results yet. You may proceed to
                the history section.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lab Results */}
        <Card className={cn(!lab && 'opacity-60')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TestTube2 className="text-primary h-5 w-5" />
              Laboratory Results
              <Badge variant="secondary" className="ml-auto text-xs">
                {labFileUrls.length} file{labFileUrls.length === 1 ? '' : 's'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lab && (
              <div className="mb-3 space-y-1 text-sm text-gray-600">
                {lab.history && (
                  <p>
                    <span className="font-medium text-gray-700">Clinical History:</span>{' '}
                    {lab.history}
                  </p>
                )}
                {lab.instructions && (
                  <p>
                    <span className="font-medium text-gray-700">Instructions:</span>{' '}
                    {lab.instructions}
                  </p>
                )}
                {lab.data && lab.data.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium text-gray-700">Requested Tests:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {lab.data.map(({ testName, id }) => (
                        <Badge key={id} variant="outline" className="text-xs">
                          {testName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {labFileUrls.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">No lab results uploaded by patient</p>
              </div>
            ) : (
              <div className="space-y-2">
                {labFileUrls.map((url, index) => (
                  <div
                    key={`lab-${index}-${url}`}
                    className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 transition-colors hover:bg-green-100"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                      <span className="truncate text-sm font-medium text-gray-800">
                        Lab Result {index + 1}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewFile({ url, label: `Lab Result ${index + 1}` })}
                        child={
                          <span className="flex items-center gap-1 text-xs">
                            <FileText className="h-3.5 w-3.5" />
                            Preview
                          </span>
                        }
                      />
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        child={
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Radiology Results */}
        <Card className={cn(!radiology && 'opacity-60')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Microscope className="text-primary h-5 w-5" />
              Radiology Results
              <Badge variant="secondary" className="ml-auto text-xs">
                {radiologyFileUrls.length} file{radiologyFileUrls.length === 1 ? '' : 's'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radiology && (
              <div className="mb-3 space-y-1 text-sm text-gray-600">
                {radiology.procedureRequest && (
                  <p>
                    <span className="font-medium text-gray-700">Procedure Request:</span>{' '}
                    {radiology.procedureRequest}
                  </p>
                )}
                {radiology.history && (
                  <p>
                    <span className="font-medium text-gray-700">Clinical History:</span>{' '}
                    {radiology.history}
                  </p>
                )}
                {radiology.tests && radiology.tests.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium text-gray-700">Requested Tests:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {radiology.tests.map((test, i) => (
                        <Badge key={`${i}-${test.testName}`} variant="outline" className="text-xs">
                          {test.testName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {radiologyFileUrls.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center">
                <ImageIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">No radiology results uploaded by patient</p>
              </div>
            ) : (
              <div className="space-y-2">
                {radiologyFileUrls.map((url, index) => (
                  <div
                    key={`radiology-${index}-${url}`}
                    className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 transition-colors hover:bg-green-100"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                      <span className="truncate text-sm font-medium text-gray-800">
                        Radiology Result {index + 1}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setPreviewFile({ url, label: `Radiology Result ${index + 1}` })
                        }
                        child={
                          <span className="flex items-center gap-1 text-xs">
                            <FileText className="h-3.5 w-3.5" />
                            Preview
                          </span>
                        }
                      />
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        child={
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fixed Footer */}
      <div
        className={cn(
          'fixed bottom-0 z-50 flex justify-between border-t border-gray-300 bg-white p-4 shadow-md',
          !isMobile && state === 'expanded'
            ? 'left-(--sidebar-width) w-[calc(100%-var(--sidebar-width))]'
            : 'left-0 w-full',
        )}
      >
        <div />
        <Button
          onClick={goToNext}
          child={
            <span className="flex items-center gap-2">
              Continue to History
              <ChevronRight className="h-4 w-4" />
            </span>
          }
        />
      </div>
    </>
  );
};

export default InvestigationResults;
