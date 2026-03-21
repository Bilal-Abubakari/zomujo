import React, { JSX, Suspense } from 'react';
import DoctorProfileView from '@/components/doctor/DoctorProfileView';

export default async function PublicDoctorPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>): Promise<JSX.Element> {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-t-primary h-10 w-10 animate-spin rounded-full border-4 border-gray-200" />
        </div>
      }
    >
      <DoctorProfileView doctorId={id} mode="public" />;
    </Suspense>
  );
}
