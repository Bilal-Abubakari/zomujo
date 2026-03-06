import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Microscope, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IRadiology } from '@/types/radiology.interface';

interface RadiologyTestsCardProps {
  radiology: IRadiology | undefined;
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
      {radiology && (
        <>
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
                    {radiology.tests.map((test, index) => (
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

          {radiology.fileUrls && radiology.fileUrls.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">
                Uploaded Results ({radiology.fileUrls.length})
              </h4>
              <div className="space-y-2">
                {radiology.fileUrls.map((fileUrl, index) => (
                  <div
                    key={`${index}-${fileUrl}`}
                    className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Radiology Result {index + 1}
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
        </>
      )}
    </CardContent>
  </Card>
);
