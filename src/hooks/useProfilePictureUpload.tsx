import { ChangeEvent, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { updateProfilePicture } from '@/lib/features/auth/authThunk';
import { toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';

interface UseProfilePictureUploadProps {
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const useProfilePictureUpload = ({
  handleImageChange,
}: UseProfilePictureUploadProps): {
  handleProfilePictureChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading: boolean;
} => {
  const dispatch = useAppDispatch();
  const [isUploading, setIsUploading] = useState(false);

  const handleProfilePictureChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 1024 * 1024 * 5) {
      toast({
        title: 'File size exceeds 5MB',
        description: 'Please select a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await dispatch(updateProfilePicture(file)).unwrap();
      toast(response);
      if (!showErrorToast(response)) {
        handleImageChange(event);
      }
    } catch (error) {
      console.error('Failed to update profile picture:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleProfilePictureChange,
    isUploading,
  };
};
