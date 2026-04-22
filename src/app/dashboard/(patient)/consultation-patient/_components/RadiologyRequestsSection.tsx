import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TestTubeDiagonal } from 'lucide-react';
import { IConsultationDetails } from '@/types/consultation.interface';
import { useFileUpload } from './useFileUpload';
import { useFileDelete } from './useFileDelete';
import { FileUploadSection } from './FileUploadSection';

interface RadiologyRequestsSectionProps {
  consultationDetails: IConsultationDetails | undefined;
  onDownloadRequest: () => void;
  downloadingRequest: boolean;
}

export const RadiologyRequestsSection: React.FC<RadiologyRequestsSectionProps> = ({
  consultationDetails,
  onDownloadRequest,
  downloadingRequest,
}) => {
  const radiologyData = consultationDetails?.radiology;
  const radiologyFileUrls = radiologyData?.fileUrls ?? [];

  const { uploadingFiles, handleFileChange, removeUploadingFile, retryUploadingFile } =
    useFileUpload('radiology', radiologyData?.id, (fileUrl) => {
      if (consultationDetails?.radiology) {
        consultationDetails.radiology.fileUrls = [...radiologyFileUrls, fileUrl];
      }
    });

  const { deletingFiles, handleDeleteFile } = useFileDelete(
    'radiology',
    radiologyData?.id,
    (fileUrl) => {
      if (consultationDetails?.radiology) {
        consultationDetails.radiology.fileUrls = radiologyFileUrls.filter((url) => url !== fileUrl);
      }
    },
  );

  if (!radiologyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <TestTubeDiagonal className="text-primary" />
            Radiology Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
            There are currently no radiology requests from the doctor.
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
            Radiology Requests
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
                Download Radiology Request
              </>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUploadSection
          title="Upload Radiology Results"
          description="Upload your radiology results as PDF files or images (JPG, PNG, GIF, WEBP). You can upload multiple files."
          inputId="radiology-files"
          uploadingFiles={uploadingFiles}
          uploadedFiles={radiologyFileUrls}
          onFileChange={handleFileChange}
          onRemoveUploadingFile={removeUploadingFile}
          onRetryUploadingFile={retryUploadingFile}
          onDeleteUploadedFile={handleDeleteFile}
          deletingFiles={deletingFiles}
          fileLabel="Radiology Result"
        />
      </CardContent>
    </Card>
  );
};
