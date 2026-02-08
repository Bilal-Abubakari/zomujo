import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill } from 'lucide-react';
import { IPrescription } from '@/types/medical.interface';

interface PrescriptionsCardProps {
  prescriptions: IPrescription[];
}

export const PrescriptionsCard = ({ prescriptions }: PrescriptionsCardProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between text-lg">
        <div className="flex items-center gap-2">
          <Pill className="text-primary h-5 w-5" />
          Medications / Prescriptions
        </div>
        {prescriptions && prescriptions.length > 0 && (
          <Badge variant="brown" className="px-2 py-1">
            {prescriptions.length} {prescriptions.length === 1 ? 'Drug' : 'Drugs'}
          </Badge>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent className="w-full">
      {prescriptions && prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map((p, index) => (
            <div key={`${index}-${p.name}`} className="rounded-md border bg-white p-3 shadow-sm">
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-gray-500">
                {p.doses} - {p.route} - {p.doseRegimen} for {p.numOfDays} days
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No prescriptions recorded</p>
      )}
    </CardContent>
  </Card>
);
