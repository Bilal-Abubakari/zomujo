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
  plan: 'Plan',
};

const PostInvestigationCard = ({
  postInvestigationData,
}: PostInvestigationCardProps): JSX.Element => {
  const sections = (
    Object.entries(postInvestigationData) as [keyof IPostInvestigationData, string][]
  ).filter(([, value]) => value && value.trim() !== '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          Post-Investigation Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <p className="text-sm text-gray-500">No post-investigation notes available.</p>
        ) : (
          <div className="space-y-4">
            {sections.map(([key, value]) => (
              <div key={key} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h4 className="mb-2 text-sm font-semibold text-gray-800">{FIELD_LABELS[key]}</h4>
                <p className="text-sm whitespace-pre-wrap text-gray-700">{value}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { PostInvestigationCard };
