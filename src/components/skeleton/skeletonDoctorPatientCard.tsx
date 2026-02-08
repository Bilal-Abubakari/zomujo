import { JSX } from 'react';

const SkeletonDoctorPatientCard = (): JSX.Element => (
  <div className="group flex h-full w-62.5 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
    {/* Image Section Skeleton */}
    <div className="relative h-40 w-full animate-pulse bg-gray-300"></div>

    {/* Information Section Skeleton */}
    <div className="flex flex-1 flex-col p-4">
      {/* Doctor Name and Specialty Skeleton */}
      <div className="mb-3 animate-pulse">
        <div className="mb-2 h-6 w-32 rounded bg-gray-300"></div>
        <div className="h-4 w-24 rounded bg-gray-300"></div>
      </div>

      {/* Experience Line Skeleton */}
      <div className="mb-3 flex animate-pulse items-center gap-2">
        <div className="h-4 w-4 rounded bg-gray-300"></div>
        <div className="h-4 w-20 rounded bg-gray-300"></div>
      </div>

      {/* Price Line Skeleton */}
      <div className="mb-3 flex animate-pulse items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
        <div className="h-4 w-16 rounded bg-gray-300"></div>
      </div>

      {/* Next Available Skeleton */}
      <div className="mb-4 flex animate-pulse items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
        <div className="h-4 w-4 rounded bg-gray-300"></div>
        <div className="flex-1">
          <div className="mb-1 h-3 w-20 rounded bg-gray-300"></div>
          <div className="h-4 w-24 rounded bg-gray-300"></div>
        </div>
      </div>

      {/* Book Appointment Button Skeleton */}
      <div className="mt-auto h-10 w-full animate-pulse rounded-md bg-gray-300"></div>
    </div>
  </div>
);

export default SkeletonDoctorPatientCard;
