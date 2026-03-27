'use client';

import React, { JSX, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Share2,
  Building2,
  Trash2,
  UserCheck,
  ExternalLink,
  Loader2,
  User,
  Mail,
  MessageSquare,
  FileText,
} from 'lucide-react';
import {
  IReferral,
  IExternalReferralRequest,
  IInternalReferralResponse,
} from '@/types/consultation.interface';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IDoctor } from '@/types/doctor.interface';
import { useAppDispatch } from '@/lib/hooks';
import { doctorInfo } from '@/lib/features/doctors/doctorsThunk';
import { generateExternalReferralPdf } from '@/lib/features/appointments/consultation/consultationThunk';
import { showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';

// ── Internal Referral Item ─────────────────────────────────────────────────

interface InternalReferralItemProps {
  doctorId?: string;
  doctor?: IDoctor;
  notes?: string;
  isNew?: boolean;
  onRemove?: () => void;
}

const InternalReferralItem = ({
  doctorId,
  doctor: doctorProp,
  notes,
  isNew,
  onRemove,
}: InternalReferralItemProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [doctor, setDoctor] = useState<IDoctor | null>(doctorProp ?? null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (doctorProp) {
      setDoctor(doctorProp);
      return;
    }
    if (!doctorId) {
      return;
    }

    const fetchDoctor = async (): Promise<void> => {
      setIsLoading(true);
      const payload = await dispatch(doctorInfo(doctorId)).unwrap();
      if (!showErrorToast(payload)) {
        setDoctor(payload as IDoctor);
      }
      setIsLoading(false);
    };
    void fetchDoctor();
  }, [doctorId, doctorProp, dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-100">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-36 animate-pulse rounded bg-blue-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-blue-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 border border-blue-200 shadow-sm">
            <AvatarImage src={doctor?.profilePicture || ''} className="object-cover" />
            <AvatarFallback className="bg-blue-100 text-sm font-bold text-blue-700">
              {doctor ? `${doctor.firstName[0]}${doctor.lastName[0]}` : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor'}
            </p>
            <p className="truncate text-xs text-gray-500">
              {doctor?.specializations?.[0] || 'General Practitioner'} · Zomujo Platform
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isNew && (
            <Badge className="border-emerald-200 bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">
              NEW
            </Badge>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-7 w-7 p-0 text-red-400 hover:bg-red-50 hover:text-red-600"
              child={<Trash2 size={13} />}
            />
          )}
        </div>
      </div>
      {notes && (
        <p className="mt-2.5 border-t border-blue-100 pt-2.5 text-xs leading-relaxed text-gray-600 italic">
          &quot;{notes}&quot;
        </p>
      )}
    </div>
  );
};

// ── External Referral Item ─────────────────────────────────────────────────

interface ExternalReferralItemProps {
  facility?: string;
  doctorName?: string;
  email?: string;
  notes?: string;
  isNew?: boolean;
  onRemove?: () => void;
  appointmentId?: string;
}

const ExternalReferralItem = ({
  facility,
  doctorName,
  email,
  notes,
  isNew,
  onRemove,
  appointmentId,
}: ExternalReferralItemProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handlePreviewLetter = async (): Promise<void> => {
    if (!appointmentId) {
      return;
    }
    setIsPreviewing(true);
    const payload = await dispatch(generateExternalReferralPdf(appointmentId)).unwrap();
    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setIsPreviewing(false);
      return;
    }
    window.open(payload as string, '_blank');
    setIsPreviewing(false);
  };

  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-100">
            <Building2 className="h-4 w-4 text-amber-700" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {doctorName || 'External Doctor'}
            </p>
            {facility && (
              <div className="mt-0.5 flex items-center gap-1">
                <Building2 className="h-3 w-3 shrink-0 text-amber-600" />
                <p className="truncate text-xs text-gray-500">{facility}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isNew && (
            <Badge className="border-emerald-200 bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">
              NEW
            </Badge>
          )}
          {appointmentId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handlePreviewLetter()}
              disabled={isPreviewing}
              isLoading={isPreviewing}
              className="h-7 gap-1 border-amber-200 px-2 text-[11px] text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              child={
                <>
                  {!isPreviewing && <FileText size={12} />}
                  Preview Letter
                </>
              }
            />
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-7 w-7 p-0 text-red-400 hover:bg-red-50 hover:text-red-600"
              child={<Trash2 size={13} />}
            />
          )}
        </div>
      </div>
      <div className="mt-2.5 space-y-1.5">
        {email && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Mail className="h-3 w-3 shrink-0" />
            <span>{email}</span>
          </div>
        )}
        {notes && (
          <div className="flex items-start gap-1.5 border-t border-amber-100 pt-2 text-xs text-gray-600 italic">
            <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
            <span>&quot;{notes}&quot;</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main ReferralsCard ─────────────────────────────────────────────────────

export interface ReferralsCardProps {
  /** Referrals added locally this session (optimistic, pre-refetch) */
  referrals: IReferral[];
  onRemove?: (index: number) => void;
  /** Saved external referral from appointment.referralData */
  savedExternalReferral?: IExternalReferralRequest | null;
  /** Saved internal referral from appointment.referral */
  savedInternalReferral?: IInternalReferralResponse | null;
}

const isSameExternalReferral = (r: IReferral, saved: IExternalReferralRequest): boolean => {
  if (r.email && saved.email) {
    return r.email === saved.email;
  }
  return r.facility === saved.facility && r.doctorName === saved.doctorName;
};

export const ReferralsCard = ({
  referrals,
  onRemove,
  savedExternalReferral,
  savedInternalReferral,
}: ReferralsCardProps): JSX.Element => {
  const hasInternalSaved = !!savedInternalReferral;
  const hasExternalSaved = !!savedExternalReferral;

  const internalReferrals = referrals
    .filter((r) => r.type === 'internal')
    .filter((r) => !hasInternalSaved || r.doctorId !== savedInternalReferral.referredDoctorId)
    .filter(
      (r, index, arr) =>
        !r.doctorId || arr.findIndex((other) => other.doctorId === r.doctorId) === index,
    );

  const externalReferrals = referrals
    .filter((r) => r.type === 'external')
    .filter((r) => !hasExternalSaved || !isSameExternalReferral(r, savedExternalReferral))
    .filter(
      (r, index, arr) =>
        arr.findIndex((other) => {
          if (r.email && other.email) {
            return r.email === other.email;
          }
          return r.facility === other.facility && r.doctorName === other.doctorName;
        }) === index,
    );

  const totalCount =
    internalReferrals.length +
    externalReferrals.length +
    (hasInternalSaved ? 1 : 0) +
    (hasExternalSaved ? 1 : 0);

  const hasAny = totalCount > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Share2 className="text-primary h-5 w-5" />
            Referrals
          </div>
          {hasAny && (
            <Badge variant="secondary" className="px-2 py-1">
              {totalCount} {totalCount === 1 ? 'Referral' : 'Referrals'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full space-y-5">
        {/* ── Internal Referrals Section ── */}
        {(internalReferrals.length > 0 || hasInternalSaved) && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pb-1">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                Internal Referrals · Zomujo Platform
              </span>
            </div>
            {hasInternalSaved && (
              <InternalReferralItem
                doctorId={savedInternalReferral.referredDoctorId}
                notes={savedInternalReferral.letter}
              />
            )}
            {internalReferrals.map((referral) => {
              const originalIndex = referrals.indexOf(referral);
              const handleRemove = onRemove ? (): void => onRemove(originalIndex) : undefined;
              return (
                <InternalReferralItem
                  key={referral.doctorId ?? referral.id ?? originalIndex}
                  doctorId={referral.doctorId}
                  doctor={referral.doctor}
                  notes={referral.notes}
                  isNew={true}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>
        )}

        {/* ── External Referrals Section ── */}
        {(externalReferrals.length > 0 || hasExternalSaved) && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pb-1">
              <ExternalLink className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
                External Referrals
              </span>
            </div>
            {hasExternalSaved && (
              <ExternalReferralItem
                facility={savedExternalReferral.facility}
                doctorName={savedExternalReferral.doctorName}
                email={savedExternalReferral.email}
                notes={savedExternalReferral.notes}
                appointmentId={savedExternalReferral.appointmentId}
              />
            )}
            {externalReferrals.map((referral) => {
              const originalIndex = referrals.indexOf(referral);
              const handleRemove = onRemove ? (): void => onRemove(originalIndex) : undefined;
              return (
                <ExternalReferralItem
                  key={referral.id ?? referral.facility ?? originalIndex}
                  facility={referral.facility}
                  doctorName={referral.doctorName}
                  email={referral.email}
                  notes={referral.notes}
                  isNew={true}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>
        )}

        {!hasAny && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No referrals added yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Use the &quot;Add Referral&quot; button to refer this patient
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
