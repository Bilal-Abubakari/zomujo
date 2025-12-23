/**
 * Development Helper Component
 * 
 * This component provides a quick access button to the development login page
 * for testing different user roles without API integration.
 * 
 * Import and add this to your layout or home page during development.
 * 
 * Example usage:
 * ```tsx
 * import DevLoginBanner from '@/components/dev/DevLoginBanner';
 * 
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       <DevLoginBanner />
 *       {children}
 *     </>
 *   );
 * }
 * ```
 * 
 * ⚠️ Remember to remove before production!
 */

'use client';

import Link from 'next/link';
import { JSX } from 'react';
import { Bug } from 'lucide-react';

const DevLoginBanner = (): JSX.Element => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link
        href="/dev-login"
        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
      >
        <Bug size={20} />
        <span className="font-semibold">Dev Login</span>
      </Link>
    </div>
  );
};

export default DevLoginBanner;
