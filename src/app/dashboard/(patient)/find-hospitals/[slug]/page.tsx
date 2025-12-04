import React, { JSX } from 'react';
import HospitalDetail from './_components/hospitalDetail';

interface HospitalDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const HospitalDetailPage = async ({ params }: HospitalDetailPageProps): Promise<JSX.Element> => {
  const { slug } = await params;
  
  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-gray-600">Invalid hospital URL</p>
      </div>
    );
  }
  
  return <HospitalDetail slug={slug} />;
};

export default HospitalDetailPage;

