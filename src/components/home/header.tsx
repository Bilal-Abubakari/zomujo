import Image from 'next/image';
import Link from 'next/link';
import { JSX } from 'react';
import { Logo } from '@/assets/images';

const Header = (): JSX.Element => (
  <header className="flex items-center justify-between bg-white p-4 shadow-md">
    <Link href="/">
      <div className="flex items-center space-x-2">
        <Image src={Logo} alt="Logo" width={40} height={40} />
        <span className="text-xl font-bold text-gray-800">Zomujo</span>
      </div>
    </Link>
    <nav>
      <Link href="/login">
        <span className="text-primary mr-2 rounded-md px-4 py-2 hover:bg-gray-100">Login</span>
      </Link>
      <Link href="/sign-up">
        <span className="bg-primary rounded-md px-4 py-2 text-white hover:bg-gray-500">
          Sign Up
        </span>
      </Link>
    </nav>
  </header>
);

export default Header;
