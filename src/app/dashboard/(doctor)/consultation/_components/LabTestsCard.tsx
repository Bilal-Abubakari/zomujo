import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTubeDiagonal } from 'lucide-react';
import { ILaboratoryRequest } from '@/types/labs.interface';

interface LabTestsCardProps {
  requestedLabs: ILaboratoryRequest[] | undefined;
  conductedLabs: ILaboratoryRequest[] | undefined;
  instruction?: string;
  clinicalHistory?: string;
}

export const LabTestsCard = ({
  requestedLabs,
  conductedLabs,
  clinicalHistory,
  instruction,
}: LabTestsCardProps): JSX.Element => {
  // Group requested labs by categoryType
  const groupedRequestedLabs =
    requestedLabs?.reduce(
      (acc, lab) => {
        if (!acc[lab.categoryType]) {
          acc[lab.categoryType] = [];
        }
        acc[lab.categoryType].push(lab);
        return acc;
      },
      {} as Record<string, ILaboratoryRequest[]>,
    ) || {};

  // Group conducted labs by categoryType
  const groupedConductedLabs =
    conductedLabs?.reduce(
      (acc, lab) => {
        if (!acc[lab.categoryType]) {
          acc[lab.categoryType] = [];
        }
        acc[lab.categoryType].push(lab);
        return acc;
      },
      {} as Record<string, ILaboratoryRequest[]>,
    ) || {};

  const allCategories = new Set([
    ...Object.keys(groupedRequestedLabs),
    ...Object.keys(groupedConductedLabs),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TestTubeDiagonal className="text-primary h-5 w-5" />
          Laboratory Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {clinicalHistory && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Clinical History</h4>
            <p className="text-sm text-gray-600">{clinicalHistory}</p>
          </div>
        )}
        {instruction && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Instructions</h4>
            <p className="text-sm text-gray-600">{instruction}</p>
          </div>
        )}
        {Array.from(allCategories).map((category) => (
          <div key={category}>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">{category}</h4>
            <div className="flex items-center gap-2">
              {/* Requested Labs for this category */}
              {groupedRequestedLabs[category]?.map(({ testName, id }) => (
                <div key={`req-${id}`} className="flex">
                  <Badge variant="secondary" className="text-xs">
                    {testName}
                  </Badge>
                </div>
              ))}
              {/* Conducted Labs for this category */}
              {groupedConductedLabs[category]?.map(({ testName, id, fileUrl, status }) => (
                <div key={`cond-${id}`} className="space-y-1">
                  <Badge variant="default" className="text-xs">
                    {testName}
                  </Badge>
                  <div className="ml-2 text-xs text-gray-600">
                    Status: {status}
                    {fileUrl && <div>File: Available</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {allCategories.size === 0 && (
          <p className="text-sm text-gray-500">No laboratory tests recorded</p>
        )}
      </CardContent>
    </Card>
  );
};
