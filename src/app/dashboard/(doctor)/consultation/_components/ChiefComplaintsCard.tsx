import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope } from 'lucide-react';
import { IAppointment } from '@/types/appointment.interface';

interface ChiefComplaintsCardProps {
  complaints: string[] | undefined;
  appointment: IAppointment | null | undefined;
}

export const ChiefComplaintsCard = ({
  complaints,
  appointment,
}: ChiefComplaintsCardProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Stethoscope className="text-primary h-5 w-5" />
        Chief Complaints
      </CardTitle>
    </CardHeader>
    <CardContent>
      {complaints && complaints.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {complaints.map((complaint) => (
            <Badge key={complaint} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
              {complaint}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No complaints recorded</p>
      )}
      {appointment?.symptoms?.complaints && appointment.symptoms.complaints.length > 0 && (
        <div className="mt-4 space-y-1 rounded-md bg-gray-50 p-3">
          <span className="text-sm font-medium text-gray-700">Durations:</span>
          {appointment.symptoms.complaints.map(({ complaint, duration }) => (
            <div key={complaint} className="text-xs text-gray-600">
              <span className="font-semibold">{complaint}:</span> {duration.value} {duration.type}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
