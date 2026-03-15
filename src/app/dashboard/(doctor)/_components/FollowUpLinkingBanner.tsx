'use client';
import React, { JSX, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import {
  selectAppointmentLinkId,
  selectIsFollowUp,
} from '@/lib/features/appointments/appointmentSelector';
import { caseToSentence } from '@/lib/utils';
import { IAppointment } from '@/types/appointment.interface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  Eye,
  GitMerge,
  Link2,
  Link2Off,
  X,
} from 'lucide-react';
import moment from 'moment';
import ConsultationViewSheet from './ConsultationViewSheet';

interface FollowUpLinkingBannerProps {
  /** The linked appointment details – passed from parent once resolved */
  linkedAppointment?: IAppointment | null;
  onUnlink: () => Promise<void>;
  isUnlinking: boolean;
  /** When true the consultation is already completed — hide link/unlink actions */
  isConsultationCompleted?: boolean;
}

const FollowUpLinkingBanner = ({
  linkedAppointment,
  onUnlink,
  isUnlinking,
  isConsultationCompleted = false,
}: FollowUpLinkingBannerProps): JSX.Element | null => {
  const isFollowUp = useAppSelector(selectIsFollowUp);
  const appointmentLinkId = useAppSelector(selectAppointmentLinkId);

  const [showViewSheet, setShowViewSheet] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show if it's a follow-up and not dismissed
  if (!isFollowUp || isDismissed) {
    return null;
  }

  // Render the bottom status row without nested ternaries
  const renderLinkStatus = (): JSX.Element => {
    if (appointmentLinkId) {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-green-800">Linked to:</p>
              {linkedAppointment ? (
                <p className="truncate text-xs text-green-700">
                  {moment(linkedAppointment.slot.date).format('MMM DD, YYYY')} —{' '}
                  {caseToSentence(linkedAppointment.status, true)} · Dr.{' '}
                  {linkedAppointment.doctor.firstName} {linkedAppointment.doctor.lastName}
                </p>
              ) : (
                <p className="text-xs text-green-700">Past consultation</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowViewSheet(true)}
              size="sm"
              variant="outline"
              className="border-green-300 bg-white text-xs text-green-700 hover:bg-green-50"
              child={
                <>
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View Linked
                </>
              }
            />
            {/* Only allow unlinking when consultation is still active */}
            {!isConsultationCompleted && (
              <Button
                onClick={() => void onUnlink()}
                size="sm"
                variant="outline"
                isLoading={isUnlinking}
                disabled={isUnlinking}
                className="border-red-200 bg-white text-xs text-red-600 hover:bg-red-50"
                child={
                  <>
                    <Link2Off className="mr-1.5 h-3.5 w-3.5" />
                    Unlink
                  </>
                }
              />
            )}
          </div>
        </div>
      );
    }

    if (isConsultationCompleted) {
      return (
        <p className="text-xs text-amber-600">No past consultation was linked to this visit.</p>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-3 text-xs text-amber-700">
        <Link2 className="h-3.5 w-3.5 shrink-0" />
        <span>
          Use the <span className="font-semibold">&quot;My Consultations Only&quot;</span> filter in
          the timeline below to find and link a past consultation.
        </span>
        <span className="flex items-center gap-1 text-amber-500">
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          Scroll down
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="mb-6 overflow-hidden rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 via-orange-50 to-amber-50 shadow-sm">
        {/* Banner Header */}
        <div className="flex items-start gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <GitMerge className="h-4 w-4 text-amber-700" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-amber-900">
                {isConsultationCompleted
                  ? 'Patient suggested this was a follow-up visit'
                  : 'Patient suggests this is a follow-up visit'}
              </p>
              <Badge className="border-amber-300 bg-amber-100 text-xs text-amber-700">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Follow-Up
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-amber-700">
              {isConsultationCompleted
                ? 'This consultation was flagged as a follow-up by the patient.'
                : 'The patient indicated this consultation relates to a previous visit. Link it to a past consultation below for better continuity of care.'}
            </p>
          </div>

          {!isConsultationCompleted && (
            <button
              onClick={() => setIsDismissed(true)}
              className="ml-auto shrink-0 rounded-full p-1 text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Link status section */}
        <div className="border-t border-amber-200 bg-white/60 px-4 py-3 sm:px-5">
          {renderLinkStatus()}
        </div>
      </div>

      <ConsultationViewSheet
        open={showViewSheet}
        onOpenChange={setShowViewSheet}
        appointmentId={appointmentLinkId}
      />
    </>
  );
};

export default FollowUpLinkingBanner;
