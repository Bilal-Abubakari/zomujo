import React, { JSX, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import {
  FlaskConical,
  TestTubeDiagonal,
  Microscope,
  FileText,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  ClipboardCheck,
  PenLine,
} from 'lucide-react';
import { IPostInvestigationData } from '@/types/appointment.interface';

interface InvestigationResultsCardProps {
  labFileUrls?: string[];
  radiologyFileUrls?: string[];
  postInvestigationData?: IPostInvestigationData | null;
}

type PreviewFile = {
  url: string;
  label: string;
};

export const InvestigationResultsCard = ({
  labFileUrls = [],
  radiologyFileUrls = [],
  postInvestigationData,
}: InvestigationResultsCardProps): JSX.Element => {
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const totalFiles = labFileUrls.length + radiologyFileUrls.length;
  const hasFiles = totalFiles > 0;
  const hasPostData = !!postInvestigationData;

  if (!hasFiles && !hasPostData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FlaskConical className="text-primary h-5 w-5" />
            Investigation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <AlertCircle className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No investigation results available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

      <div className="space-y-4">
        {/* Lab File Results */}
        {labFileUrls.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TestTubeDiagonal className="text-primary h-4 w-4" />
                Laboratory Results
                <Badge variant="secondary" className="ml-auto text-xs">
                  {labFileUrls.length} file{labFileUrls.length === 1 ? '' : 's'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {labFileUrls.map((url, index) => (
                <div
                  key={`lab-${index}-${url}`}
                  className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-800">
                      Lab Result {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
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
            </CardContent>
          </Card>
        )}

        {/* Radiology File Results */}
        {radiologyFileUrls.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Microscope className="text-primary h-4 w-4" />
                Radiology Results
                <Badge variant="secondary" className="ml-auto text-xs">
                  {radiologyFileUrls.length} file{radiologyFileUrls.length === 1 ? '' : 's'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {radiologyFileUrls.map((url, index) => (
                <div
                  key={`radiology-${index}-${url}`}
                  className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-800">
                      Radiology Result {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
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
            </CardContent>
          </Card>
        )}

        {/* Post-Investigation Notes */}
        {hasPostData && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="text-primary h-4 w-4" />
                Post-Investigation Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {postInvestigationData?.historyOfPresentingComplaints && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-600">
                      History of Presenting Complaints
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">
                    {postInvestigationData.historyOfPresentingComplaints}
                  </p>
                </div>
              )}
              {postInvestigationData?.assessmentImpression && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <ClipboardCheck className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-600">
                      Assessment / Impression
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">
                    {postInvestigationData.assessmentImpression}
                  </p>
                </div>
              )}
              {postInvestigationData?.addendum && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <PenLine className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-600">Addendum</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">
                    {postInvestigationData.addendum}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
