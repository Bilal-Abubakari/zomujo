/**
 * LocalStorage utility class for type-safe storage operations
 * All methods are static for easy access throughout the application
 */

/** Cookie category preferences stored when the user makes a choice */
export interface ICookieConsent {
  /** Always true – cannot be disabled */
  essential: true;
  /** Preference / UI-setting cookies */
  functional: boolean;
  /** Anonymised usage analytics */
  analytics: boolean;
  /** Marketing / retargeting (declared unused – stored for future use) */
  marketing: boolean;
  /** ISO timestamp of when consent was given / last updated */
  acceptedAt: string;
  /** Policy version that was accepted – increment to force re-consent */
  policyVersion: string;
}

// Define known localStorage keys and their types
type LocalStorageKeys = {
  OAUTH_DOCTOR_ID: string | null;
  OAUTH_SLOT_ID: string | null;
  OAUTH_ROLE: string | null;
  REDIRECT_AFTER_LOGIN: string | null;
  SESSION_EXPIRED: string | null;
  COOKIE_CONSENT: string | null;
};

type LocalStorageKey = keyof LocalStorageKeys;

/** Current cookie-policy version. Bump this string to force re-consent. */
export const COOKIE_POLICY_VERSION = '1.0.0';

/** Prefix for per-consultation medical-data consent flags */
const CONSULTATION_CONSENT_PREFIX = 'consultation_consent_';

export class LocalStorageManager {
  // Known localStorage keys
  static readonly KEYS = {
    OAUTH_DOCTOR_ID: 'oauth_doctor_id',
    OAUTH_SLOT_ID: 'oauth_slot_id',
    OAUTH_ROLE: 'oauth_role',
    REDIRECT_AFTER_LOGIN: 'redirectAfterLogin',
    SESSION_EXPIRED: 'sessionExpired',
    COOKIE_CONSENT: 'cookieConsent',
  } as const;

