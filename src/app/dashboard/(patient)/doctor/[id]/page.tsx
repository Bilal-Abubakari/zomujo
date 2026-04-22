import { Suspense, JSX } from 'react';
import DoctorProfileView from '@/components/doctor/DoctorProfileView';

export default async function Page({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>): Promise<JSX.Element> {
  const { id } = await params;
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DoctorProfileView doctorId={id} mode="dashboard" />
    </Suspense>
  );
}
