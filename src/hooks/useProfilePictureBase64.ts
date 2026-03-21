import { useEffect, useState } from 'react';
import { IDoctor } from '@/types/doctor.interface';

export function useProfilePictureBase64(doctor: IDoctor | null): {
  profilePictureBase64: string;
  setProfilePictureBase64: (value: string) => void;
} {
  const [profilePictureBase64, setProfilePictureBase64] = useState<string>('');

  useEffect(() => {
    const convertToBase64 = async (): Promise<void> => {
      if (doctor?.profilePicture) {
        try {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(doctor.profilePicture)}`;
          const response = await fetch(proxyUrl);
          if (!response.ok) {
            return;
          }
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = (): void => {
            setProfilePictureBase64(reader.result as string);
          };
          reader.readAsDataURL(blob);
        } catch {
          // silent fallback
        }
      }
    };
    void convertToBase64();
  }, [doctor?.profilePicture]);

  return { profilePictureBase64, setProfilePictureBase64 };
}
