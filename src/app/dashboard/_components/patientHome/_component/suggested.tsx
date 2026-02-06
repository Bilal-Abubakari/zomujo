import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { JSX, ReactNode } from 'react';

type SuggestedProps = {
  title: string;
  children: ReactNode;
  showViewAll?: boolean;
  link?: string;
};

export const Suggested = ({
  title,
  children,
  showViewAll = true,
  link = '/',
}: SuggestedProps): JSX.Element => (
  <div className="flex w-full flex-col gap-6 max-md:mt-10">
    {(title || showViewAll) && (
      <div className="flex flex-row items-center justify-between">
        {title && <p className="text-xl leading-5 font-bold">{title}</p>}
        {showViewAll && (
          <Link href={link} className="flex flex-row items-center text-sm">
            View All <ChevronRight size={16} />
          </Link>
        )}
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 px-0 sm:px-[6px] justify-items-stretch sm:justify-items-start w-full">
      {children}
    </div>
  </div>
);
