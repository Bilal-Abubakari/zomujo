import Image from 'next/image';
import Link from 'next/link';
import { JSX } from 'react';
import { Logo } from '@/assets/images';
import { Navigation } from '@/components/home/navigation';
import { BRANDING } from '@/constants/branding.constant';

const Header = (): JSX.Element => (
  <header className="header-bg-transparent flex items-center justify-between p-4 transition-colors duration-500">
    <Link href="/">
      <div className="flex items-center space-x-2">
        <Image src={Logo} alt="Logo" width={40} height={40} />
        <span className="text-xl font-bold text-white">{BRANDING.APP_NAME}</span>
      </div>
    </Link>
    <Navigation />
  </header>
);

export default Header;
