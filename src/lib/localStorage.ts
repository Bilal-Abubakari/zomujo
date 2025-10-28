/**
 * LocalStorage utility class for type-safe storage operations
 * All methods are static for easy access throughout the application
 */

// Define known localStorage keys and their types
type LocalStorageKeys = {
  OAUTH_DOCTOR_ID: string | null;
  OAUTH_SLOT_ID: string | null;
};

type LocalStorageKey = keyof LocalStorageKeys;

export class LocalStorageManager {
  // Known localStorage keys
  static readonly KEYS = {
    OAUTH_DOCTOR_ID: 'oauth_doctor_id',
    OAUTH_SLOT_ID: 'oauth_slot_id',
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
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
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
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key) as LocalStorageKeys[K];
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
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
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
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Save OAuth booking data to localStorage
   * @param doctorId - The doctor ID
   * @param slotId - The slot ID
   */
  static saveOAuthBookingData(doctorId?: string, slotId?: string): void {
    if (doctorId) {
      this.setItem(this.KEYS.OAUTH_DOCTOR_ID, doctorId);
    }
    if (slotId) {
      this.setItem(this.KEYS.OAUTH_SLOT_ID, slotId);
    }
  }

  /**
   * Get OAuth booking data from localStorage
   * @returns Object containing doctorId and slotId if they exist
   */
  static getOAuthBookingData(): { doctorId?: string; slotId?: string } {
    const doctorId = this.getItem(this.KEYS.OAUTH_DOCTOR_ID);
    const slotId = this.getItem(this.KEYS.OAUTH_SLOT_ID);

    return {
      ...(doctorId && { doctorId }),
      ...(slotId && { slotId }),
    };
  }

  /**
   * Clear OAuth booking data from localStorage
   */
  static clearOAuthBookingData(): void {
    this.removeItem(this.KEYS.OAUTH_DOCTOR_ID);
    this.removeItem(this.KEYS.OAUTH_SLOT_ID);
  }
}
