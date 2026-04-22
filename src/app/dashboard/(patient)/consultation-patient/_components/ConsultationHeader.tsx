import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { getFormattedDate, getTimeFromDateStamp } from '@/lib/date';
import { StatusBadge } from '@/components/ui/statusBadge';
import { IConsultationDetails } from '@/types/consultation.interface';

interface ConsultationHeaderProps {
  consultationDetails: IConsultationDetails | undefined;
}

export const ConsultationHeader: React.FC<ConsultationHeaderProps> = ({ consultationDetails }) => (
  <Card className="overflow-hidden">
    <CardHeader className="bg-gray-50 p-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <CardTitle className="text-primary text-2xl font-bold">Consultation Details</CardTitle>
          <p className="text-gray-500">
            With {consultationDetails?.doctor.lastName} {consultationDetails?.doctor.firstName} on{' '}
            {getFormattedDate(consultationDetails?.slot.date ?? '')} at{' '}
            {getTimeFromDateStamp(consultationDetails?.slot.startTime ?? '')}
          </p>
        </div>
        {consultationDetails?.status && (
          <StatusBadge approvedTitle="Completed" status={consultationDetails.status} />
        )}
      </div>
    </CardHeader>
  </Card>
);
