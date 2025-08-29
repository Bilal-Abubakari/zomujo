import Link from 'next/link';
import { JSX } from 'react';

export const Navigation = (): JSX.Element => (
  <nav>
    <Link href="/login">
      <span className="mr-2 cursor-pointer rounded-md px-4 py-2 text-white hover:bg-gray-100">
        Login
      </span>
    </Link>
    <Link href="/sign-up">
      <span className="bg-primary rounded-md px-4 py-2 text-white hover:bg-gray-500">Sign Up</span>
    </Link>
  </nav>
);
