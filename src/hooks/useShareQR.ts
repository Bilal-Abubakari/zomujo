import { toast } from '@/hooks/use-toast';
import { BRANDING } from '@/constants/branding.constant';
import html2canvas from 'html2canvas';
import { RefObject } from 'react';

/**
 * Polls until the profile picture is no longer being loaded by
 * `useProfilePictureBase64`. Uses a getter so we always read the
 * latest value from React state rather than a stale closure.
 */
async function waitForImageLoading(
  isLoadingGetter: () => boolean | undefined,
  timeoutMs = 5000,
): Promise<void> {
  const start = Date.now();
  while (isLoadingGetter() && Date.now() - start < timeoutMs) {
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Ensures we have a base64 data-URI for the doctor's profile picture.
 * In production the hook-driven conversion can still be pending when the
 * user clicks download, so as a last resort we fetch it inline here.
 */
async function ensureProfilePictureBase64(
  existing: string | undefined,
  sourceUrl: string | undefined,
): Promise<string> {
  if (existing) {
    return existing;
  }
  if (!sourceUrl) {
    return '';
  }
  try {
    const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(sourceUrl)}`);
    if (!response.ok) {
      return '';
    }
    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = (): void => resolve((reader.result as string) || '');
      reader.onerror = (): void => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

/**
 * Pre-decodes a base64 image so `drawImage` has a fully-loaded bitmap.
 * Resolves even on error so the caller can gracefully fall back.
 */
async function decodeImage(dataUrl: string): Promise<HTMLImageElement | null> {
  if (!dataUrl) {
    return null;
  }
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = (): void => resolve(img);
    img.onerror = (): void => resolve(null);
    img.src = dataUrl;
  });
}

/**
 * Temporarily moves a wrapper element on-screen so the browser fully lays out
 * its contents before html2canvas captures them. Off-screen elements (left: -9999px)
 * are skipped by the browser's rendering pipeline, causing distorted text and borders.
 *
 * While the wrapper is briefly on-screen, we cover the page with a full-viewport
 * scrim showing a "Generating…" message so the user never sees the raw card flash
 * by. html2canvas captures only the element passed to it, so the scrim is never
 * included in the output.
 *
 * Returns a cleanup function that restores the original position and removes the scrim.
 */
async function bringOnScreen(wrapper: HTMLElement | null): Promise<() => void> {
  if (!wrapper) {
    return () => {};
  }

  const scrim = document.createElement('div');
  scrim.dataset.shareQrScrim = 'true';
  scrim.style.cssText = [
    'position: fixed',
    'inset: 0',
    'z-index: 2147483647',
    'background: rgba(15, 23, 42, 0.55)',
    'backdrop-filter: blur(4px)',
    '-webkit-backdrop-filter: blur(4px)',
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'pointer-events: auto',
    'cursor: progress',
    'font-family: system-ui, sans-serif',
    'color: #ffffff',
    'font-size: 14px',
    'font-weight: 500',
    'letter-spacing: 0.02em',
    'transition: opacity 120ms ease-out',
    'opacity: 0',
  ].join(';');
  scrim.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;">
      <div style="
        width:36px;height:36px;border-radius:50%;
        border:3px solid rgba(255,255,255,0.25);
        border-top-color:#ffffff;
        animation:fnx-share-spin 0.8s linear infinite;
      "></div>
      <span>Generating image…</span>
    </div>
    <style>@keyframes fnx-share-spin{to{transform:rotate(360deg)}}</style>
  `;
  document.body.appendChild(scrim);
  // Fade the scrim in on the next frame
  requestAnimationFrame(() => {
    scrim.style.opacity = '1';
  });

  const original = wrapper.style.left;
  wrapper.style.left = '0';
  // Wait two frames for the browser to re-layout and paint the wrapper
  // (and for the scrim to fade in over it)
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

  return () => {
    wrapper.style.left = original;
    // Fade out, then remove
    scrim.style.opacity = '0';
    setTimeout(() => scrim.remove(), 150);
  };
}

interface ShareQROptions {
  profilePictureBase64?: string;
  isImageLoading?: boolean;
  doctorName?: string;
  profileCardRef?: RefObject<HTMLDivElement | null>;
  profilePictureUrl?: string;
}

export function useShareQR(
  url: string,
  cardRef: RefObject<HTMLDivElement | null>,
  doctorId: string,
  options: ShareQROptions = {},
): {
  copyToClipboard: () => Promise<void>;
  shareOnSocial: (platform: string) => void;
  downloadQRCode: () => Promise<void>;
  downloadProfileCard: () => Promise<void>;
} {
  const { profilePictureBase64, isImageLoading, doctorName, profileCardRef, profilePictureUrl } =
    options;

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

    await waitForImageLoading(() => isImageLoading);
    const resolvedBase64 = await ensureProfilePictureBase64(
      profilePictureBase64,
      profilePictureUrl,
    );

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
            if (resolvedBase64) {
              clonedCard
                .querySelectorAll('img[data-profile-pic="true"]')
                .forEach((img) => ((img as HTMLImageElement).src = resolvedBase64));
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

    await waitForImageLoading(() => isImageLoading);
    const resolvedBase64 = await ensureProfilePictureBase64(
      profilePictureBase64,
      profilePictureUrl,
    );
    const bgImg = await decodeImage(resolvedBase64);

    const CARD_W = 540;
    const CARD_H = 810;
    const SCALE = 2;

    const wrapper = profileCardRef.current.parentElement;
    const restore = await bringOnScreen(wrapper);

    // Track visibility state so we can restore it on error too
    const picEl = profileCardRef.current.querySelector<HTMLImageElement>(
      'img[data-profile-card-pic="true"]',
    );

    try {
      // ── Step 1: Create the output canvas ──────────────────────────────
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = CARD_W * SCALE;
      outputCanvas.height = CARD_H * SCALE;
      const ctx = outputCanvas.getContext('2d');
      if (!ctx) {
        toast({
          title: 'Download Failed',
          description: 'Could not generate the profile image. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // ── Step 2: Draw the background directly via Canvas API ───────────
      // html2canvas cannot reliably decode base64 data-URIs across all
      // production environments, so we bypass it entirely for the image.
      if (bgImg && bgImg.naturalWidth > 0 && bgImg.naturalHeight > 0) {
        // Replicate CSS: object-fit: cover; object-position: top center
        const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
        const canvasAspect = CARD_W / CARD_H;
        let dw: number, dh: number, dx: number, dy: number;
        if (imgAspect > canvasAspect) {
          // Image wider than card: fit height, crop sides (centre horizontally)
          dh = CARD_H * SCALE;
          dw = dh * imgAspect;
          dx = (CARD_W * SCALE - dw) / 2;
          dy = 0;
        } else {
          // Image taller than card: fit width, crop bottom (top-aligned)
          dw = CARD_W * SCALE;
          dh = dw / imgAspect;
          dx = 0;
          dy = 0;
        }
        ctx.drawImage(bgImg, dx, dy, dw, dh);
      } else {
        // Dark base so text is legible even if the gradient div doesn't paint
        ctx.fillStyle = '#0d2137';
        ctx.fillRect(0, 0, CARD_W * SCALE, CARD_H * SCALE);
      }

      // ── Step 3: Hide the profile picture from html2canvas ────────────
      // We've already drawn it; let html2canvas handle everything else.
      if (picEl) {
        picEl.style.visibility = 'hidden';
      }

      // ── Step 4: Capture overlays + text + QR with html2canvas ────────
      const overlayCanvas = await html2canvas(profileCardRef.current, {
        useCORS: true,
        allowTaint: false,
        logging: false,
        scale: SCALE,
        backgroundColor: null, // transparent – we drew the background above
        width: CARD_W,
        height: CARD_H,
        windowWidth: CARD_W,
        windowHeight: CARD_H,
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
          const clonedWrapper = clonedDoc.querySelector(
            '[data-profile-card-wrapper="true"]',
          ) as HTMLElement | null;
          if (clonedWrapper) {
            clonedWrapper.style.overflow = 'visible';
            clonedWrapper.style.width = `${CARD_W}px`;
            clonedWrapper.style.height = `${CARD_H}px`;
            clonedWrapper.style.position = 'absolute';
            clonedWrapper.style.top = '0';
            clonedWrapper.style.left = '0';
          }
          // The card has a solid `#0d2137` inline backgroundColor that would
          // paint over the doctor photo we already drew on the output canvas.
          // Force it transparent so the gradient overlay can blend with the
          // background image we composited underneath.
          const clonedCard = clonedDoc.querySelector(
            '[data-profile-card-ref="true"]',
          ) as HTMLElement | null;
          if (clonedCard && bgImg) {
            clonedCard.style.backgroundColor = 'transparent';
          }
          // Keep the profile picture hidden in the clone as well
          const clonedPic = clonedDoc.querySelector(
            'img[data-profile-card-pic="true"]',
          ) as HTMLImageElement | null;
          if (clonedPic) {
            clonedPic.style.visibility = 'hidden';
          }
        },
      });

      // ── Step 5: Restore visibility ────────────────────────────────────
      if (picEl) {
        picEl.style.visibility = '';
      }

      // ── Step 6: Composite overlays onto the background ────────────────
      ctx.drawImage(overlayCanvas, 0, 0);

      // ── Step 7: Download ───────────────────────────────────────────────
      const link = document.createElement('a');
      link.download = `${doctorName ?? 'doctor'}.png`;
      link.href = outputCanvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      // Ensure visibility is always restored even if something throws
      if (picEl) {
        picEl.style.visibility = '';
      }
      console.error('Error generating profile card:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not generate the profile image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      restore();
    }
  };

  return { copyToClipboard, shareOnSocial, downloadQRCode, downloadProfileCard };
}
