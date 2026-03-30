/**
 * Branding constants for the application
 * Update these values to rebrand the entire application
 */

export const BRANDING = {
  APP_NAME: 'Fornix Link',
  APP_TAGLINE: 'Your trusted health companion',
  CONTACT_EMAIL: 'admin@fornixlink.com',
  SUPPORT_EMAIL: 'support@fornix.com',
  DPO_EMAIL: 'dpo@fornixlabs.com',
  CONTACT_PHONE: '+233 20 146 2313',
  CONTACT_ADDRESS: 'Ghana, Accra',
  COPYRIGHT_HOLDER: 'Fornix Link',
  SLOGAN: 'Quality Care. Made Simple.',
  /** Canonical base URL – override with NEXT_PUBLIC_APP_URL env var in production */
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'https://fornixlink.com',
  OG_DESCRIPTION:
    'Fornix Link is a secure digital healthcare platform connecting patients with verified doctors for seamless appointment booking, teleconsultations, and medical records management.',
  TWITTER_HANDLE: '@fornixlink',
  KEYWORDS: [
    'healthcare platform',
    'online doctor consultation',
    'book doctor appointment',
    'telemedicine Ghana',
    'medical records',
    'Fornix Link',
    'find a doctor',
    'patient portal',
    'doctor booking',
    'digital health',
  ],
} as const;

export const PLACEHOLDER_HOSPITAL_NAME = 'Fornix Link Hospital';
