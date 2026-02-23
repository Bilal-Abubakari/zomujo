import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from 'lucide-react';
import { IMedicine, IMedicineWithoutId } from '@/types/medical.interface';

interface MedicationsTakenCardProps {
  medicinesTaken: IMedicine[] | IMedicineWithoutId[] | undefined;
}

export const MedicationsTakenCard = ({
  medicinesTaken,
}: MedicationsTakenCardProps): JSX.Element | null => {
  if (!medicinesTaken || medicinesTaken.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Pill className="text-primary h-5 w-5" />
          Medications Previously Taken
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {medicinesTaken.map((medicine, index) => (
            <div
              key={`${index}-${medicine.name}`}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3"
            >
              <div>
                <div className="font-medium text-gray-900">{medicine.name}</div>
                <div className="text-sm text-gray-500">Dose: {medicine.dose}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
