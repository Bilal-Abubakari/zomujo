import React, { JSX, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { FilePenLine } from 'lucide-react';

type CardFrameProps = {
  setEdit?: (edit: boolean) => void;
  title?: string;
  children: ReactNode;
  showEmptyResults: boolean;
  emptyResultsMessage?: string;
  customTitle?: ReactNode;
};
const CardFrame = ({
  title,
  setEdit,
  children,
  showEmptyResults,
  emptyResultsMessage,
  customTitle,
}: CardFrameProps): JSX.Element => (
  <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4">
    <div className="flex flex-row items-center justify-between">
      {customTitle ? customTitle : <p className="font-bold">{title}</p>}
      <Button
        variant="outline"
        onClick={() => setEdit && setEdit(true)}
        child={
          <>
            <FilePenLine />
            Edit
          </>
        }
      />
    </div>
    <hr className="my-4 border-gray-300" />
    {showEmptyResults && (
      <div className="flex h-40 items-center justify-center">
        {emptyResultsMessage ?? `No ${title?.toLowerCase()} information found`}
      </div>
    )}
    {children}
  </div>
);

export default CardFrame;
