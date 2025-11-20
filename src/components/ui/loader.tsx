import Image from 'next/image';
import { Logo } from '@/assets/images';
import { JSX } from 'react';

export function Loader(): JSX.Element {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <div className="border-primary absolute inset-0 animate-spin rounded-full border-t-4 border-r-4"></div>
        <Image src={Logo} alt="Fornix Link-logo" className="h-16 w-16" />
      </div>
    </div>
  );
}
