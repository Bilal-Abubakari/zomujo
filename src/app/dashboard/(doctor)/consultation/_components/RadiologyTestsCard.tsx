import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Microscope } from 'lucide-react';
import { RadiologyCard } from '@/app/dashboard/(doctor)/consultation/_components/labCard';
import { IRadiology } from '@/types/radiology.interface';
import { RequestStatus } from '@/types/shared.enum';

interface RadiologyTestsCardProps {
  radiology: IRadiology | undefined;
  requestedRadiology: IRadiology | null;
  conductedRadiology: IRadiology | null;
}

export const RadiologyTestsCard = ({ radiology }: RadiologyTestsCardProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Microscope className="text-primary h-5 w-5" />
        Radiology Tests
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Requested Radiology */}
      {radiology && radiology.tests.some(({ fileUrl }) => !fileUrl) && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Requested Tests</h4>
          <div className="space-y-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-700">Procedure Request:</span>
                <p className="text-sm text-gray-900">{radiology.procedureRequest}</p>
              </div>
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-700">History/Symptoms:</span>
                <p className="text-sm text-gray-900">{radiology.history}</p>
              </div>
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-700">Tests:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {radiology.tests
                    .filter(({ fileUrl }) => !fileUrl)
                    .map((test, index) => (
                      <Badge
                        key={`${index}-${test.testName}`}
                        variant="secondary"
                        className="text-xs"
                      >
                        {test.testName}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conducted Radiology */}
      {radiology && radiology.tests.some(({ fileUrl }) => fileUrl) && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Completed Tests</h4>
          <div className="space-y-2">
            {radiology.tests
              .filter(({ fileUrl }) => fileUrl)
              .map((test, index) => (
                <RadiologyCard
                  key={`${index}-${test.testName}`}
                  testName={test.testName}
                  fileUrl={test.fileUrl || null}
                  status={RequestStatus.Completed}
                  date={radiology.createdAt}
                  additionalInfo={`${radiology.procedureRequest} | ${radiology.history}`}
                />
              ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);
