import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTubeDiagonal } from 'lucide-react';
import { LabCard } from '@/app/dashboard/(doctor)/consultation/_components/labCard';
import { ILaboratoryRequest } from '@/types/labs.interface';

interface LabTestsCardProps {
  requestedLabs: ILaboratoryRequest[] | undefined;
  conductedLabs: ILaboratoryRequest[] | undefined;
}

export const LabTestsCard = ({ requestedLabs, conductedLabs }: LabTestsCardProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <TestTubeDiagonal className="text-primary h-5 w-5" />
        Laboratory Tests
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Requested Labs */}
      {requestedLabs && requestedLabs.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Requested Tests</h4>
          <div className="space-y-2">
            {requestedLabs.map(({ testName, notes, fasting, specimen, id }) => (
              <div key={id} className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="mb-1 font-medium text-gray-900">{testName}</div>
                {notes && <p className="mb-2 text-xs text-gray-600">{notes}</p>}
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>Specimen: {specimen}</span>
                  <Badge variant={fasting ? 'default' : 'secondary'} className="text-xs">
                    Fasting: {fasting ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conducted Labs */}
      {conductedLabs && conductedLabs.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Completed Tests</h4>
          <div className="space-y-2">
            {conductedLabs.map(({ testName, id, fileUrl, status, notes }) => (
              <LabCard
                key={id}
                testName={testName}
                fileUrl={fileUrl || null}
                status={status}
                date={''}
                notes={notes}
              />
            ))}
          </div>
        </div>
      )}

      {(!requestedLabs || requestedLabs.length === 0) &&
        (!conductedLabs || conductedLabs.length === 0) && (
          <p className="text-sm text-gray-500">No laboratory tests recorded</p>
        )}
    </CardContent>
  </Card>
);
