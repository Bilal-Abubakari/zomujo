import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { JSX, ReactNode } from "react";

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
    <div className="flex flex-row items-center justify-between">
      <p className="text-xl leading-5 font-bold">{title}</p>
      {showViewAll && (
        <Link href={link} className="flex flex-row items-center text-sm">
          View All <ChevronRight size={16} />
        </Link>
      )}
    </div>
    <div className="flex-row flex-wrap gap-6 md:flex">{children}</div>
  </div>
);
