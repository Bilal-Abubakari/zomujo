'use client';

import { IReview } from '@/types/review.interface';
import { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { AvatarComp } from '@/components/ui/avatar';
import { isPatientReview } from './reviewTableCells';

interface ReviewDetailsProps {
  review: IReview;
}

export const ReviewDetails = ({ review }: ReviewDetailsProps): JSX.Element => {
  const { doctor, patient, rating, status, comment, communicationSkill, expertise } = review;

  const isPatient = isPatientReview(review);
  const user = isPatient && patient ? patient : doctor;
  const roleName = isPatient ? 'Patient' : 'Doctor';

  const statusMap: Record<
    string,
    { label: string; variant: 'default' | 'destructive' | 'brown' | 'outline' }
  > = {
    pending: { label: 'Pending', variant: 'brown' },
    skipped: { label: 'Hidden', variant: 'destructive' },
    completed: { label: 'Visible', variant: 'default' },
  };
  const statusConfig = statusMap[status.toLowerCase()] || { label: status, variant: 'outline' };

  const hasCommunicationSkills = communicationSkill && Object.keys(communicationSkill).length > 0;
  const hasExpertise = expertise && Object.keys(expertise).length > 0;

  const renderRatingBar = (label: string, value: number): JSX.Element => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{value}/5</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review Details</h2>
      </div>

      <div className="rounded-lg border bg-gray-50 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">User Information</h3>
        <div className="flex items-center gap-4">
          <AvatarComp
            imageSrc={user.profilePicture}
            name={`${user.firstName} ${user.lastName}`}
            className="h-16 w-16"
          />
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <Badge variant={isPatient ? 'default' : 'brown'}>{roleName}</Badge>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Overall Rating</h3>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">{rating}</span>
            <span className="text-2xl text-yellow-500">★</span>
            <span className="text-gray-500">/ 5</span>
          </div>
        </div>
        <div className="mt-2">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
      </div>

      {comment && (
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Comment</h3>
          <p className="whitespace-pre-wrap text-gray-700">{comment}</p>
        </div>
      )}

      {hasCommunicationSkills && (
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Communication Skills</h3>
          <div className="space-y-3">
            {renderRatingBar('Professional', communicationSkill.isProfessional)}
            {renderRatingBar('Clear Communication', communicationSkill.isClear)}
            {renderRatingBar('Attentive', communicationSkill.isAttentive)}
            {renderRatingBar('Comfortable', communicationSkill.isComfortable)}
          </div>
        </div>
      )}

      {hasExpertise && (
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Expertise</h3>
          <div className="space-y-3">
            {renderRatingBar('Knowledge', expertise.knowledge)}
            {renderRatingBar('Thorough', expertise.thorough)}
            {renderRatingBar('Confidence', expertise.confidence)}
            {renderRatingBar('Helpful', expertise.helpful)}
          </div>
        </div>
      )}
    </div>
  );
};
