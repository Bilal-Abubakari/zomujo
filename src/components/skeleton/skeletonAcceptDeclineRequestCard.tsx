import React, { JSX } from 'react';

const SkeletonAcceptDeclineRequestCard = (): JSX.Element => {
  return (
    <div className="mx-auto mt-6 flex max-w-[249px] animate-pulse flex-col gap-4 rounded-2xl bg-gray-50 px-2.5 py-[18px]">
      <div className="flex w-full flex-row justify-between">
        <div className="flex flex-row items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gray-300"></div>
          <div className="flex h-full flex-col justify-between">
            <div className="h-4 w-[130px] rounded bg-gray-300"></div>
            <div className="h-4 w-[110px] rounded bg-gray-300"></div>
          </div>
        </div>
        <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-gray-200"></div>
      </div>
      <div className="flex flex-row justify-between text-xs font-medium">
        <div className="h-4 w-[80px] rounded bg-gray-300"></div>
        <div className="h-4 w-[50px] rounded bg-gray-300"></div>
      </div>
      <hr className="border-gray-200" />
      <div className="flex flex-col gap-2">
        <div className="h-4 w-16 rounded bg-gray-300"></div>
        <div className="h-4 w-full rounded bg-gray-300"></div>
        <div className="h-4 w-3/4 rounded bg-gray-300"></div>
      </div>
      <div className="flex flex-row gap-3">
        <div className="h-8 w-[145px] rounded bg-gray-300"></div>
        <div className="h-8 w-[68px] rounded bg-gray-300"></div>
      </div>
    </div>
  );
};

export default SkeletonAcceptDeclineRequestCard;