  /**
   * Set an item in localStorage
   * @param key - The key to store the value under
   * @param value - The value to store
   */
  static setItem<K extends LocalStorageKey>(
    key: (typeof LocalStorageManager.KEYS)[K],
    value: string,
  ): void {
    try {
      if (globalThis.window !== undefined) {
        globalThis.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting localStorage item ${key}:`, error);
    }
  }

  /**
   * Get an item from localStorage
   * @param key - The key to retrieve the value for
   * @returns The value stored under the key, or null if not found
   */
  static getItem<K extends LocalStorageKey>(
    key: (typeof LocalStorageManager.KEYS)[K],
  ): LocalStorageKeys[K] {
    try {
      if (globalThis.window !== undefined) {
        return globalThis.localStorage.getItem(key) as LocalStorageKeys[K];
      }
      return null as LocalStorageKeys[K];
    } catch (error) {
      console.error(`Error getting localStorage item ${key}:`, error);
      return null as LocalStorageKeys[K];
    }
  }

  /**
   * Remove an item from localStorage
   * @param key - The key to remove
   */
  static removeItem<K extends LocalStorageKey>(key: (typeof LocalStorageManager.KEYS)[K]): void {
    try {
      if (globalThis.window !== undefined) {
        globalThis.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage item ${key}:`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  static clear(): void {
    try {
      if (globalThis.window !== undefined) {
        globalThis.localStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Save OAuth booking data to localStorage
   * @param doctorId - The doctor ID
   * @param slotId - The slot ID
   * @param role - The user role
   */
  static saveOAuthBookingData(doctorId?: string, slotId?: string, role?: string): void {
    if (doctorId) {
      this.setItem(this.KEYS.OAUTH_DOCTOR_ID, doctorId);
    }
    if (slotId) {
      this.setItem(this.KEYS.OAUTH_SLOT_ID, slotId);
    }
    if (role) {
      this.setItem(this.KEYS.OAUTH_ROLE, role);
    }
  }

  /**
   * Get OAuth booking data from localStorage
   * @returns Object containing doctorId, slotId, and role if they exist
   */
  static getOAuthBookingData(): { doctorId?: string; slotId?: string; role?: string } {
    const doctorId = this.getItem(this.KEYS.OAUTH_DOCTOR_ID);
    const slotId = this.getItem(this.KEYS.OAUTH_SLOT_ID);
    const role = this.getItem(this.KEYS.OAUTH_ROLE);

    return {
      ...(doctorId && { doctorId }),
      ...(slotId && { slotId }),
      ...(role && { role }),
    };
  }

  /**
   * Clear OAuth booking data from localStorage
   */
  static clearOAuthBookingData(): void {
    this.removeItem(this.KEYS.OAUTH_DOCTOR_ID);
    this.removeItem(this.KEYS.OAUTH_SLOT_ID);
    this.removeItem(this.KEYS.OAUTH_ROLE);
  }

  /**
   * Save redirect URL for after login
   * @param url - The URL to redirect to after login
   */
  static saveRedirectUrl(url: string): void {
    this.setItem(this.KEYS.REDIRECT_AFTER_LOGIN, url);
  }

  /**
   * Get and clear redirect URL
   * @returns The redirect URL if it exists, null otherwise
   */
  static getAndClearRedirectUrl(): string | null {
    const url = this.getItem(this.KEYS.REDIRECT_AFTER_LOGIN);
    if (url) {
      this.removeItem(this.KEYS.REDIRECT_AFTER_LOGIN);
    }
    return url;
  }

  /**
   * Set session expired flag
   */
  static setSessionExpiredFlag(): void {
    this.setItem(this.KEYS.SESSION_EXPIRED, 'true');
  }

  /**
   * Check if session has expired
   * @returns True if session expired flag is set
   */
  static hasSessionExpired(): boolean {
    return this.getItem(this.KEYS.SESSION_EXPIRED) === 'true';
  }

  /**
   * Clear session expired flag
   */
  static clearSessionExpiredFlag(): void {
    this.removeItem(this.KEYS.SESSION_EXPIRED);
  }

  /**
   * Store arbitrary JSON serializable data under any key (namespaced by caller).
   */
  static setJSON(key: string, value: unknown): void {
    try {
      if (globalThis.window !== undefined) {
        globalThis.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting JSON localStorage item ${key}:`, error);
    }
  }

  /**
   * Retrieve arbitrary JSON data stored with setJSON. Returns null if parse fails or key missing.
   */
  static getJSON<T = unknown>(key: string): T | null {
    try {
      if (globalThis.window !== undefined) {
        const raw = globalThis.localStorage.getItem(key);
        if (!raw) {
          return null;
        }
        return JSON.parse(raw) as T;
      }
      return null;
    } catch (error) {
      console.error(`Error parsing JSON localStorage item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove arbitrary JSON draft key
   */
  static removeJSON(key: string): void {
    try {
      if (globalThis.window !== undefined) {
        globalThis.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing JSON localStorage item ${key}:`, error);
    }
  }

  // ─── Cookie Consent ────────────────────────────────────────────────────────

  /**
   * Persist the user's cookie-consent preferences.
   */
  static setCookieConsent(consent: ICookieConsent): void {
    this.setJSON(this.KEYS.COOKIE_CONSENT, consent);
  }

  /**
   * Retrieve stored cookie-consent preferences.
   * Returns null if the user has not yet responded.
   */
  static getCookieConsent(): ICookieConsent | null {
    return this.getJSON<ICookieConsent>(this.KEYS.COOKIE_CONSENT);
  }

  /**
   * Remove stored cookie-consent preferences (forces re-consent on next visit).
   */
  static clearCookieConsent(): void {
    this.removeJSON(this.KEYS.COOKIE_CONSENT);
  }

  /**
   * Returns true if the user has already responded to the consent banner
   * AND the stored policy version matches the current version.
   */
  static hasCookieConsentForCurrentVersion(): boolean {
    const consent = this.getCookieConsent();
    return consent !== null && consent.policyVersion === COOKIE_POLICY_VERSION;
  }

  // ─── Per-Consultation Medical-Data Consent ─────────────────────────────────

  /**
   * Record that the patient has given informed consent for the given consultation.
   * @param consultationId - The unique identifier of the consultation / appointment.
   */
  static setConsultationConsent(consultationId: string): void {
    this.setJSON(`${CONSULTATION_CONSENT_PREFIX}${consultationId}`, {
      consentedAt: new Date().toISOString(),
    });
  }

  /**
   * Check whether the patient has already consented for a specific consultation.
   * @param consultationId - The unique identifier of the consultation / appointment.
   */
  static getConsultationConsent(consultationId: string): boolean {
    const record = this.getJSON<{ consentedAt: string }>(
      `${CONSULTATION_CONSENT_PREFIX}${consultationId}`,
    );
    return record !== null;
  }

  /**
   * Clear the per-consultation consent flag (e.g., in testing or on session clear).
   */
  static clearConsultationConsent(consultationId: string): void {
    this.removeJSON(`${CONSULTATION_CONSENT_PREFIX}${consultationId}`);
  }
}
