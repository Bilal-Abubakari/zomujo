import { toast } from '@/hooks/use-toast';
import { BRANDING } from '@/constants/branding.constant';
import html2canvas from 'html2canvas';
import { RefObject } from 'react';

async function waitForImageLoading(isImageLoading: boolean | undefined): Promise<void> {
  if (!isImageLoading) {
    return;
  }
  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      clearInterval(interval);
      resolve();
    }, 100);
  });
}

/**
 * Temporarily moves a wrapper element on-screen so the browser fully lays out
 * its contents before html2canvas captures them. Off-screen elements (left: -9999px)
 * are skipped by the browser's rendering pipeline, causing distorted text and borders.
 * Returns a cleanup function that restores the original position.
 */
async function bringOnScreen(wrapper: HTMLElement | null): Promise<() => void> {
  if (!wrapper) {
    return () => {};
  }
  const original = wrapper.style.left;
  wrapper.style.left = '0';
  // Wait one frame for the browser to re-layout and paint
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
  return () => {
    wrapper.style.left = original;
  };
}

export function useShareQR(
  url: string,
  cardRef: RefObject<HTMLDivElement | null>,
  doctorId: string,
  profilePictureBase64?: string,
  isImageLoading?: boolean,
  doctorName?: string,
  profileCardRef?: RefObject<HTMLDivElement | null>,
): {
  copyToClipboard: () => Promise<void>;
  shareOnSocial: (platform: string) => void;
  downloadQRCode: () => Promise<void>;
  downloadProfileCard: () => Promise<void>;
} {
  const copyToClipboard = async (): Promise<void> => {
    await navigator.clipboard.writeText(url);
    toast({ title: 'Link Copied', description: 'Profile link copied to clipboard.' });
  };

  const shareOnSocial = (platform: string): void => {
    const name = doctorName ? `Dr. ${doctorName}` : 'your doctor';
    const text =
      `Hi I am ${name} on ${BRANDING.APP_NAME}.\n\n` +
      `Your health is important to me. You can now book a session with me easily online on ${BRANDING.APP_NAME}.\n\n` +
      `Tap the link below and pick a time that works for you \n${url}`;
    const map: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
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

    await waitForImageLoading(isImageLoading);

    const wrapper = cardRef.current.parentElement;
    const restore = await bringOnScreen(wrapper);

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
            if (profilePictureBase64) {
              clonedCard
                .querySelectorAll('img[data-profile-pic="true"]')
                .forEach((img) => ((img as HTMLImageElement).src = profilePictureBase64));
            }
          }
        },
      });
      const link = document.createElement('a');
      link.download = `${doctorName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating QR card:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not generate the QR card image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      restore();
    }
  };

  const downloadProfileCard = async (): Promise<void> => {
    if (!profileCardRef?.current) {
      return;
    }

    await waitForImageLoading(isImageLoading);

    try {
      const canvas = await html2canvas(profileCardRef.current, {
        useCORS: true,
        allowTaint: false,
        logging: false,
        scale: 2,
        backgroundColor: '#0d2137',
        width: 540,
        height: 810,
        windowWidth: 540,
        windowHeight: 810,
        onclone: (clonedDoc) => {
          Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"], style')).forEach((el) =>
            el.remove(),
          );
          // Restore box-sizing reset so inline-styled pills/borders render correctly
          const reset = clonedDoc.createElement('style');
          reset.textContent =
            '*, *::before, *::after { box-sizing: border-box; } body { margin: 0; padding: 0; }';
          clonedDoc.head.appendChild(reset);
          // Ensure the wrapper doesn't clip the card
          const wrapper = clonedDoc.querySelector(
            '[data-profile-card-wrapper="true"]',
          ) as HTMLElement | null;
          if (wrapper) {
            wrapper.style.overflow = 'visible';
            wrapper.style.width = '540px';
            wrapper.style.height = '810px';
            wrapper.style.position = 'absolute';
            wrapper.style.top = '0';
            wrapper.style.left = '0';
          }
          if (profilePictureBase64) {
            clonedDoc
              .querySelectorAll('img[data-profile-card-pic="true"]')
              .forEach((img) => ((img as HTMLImageElement).src = profilePictureBase64));
          }
        },
      });
      const link = document.createElement('a');
      link.download = `${doctorName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating profile card:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not generate the profile image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { copyToClipboard, shareOnSocial, downloadQRCode, downloadProfileCard };
}
