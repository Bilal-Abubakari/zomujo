import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TestTubeDiagonal } from 'lucide-react';
import { IConsultationDetails } from '@/types/consultation.interface';
import { useFileUpload } from './useFileUpload';
import { useFileDelete } from './useFileDelete';
import { FileUploadSection } from './FileUploadSection';

interface LabRequestsSectionProps {
  consultationDetails: IConsultationDetails | undefined;
  onDownloadRequest: () => void;
  downloadingRequest: boolean;
}

export const LabRequestsSection: React.FC<LabRequestsSectionProps> = ({
  consultationDetails,
  onDownloadRequest,
  downloadingRequest,
}) => {
  const labData = consultationDetails?.lab?.data ?? [];
  const labFileUrls = consultationDetails?.lab?.fileUrls ?? [];

  const { uploadingFiles, handleFileChange, removeUploadingFile, retryUploadingFile } =
    useFileUpload('lab', consultationDetails?.lab?.id, (fileUrl) => {
      // Update consultation details
      if (consultationDetails?.lab) {
        consultationDetails.lab.fileUrls = [...labFileUrls, fileUrl];
      }
    });

  const { deletingFiles, handleDeleteFile } = useFileDelete(
    'lab',
    consultationDetails?.lab?.id,
    (fileUrl) => {
      // Update consultation details
      if (consultationDetails?.lab) {
        consultationDetails.lab.fileUrls = labFileUrls.filter((url) => url !== fileUrl);
      }
    },
  );

  if (labData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <TestTubeDiagonal className="text-primary" />
            Lab Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
            There are currently no lab requests from the doctor.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <TestTubeDiagonal className="text-primary" />
            Lab Requests
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadRequest}
            disabled={downloadingRequest}
            isLoading={downloadingRequest}
            child={
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Lab Request
              </>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUploadSection
          title="Upload Lab Results"
          description="Upload your lab results as PDF files or images (JPG, PNG, GIF, WEBP). You can upload multiple files."
          inputId="lab-files"
          uploadingFiles={uploadingFiles}
          uploadedFiles={labFileUrls}
          onFileChange={handleFileChange}
          onRemoveUploadingFile={removeUploadingFile}
          onRetryUploadingFile={retryUploadingFile}
          onDeleteUploadedFile={handleDeleteFile}
          deletingFiles={deletingFiles}
          fileLabel="Lab Result"
        />
      </CardContent>
    </Card>
  );
};
