import { JSX } from 'react';

const SkeletonDoctorPatientCard = (): JSX.Element => (
  <div className="group flex h-full w-62.5 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md">
    {/* Dominant image skeleton */}
    <div className="relative h-72 w-full animate-pulse bg-gray-300">
      {/* Availability pill placeholder */}
      <div className="absolute top-3 left-3 h-5 w-20 rounded-full bg-gray-400/50" />
      {/* Name overlay placeholder */}
      <div className="absolute inset-x-0 bottom-0 space-y-1.5 px-3.5 pb-3.5">
        <div className="h-4 w-32 rounded bg-gray-400/60" />
        <div className="h-3 w-24 rounded bg-gray-400/40" />
      </div>
    </div>

    {/* Compact info strip skeleton */}
    <div className="flex flex-col gap-3 p-3.5">
      {/* Stats row */}
      <div className="flex animate-pulse items-center gap-2">
        <div className="h-3 w-3 rounded bg-gray-300" />
        <div className="h-3 w-20 rounded bg-gray-300" />
        <div className="h-3 w-1 rounded bg-gray-200" />
        <div className="h-3 w-16 rounded bg-gray-300" />
      </div>

      {/* Next available pill */}
      <div className="flex animate-pulse items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
        <div className="h-3 w-3 rounded bg-gray-300" />
        <div className="flex-1 space-y-1">
          <div className="h-2 w-16 rounded bg-gray-300" />
          <div className="h-3 w-24 rounded bg-gray-300" />
        </div>
        <div className="h-3 w-12 rounded bg-gray-300" />
      </div>

      {/* Book button */}
      <div className="h-10 w-full animate-pulse rounded-xl bg-gray-300" />
    </div>
  </div>
);

export default SkeletonDoctorPatientCard;
