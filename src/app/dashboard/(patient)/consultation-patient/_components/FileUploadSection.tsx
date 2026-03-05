import React from 'react';
import { Button } from '@/components/ui/button';
import { CircleCheck, Loader, Paperclip, X, FileText } from 'lucide-react';
import { TooltipComp } from '@/components/ui/tooltip';
import { UploadingFile } from './useFileUpload';

interface FileUploadSectionProps {
  title: string;
  description: string;
  inputId: string;
  uploadingFiles: UploadingFile[];
  uploadedFiles: string[];
  onFileChange: (files: FileList | null) => void;
  onRemoveUploadingFile: (file: File) => void;
  onRetryUploadingFile: (file: File) => void;
  onDeleteUploadedFile: (fileUrl: string) => void;
  deletingFiles: Set<string>;
  fileLabel: string;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  title,
  description,
  inputId,
  uploadingFiles,
  uploadedFiles,
  onFileChange,
  onRemoveUploadingFile,
  onRetryUploadingFile,
  onDeleteUploadedFile,
  deletingFiles,
  fileLabel,
}) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
    <h3 className="mb-3 font-semibold text-gray-800">{title}</h3>
    <p className="mb-4 text-sm text-gray-600">{description}</p>

    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          child={
            <label htmlFor={inputId} className="cursor-pointer">
              <Paperclip className="mr-2 h-4 w-4" />
              Attach Files
            </label>
          }
          asChild
          variant="outline"
          size="sm"
        />
        <input
          id={inputId}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          multiple
          onChange={(e) => onFileChange(e.target.files)}
        />
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Uploading files:</p>
          {uploadingFiles.map((uploadingFile, index) => (
            <div
              key={`${index}-${uploadingFile.file.name}`}
              className="flex items-center justify-between rounded-md bg-white p-2 text-sm"
            >
              <div className="flex items-center gap-2">
                {uploadingFile.status === 'pending' && (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                )}
                {uploadingFile.status === 'uploading' && (
                  <Loader className="h-4 w-4 animate-spin text-blue-600" />
                )}
                {uploadingFile.status === 'success' && (
                  <CircleCheck className="h-4 w-4 text-green-600" />
                )}
                {uploadingFile.status === 'error' && <X className="h-4 w-4 text-red-600" />}
                <span className="max-w-sm truncate">{uploadingFile.file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {uploadingFile.status === 'error' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetryUploadingFile(uploadingFile.file)}
                    child="Retry"
                  />
                )}
                {(uploadingFile.status === 'pending' || uploadingFile.status === 'error') && (
                  <TooltipComp tip="Remove file">
                    <button onClick={() => onRemoveUploadingFile(uploadingFile.file)}>
                      <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </button>
                  </TooltipComp>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Uploaded files:</p>
          {uploadedFiles.map((fileUrl, index) => (
            <div
              key={`${index}-${fileUrl}`}
              className="flex items-center justify-between rounded-md bg-white p-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <CircleCheck className="h-4 w-4 text-green-600" />
                <span className="text-green-600">
                  {fileLabel} {index + 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  child={
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </a>
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteUploadedFile(fileUrl)}
                  disabled={deletingFiles.has(fileUrl)}
                  isLoading={deletingFiles.has(fileUrl)}
                  child={
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length === 0 && uploadingFiles.length === 0 && (
        <div className="rounded-md bg-blue-50 p-3 text-center text-sm text-blue-700">
          No {fileLabel.toLowerCase()} files have been uploaded yet.
        </div>
      )}
    </div>
  </div>
);
