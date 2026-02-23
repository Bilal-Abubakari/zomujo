import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { JSX, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SuggestedProps = {
  title?: string;
  children: ReactNode;
  showViewAll?: boolean;
  link?: string;
  className?: string;
  childrenWrapperClassName?: string;
};

export const Suggested = ({
  title,
  children,
  showViewAll = true,
  link = '/',
  className,
  childrenWrapperClassName,
}: SuggestedProps): JSX.Element => (
  <div className={cn('flex w-full flex-col gap-6 max-md:mt-10', className)}>
    <div className="flex flex-row items-center justify-between">
      {title && <p className="text-xl leading-5 font-bold">{title}</p>}
      {showViewAll && (
        <Link href={link} className="flex flex-row items-center text-sm">
          View All <ChevronRight size={16} />
        </Link>
      )}
    </div>
    <div
      className={cn(
        'flex flex-row flex-wrap items-center justify-items-center gap-6',
        childrenWrapperClassName,
      )}
    >
      {children}
    </div>
  </div>
);
