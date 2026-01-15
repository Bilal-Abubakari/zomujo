import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill } from 'lucide-react';
import { DiagnosesList } from '@/app/dashboard/(doctor)/consultation/_components/ConditionCard';
import { IDiagnosis } from '@/types/medical.interface';

interface DiagnosisCardProps {
  diagnoses: IDiagnosis[];
  doctorName: string;
}

export const DiagnosisCard = ({ diagnoses, doctorName }: DiagnosisCardProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between text-lg">
        <div className="flex items-center gap-2">
          <Pill className="text-primary h-5 w-5" />
          Diagnosis & Treatment Plan
        </div>
        {diagnoses.length > 0 && (
          <Badge variant="brown" className="px-2 py-1">
            {diagnoses.length} {diagnoses.length === 1 ? 'Diagnosis' : 'Diagnoses'}
          </Badge>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent className="w-full">
      {diagnoses && diagnoses.length > 0 ? (
        <DiagnosesList
          className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1"
          doctorName={doctorName}
          conditions={diagnoses}
        />
      ) : (
        <p className="text-sm text-gray-500">No diagnosis recorded</p>
      )}
    </CardContent>
  </Card>
);
