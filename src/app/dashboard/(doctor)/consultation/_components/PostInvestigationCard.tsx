import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical } from 'lucide-react';
import { IPostInvestigationData } from '@/types/appointment.interface';

interface PostInvestigationCardProps {
  postInvestigationData: IPostInvestigationData;
}

const FIELD_LABELS: Record<keyof IPostInvestigationData, string> = {
  historyOfPresentingComplaints: 'History of Presenting Complaints',
  assessmentImpression: 'Assessment / Impression',
  addendum: 'Addendum',
};

const PostInvestigationCard = ({
  postInvestigationData,
}: PostInvestigationCardProps): JSX.Element => {
  const sections = (
    Object.entries(postInvestigationData) as [keyof IPostInvestigationData, string][]
  ).filter(([, value]) => value && value.trim() !== '');

  if (sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Post-Investigation Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No post-investigation notes available.</p>
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
              <FlaskConical className="h-4 w-4 text-amber-500" />
              {FIELD_LABELS[key]}
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

export { PostInvestigationCard };
