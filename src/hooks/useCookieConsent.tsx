'use client';

import { useCallback, useState } from 'react';
import { COOKIE_POLICY_VERSION, ICookieConsent, LocalStorageManager } from '@/lib/localStorage';

export type CookiePreferences = Omit<ICookieConsent, 'essential' | 'acceptedAt' | 'policyVersion'>;

interface UseCookieConsentReturn {
  /** Full stored consent object – null means user has not yet responded */
  consent: ICookieConsent | null;
  /** Whether the user has already made a choice for the current policy version */
  hasResponded: boolean;
  /** Whether the preferences modal is open */
  isPreferencesOpen: boolean;
  /** Current in-progress preference selections (before saving) */
  draftPreferences: CookiePreferences;
  openPreferences: () => void;
  closePreferences: () => void;
  /** Accept all optional cookies */
  acceptAll: () => void;
  /** Reject all optional cookies (essential only) */
  rejectAll: () => void;
  /** Persist whatever is currently in draftPreferences */
  savePreferences: () => void;
  /** Update a single draft preference */
  setDraftPreference: (key: keyof CookiePreferences, value: boolean) => void;
}

const DEFAULT_DRAFT: CookiePreferences = {
  functional: false,
  analytics: false,
  marketing: false,
};

export function useCookieConsent(): UseCookieConsentReturn {
  const [consent, setConsent] = useState<ICookieConsent | null>(() => {
    const stored = LocalStorageManager.getCookieConsent();
    return stored?.policyVersion === COOKIE_POLICY_VERSION ? stored : null;
  });
  const [hasResponded, setHasResponded] = useState(() =>
    LocalStorageManager.hasCookieConsentForCurrentVersion(),
  );
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [draftPreferences, setDraftPreferences] = useState<CookiePreferences>(() => {
    const stored = LocalStorageManager.getCookieConsent();
    if (stored?.policyVersion === COOKIE_POLICY_VERSION) {
      return {
        functional: stored.functional,
        analytics: stored.analytics,
        marketing: stored.marketing,
      };
    }
    return DEFAULT_DRAFT;
  });

  const persist = useCallback((prefs: CookiePreferences): void => {
    const full: ICookieConsent = {
      essential: true,
      ...prefs,
      acceptedAt: new Date().toISOString(),
      policyVersion: COOKIE_POLICY_VERSION,
    };
    LocalStorageManager.setCookieConsent(full);
    setConsent(full);
    setHasResponded(true);
  }, []);

  const acceptAll = useCallback((): void => {
    const prefs: CookiePreferences = { functional: true, analytics: true, marketing: true };
    setDraftPreferences(prefs);
    persist(prefs);
    setIsPreferencesOpen(false);
  }, [persist]);

  const rejectAll = useCallback((): void => {
    const prefs: CookiePreferences = { functional: false, analytics: false, marketing: false };
    setDraftPreferences(prefs);
    persist(prefs);
    setIsPreferencesOpen(false);
  }, [persist]);

  const savePreferences = useCallback((): void => {
    persist(draftPreferences);
    setIsPreferencesOpen(false);
  }, [draftPreferences, persist]);

  const setDraftPreference = useCallback((key: keyof CookiePreferences, value: boolean): void => {
    setDraftPreferences((prev) => ({ ...prev, [key]: value }));
  }, []);

  const openPreferences = useCallback((): void => setIsPreferencesOpen(true), []);
  const closePreferences = useCallback((): void => setIsPreferencesOpen(false), []);

  return {
    consent,
    hasResponded,
    isPreferencesOpen,
    draftPreferences,
    openPreferences,
    closePreferences,
    acceptAll,
    rejectAll,
    savePreferences,
    setDraftPreference,
  };
}
