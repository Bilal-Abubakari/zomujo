import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { BRANDING } from '@/constants/branding.constant';
import { RefObject } from 'react';

export function useShareQR(
  url: string,
  cardRef: RefObject<HTMLDivElement | null>,
  doctorId: string,
  profilePictureBase64?: string,
  isImageLoading?: boolean,
): {
  copyToClipboard: () => Promise<void>;
  shareOnSocial: (platform: string) => void;
  downloadQRCode: () => Promise<void>;
} {
  const copyToClipboard = async (): Promise<void> => {
    await navigator.clipboard.writeText(url);
    toast({ title: 'Link Copied', description: 'Profile link copied to clipboard.' });
  };

  const shareOnSocial = (platform: string): void => {
    const text = `Check out this doctor profile on ${BRANDING.APP_NAME}: `;
    const map: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + url)}`,
    };
    const shareUrl = map[platform];
    if (shareUrl && globalThis.window !== undefined) {
      globalThis.window.open(shareUrl, '_blank');
    }
  };

  const downloadQRCode = async (): Promise<void> => {
    if (!cardRef.current) {
      return;
    }

    // If the profile image is still being converted to base64, wait for it
    if (isImageLoading) {
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          clearInterval(interval);
          resolve();
        }, 100);
      });
    }

    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: false,
        logging: false,
        scale: 2,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"], style')).forEach((el) =>
            el.remove(),
          );
          const clonedCard = clonedDoc.querySelector('[data-card-ref="true"]') as HTMLElement;
          if (clonedCard) {
            clonedCard.style.backgroundColor = '#ffffff';
            // Ensure any img tags in the cloned card use the base64 src
            if (profilePictureBase64) {
              const imgs = clonedCard.querySelectorAll('img[data-profile-pic="true"]');
              imgs.forEach((img) => {
                (img as HTMLImageElement).src = profilePictureBase64;
              });
            }
          }
        },
      });
      const link = document.createElement('a');
      link.download = `Doctor_Card_${doctorId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating QR card:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not generate the QR card image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { copyToClipboard, shareOnSocial, downloadQRCode };
}
