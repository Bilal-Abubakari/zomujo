import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TestTubeDiagonal, FileText, CheckCircle2 } from 'lucide-react';
import { ILaboratoryRequest } from '@/types/labs.interface';

interface LabTestsCardProps {
  requestedLabs: ILaboratoryRequest[] | undefined;
  instruction?: string;
  clinicalHistory?: string;
  uploadedFiles?: string[];
}

export const LabTestsCard = ({
  requestedLabs,
  clinicalHistory,
  instruction,
  uploadedFiles,
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

  const allCategories = Object.keys(groupedRequestedLabs);

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
        {allCategories.length > 0 && (
          <>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Requested Tests</h4>
            {allCategories.map((category) => (
              <div key={category}>
                <p className="mb-2 text-xs font-medium text-gray-600">{category}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {groupedRequestedLabs[category]?.map(({ testName, id }) => (
                    <Badge key={`req-${id}`} variant="secondary" className="text-xs">
                      {testName}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {uploadedFiles && uploadedFiles.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Uploaded Results ({uploadedFiles.length})
            </h4>
            <div className="space-y-2">
              {uploadedFiles.map((fileUrl, index) => (
                <div
                  key={`${index}-${fileUrl}`}
                  className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Lab Result {index + 1}
                    </span>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    child={
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        View
                      </a>
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {allCategories.length === 0 && (
          <p className="text-sm text-gray-500">No laboratory tests recorded</p>
        )}
      </CardContent>
    </Card>
  );
};
