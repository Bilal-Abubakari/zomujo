import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import {
  addLabFile,
  addRadiologyFile,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { showErrorToast } from '@/lib/utils';
import { Toast } from '@/hooks/use-toast';

export interface UploadingFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
}

export const useFileUpload = (
  type: 'lab' | 'radiology',
  id: string | undefined,
  onSuccess: (fileUrl: string) => void,
): {
  uploadingFiles: UploadingFile[];
  handleFileChange: (files: FileList | null) => void;
  removeUploadingFile: (file: File) => void;
  retryUploadingFile: (file: File) => void;
} => {
  const dispatch = useAppDispatch();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const handleFileChange = (files: FileList | null): void => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((file) => ({
        file,
        status: 'pending' as const,
      }));
      setUploadingFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeUploadingFile = (file: File): void => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const retryUploadingFile = (file: File): void => {
    setUploadingFiles((prev) =>
      prev.map((f) => (f.file === file ? { ...f, status: 'pending' } : f)),
    );
  };

  const removeFile = useCallback((pendingFile: UploadingFile): void => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== pendingFile.file));
  }, []);

  const handleSuccess = useCallback(
    (pendingFile: UploadingFile, newFileUrl: string): void => {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === pendingFile.file ? { ...f, status: 'success', url: newFileUrl } : f,
        ),
      );
      onSuccess(newFileUrl);
      setTimeout(removeFile, 1000, pendingFile);
    },
    [onSuccess, removeFile],
  );

  const handleError = useCallback((pendingFile: UploadingFile): void => {
    setUploadingFiles((prev) =>
      prev.map((f) => (f.file === pendingFile.file ? { ...f, status: 'error' } : f)),
    );
  }, []);

  const uploadFile = useCallback(
    async (pendingFile: UploadingFile): Promise<void> => {
      setUploadingFiles((prev) =>
        prev.map((f) => (f.file === pendingFile.file ? { ...f, status: 'uploading' } : f)),
      );

      if (!id) {
        return;
      }

      try {
        let result: Toast | string;
        if (type === 'lab') {
          result = await dispatch(addLabFile({ labId: id, file: pendingFile.file })).unwrap();
        } else {
          result = await dispatch(addRadiologyFile({ id, file: pendingFile.file })).unwrap();
        }

        if (showErrorToast(result)) {
          handleError(pendingFile);
          return;
        }

        handleSuccess(pendingFile, result as string);
      } catch {
        handleError(pendingFile);
      }
    },
    [type, id, dispatch, handleError, handleSuccess],
  );

  useEffect(() => {
    const pendingFile = uploadingFiles.find((f) => f.status === 'pending');
    if (pendingFile && id) {
      void uploadFile(pendingFile);
    }
  }, [uploadingFiles, id, uploadFile]);

  return {
    uploadingFiles,
    handleFileChange,
    removeUploadingFile,
    retryUploadingFile,
  };
};
