import Image from 'next/image';
import Link from 'next/link';
import { JSX } from 'react';
import { Logo } from '@/assets/images';
import { Navigation } from '@/components/home/navigation';

const Header = (): JSX.Element => (
  <header className="header-bg-transparent flex items-center justify-between p-4 shadow-md transition-colors duration-500">
    <Link href="/">
      <div className="flex items-center space-x-2">
        <Image src={Logo} alt="Logo" width={40} height={40} />
        <span className="text-xl font-bold text-gray-800">Zomujo</span>
      </div>
    </Link>
    <Navigation />
  </header>
);

export default Header;
