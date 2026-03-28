'use client';

import { JSX } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import CookiePreferencesModal from './CookiePreferencesModal';

const CookieConsentBanner = (): JSX.Element | null => {
  const {
    hasResponded,
    isPreferencesOpen,
    draftPreferences,
    openPreferences,
    closePreferences,
    acceptAll,
    rejectAll,
    savePreferences,
    setDraftPreference,
  } = useCookieConsent();

  if (hasResponded) {
    return null;
  }

  return (
    <>
      {/* ── Banner ── */}
      <section
        aria-label="Cookie consent"
        className={cn(
          'fixed right-0 bottom-0 left-0 z-100 border-t bg-white shadow-2xl',
          'animate-in slide-in-from-bottom-4 duration-300',
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 lg:px-8">
          {/* Icon + copy */}
          <div className="flex items-start gap-3 sm:flex-1">
            <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <Cookie className="text-primary h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-gray-900">
                We use cookies &amp; similar technologies
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                Fornix Link uses essential cookies to keep the platform secure and functional. With
                your consent we also use functional, analytics, and marketing cookies to improve
                your experience. See our{' '}
                <a
                  href="/cookie-policy"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Cookie Policy
                </a>{' '}
                and{' '}
                <a
                  href="/privacy-policy"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Privacy Policy
                </a>{' '}
                for details.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              child="Manage Preferences"
              className="h-8 text-xs"
              onClick={openPreferences}
            />
            <Button
              variant="outline"
              child="Reject All"
              className="h-8 text-xs"
              onClick={rejectAll}
            />
            <Button child="Accept All" className="h-8 text-xs" onClick={acceptAll} />
          </div>

          {/* Dismiss (same as reject) */}
          <button
            onClick={rejectAll}
            aria-label="Dismiss cookie banner"
            className="absolute top-3 right-3 rounded-sm p-1 opacity-60 transition-opacity hover:opacity-100 sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ── Preferences Modal ── */}
      <CookiePreferencesModal
        open={isPreferencesOpen}
        onOpenChange={(open: boolean) => (open ? openPreferences() : closePreferences())}
        draftPreferences={draftPreferences}
        onSetPreference={setDraftPreference}
        onAcceptAll={acceptAll}
        onRejectAll={rejectAll}
        onSave={savePreferences}
      />
    </>
  );
};

export default CookieConsentBanner;
