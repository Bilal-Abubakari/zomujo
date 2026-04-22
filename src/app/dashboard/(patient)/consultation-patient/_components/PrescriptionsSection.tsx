import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Pill } from 'lucide-react';
import { IConsultationDetails } from '@/types/consultation.interface';

interface PrescriptionsSectionProps {
  consultationDetails: IConsultationDetails | undefined;
}

export const PrescriptionsSection: React.FC<PrescriptionsSectionProps> = ({
  consultationDetails,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-xl font-semibold">
        <Pill className="text-primary" />
        Prescriptions
      </CardTitle>
    </CardHeader>
    <CardContent>
      {consultationDetails?.prescriptionUrl ? (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Your doctor has issued a prescription. Click the button below to view or download it.
          </p>
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary-light hover:text-primary"
            child={
              <a
                href={consultationDetails?.prescriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Prescription
              </a>
            }
          />
        </>
      ) : (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
          There is currently no prescription from the doctor. It is still being generated.
        </div>
      )}
    </CardContent>
  </Card>
);
