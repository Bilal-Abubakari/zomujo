import { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import {
  removeLabFile,
  removeRadiologyFile,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';

export const useFileDelete = (
  type: 'lab' | 'radiology',
  id: string | undefined,
  onSuccess: (fileUrl: string) => void,
): {
  deletingFiles: Set<string>;
  handleDeleteFile: (fileUrl: string) => Promise<void>;
} => {
  const dispatch = useAppDispatch();
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const handleDeleteFile = async (fileUrl: string): Promise<void> => {
    if (!id) {
      return;
    }

    setDeletingFiles((prev) => new Set(prev).add(fileUrl));
    let result: Toast;

    if (type === 'lab') {
      result = await dispatch(removeLabFile({ labId: id, fileUrl })).unwrap();
    } else {
      result = await dispatch(removeRadiologyFile({ id, fileUrl })).unwrap();
    }

    if (showErrorToast(result)) {
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileUrl);
        return newSet;
      });
      return;
    }

    toast(result);
    onSuccess(fileUrl);

    toast({
      title: 'Success',
      description: `${type === 'lab' ? 'Lab' : 'Radiology'} file deleted successfully`,
      variant: 'success',
    });

    setDeletingFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fileUrl);
      return newSet;
    });
  };

  return {
    deletingFiles,
    handleDeleteFile,
  };
};
