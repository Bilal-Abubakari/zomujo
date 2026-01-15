import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, Info } from 'lucide-react';
import { TooltipComp } from '@/components/ui/tooltip';
import { SymptomsType } from '@/types/consultation.interface';
import { capitalize } from '@/lib/utils';

interface SymptomsCardProps {
  symptoms:
    | {
        [key in SymptomsType]?: Array<{ name: string; notes?: string }>;
      }
    | undefined;
}

export const SymptomsCard = ({ symptoms }: SymptomsCardProps): JSX.Element => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ActivitySquare className="text-primary h-5 w-5" />
          Symptoms by System
        </CardTitle>
      </CardHeader>
      <CardContent>
        {symptoms && Object.keys(symptoms).length > 0 ? (
          <div className="space-y-4">
            {Object.keys(symptoms).map((key) => {
              const symptomType = key as SymptomsType;
              const symptomList = symptoms[symptomType];
              if (!symptomList || symptomList.length === 0) {
                return null;
              }

              return (
                <div key={key} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold text-gray-800">
                    {capitalize(symptomType)} System
                  </h3>
                  <ul className="space-y-1.5">
                    {symptomList.map(({ name, notes }) => (
                      <li key={name} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                        <span>{name}</span>
                        {notes && (
                          <TooltipComp tip={notes}>
                            <Info size={14} className="text-gray-400" />
                          </TooltipComp>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No symptoms recorded</p>
        )}
      </CardContent>
    </Card>
  );

