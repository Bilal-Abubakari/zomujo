import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { SECTIONS, parseInitialNotes } from '@/constants/historyNotes.constant';
import { IConsultationDetails } from '@/types/consultation.interface';

interface HistoryNotesSectionProps {
  consultationDetails: IConsultationDetails | undefined;
}

export const HistoryNotesSection: React.FC<HistoryNotesSectionProps> = ({
  consultationDetails,
}) => {
  const parsedHistoryNotes = parseInitialNotes(consultationDetails?.historyNotes);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <ClipboardList className="text-primary" />
          History Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {SECTIONS.some((section) => parsedHistoryNotes[section.key].trim()) ? (
          SECTIONS.filter((section) => parsedHistoryNotes[section.key].trim()).map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.key}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="text-primary h-5 w-5" />
                  <h3 className="text-base font-semibold text-gray-800">{section.label}</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap text-gray-600">
                  {parsedHistoryNotes[section.key]}
                </p>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
            There are currently no history notes from the doctor.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
