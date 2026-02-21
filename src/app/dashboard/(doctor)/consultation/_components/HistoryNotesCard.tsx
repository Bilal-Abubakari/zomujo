import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface HistoryNotesCardProps {
  historyNotes: string;
}

const HistoryNotesCard = ({ historyNotes }: HistoryNotesCardProps): JSX.Element => {
  let parsedNotes: Record<string, string> = {};

  try {
    parsedNotes = JSON.parse(historyNotes);
  } catch {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            History of Present Illness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap text-gray-700">{historyNotes}</p>
        </CardContent>
      </Card>
    );
  }

  const sections = Object.entries(parsedNotes).filter(([, value]) => value && value.trim() !== '');

  if (sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            History of Present Illness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No history notes available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map(([key, value]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              {key.replaceAll(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-gray-700">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export { HistoryNotesCard };
