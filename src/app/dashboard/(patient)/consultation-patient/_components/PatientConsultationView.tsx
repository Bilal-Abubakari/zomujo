'use client';

import React, { JSX, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleProvider } from '@/app/dashboard/_components/providers/roleProvider';
import { Role } from '@/types/shared.enum';
import { IConsultationDetails } from '@/types/consultation.interface';
import { useAppDispatch } from '@/lib/hooks';
import { showReviewModal } from '@/lib/features/appointments/appointmentsSlice';
import {
  downloadLabRequestPdf,
  downloadRadiologyRequestPdf,
  downloadReferralLetter,
  getConsultationDetail,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import useWebSocket from '@/hooks/useWebSocket';
import {
  INotification,
  NotificationEvent,
  NotificationTopic,
} from '@/types/notification.interface';
import { downloadBlob, showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';
import { ConsultationHeader } from './ConsultationHeader';
import { HistoryNotesSection } from './HistoryNotesSection';
import { PrescriptionsSection } from './PrescriptionsSection';
import { LabRequestsSection } from './LabRequestsSection';
import { RadiologyRequestsSection } from './RadiologyRequestsSection';
import { Separator } from '@radix-ui/react-menu';

const notificationsToRefetch = new Set<NotificationTopic>([
  NotificationTopic.LabRequest,
  NotificationTopic.PrescriptionGenerated,
  NotificationTopic.RadiologyRequest,
  NotificationTopic.ConsultationUpdate,
]);

const PatientConsultationView = (): JSX.Element => {
  const { on } = useWebSocket();
  const endRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const [consultationDetails, setConsultationDetails] = useState<IConsultationDetails>();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [downloadingLabRequest, setDownloadingLabRequest] = useState(false);
  const [downloadingRadiologyRequest, setDownloadingRadiologyRequest] = useState(false);
  const [downloadingReferral, setDownloadingReferral] = useState<string | null>(null);

  const handleDownloadLabRequest = async (): Promise<void> => {
    const consultationId = params.consultationId as string;
    if (!consultationId) {
      return;
    }

    setDownloadingLabRequest(true);
    const payload = await dispatch(downloadLabRequestPdf(consultationId)).unwrap();

    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setDownloadingLabRequest(false);
      return;
    }
    downloadBlob(payload as Blob, `lab-request-${consultationId}.pdf`);

    setDownloadingLabRequest(false);
  };

  const handleDownloadRadiologyRequest = async (): Promise<void> => {
    const consultationId = params.consultationId as string;
    if (!consultationId) {
      return;
    }

    setDownloadingRadiologyRequest(true);
    const payload = await dispatch(downloadRadiologyRequestPdf(consultationId)).unwrap();

    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setDownloadingRadiologyRequest(false);
      return;
    }
    downloadBlob(payload as Blob, `radiology-request-${consultationId}.pdf`);

    setDownloadingRadiologyRequest(false);
  };

  const handleDownloadReferral = async (referralId: string, doctorName: string): Promise<void> => {
    const consultationId = params.consultationId as string;
    if (!consultationId || !referralId) {
      return;
    }

    setDownloadingReferral(referralId);
    const payload = await dispatch(
      downloadReferralLetter({ appointmentId: consultationId, referralId }),
    ).unwrap();

    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setDownloadingReferral(null);
      return;
    }
    downloadBlob(payload as Blob, `referral-letter-${doctorName}.pdf`);
    setDownloadingReferral(null);
  };

  const fetchConsultation = async (scroll = false): Promise<void> => {
    setLoading(true);
    const consultationId = params.consultationId as string;
    if (!consultationId) {
      setLoading(false);
      return;
    }
    const { payload } = await dispatch(getConsultationDetail(consultationId));
    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setLoading(false);
      return;
    }
    setConsultationDetails(payload as IConsultationDetails);
    setLoading(false);

    if (scroll) {
      requestAnimationFrame(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  };

  on(NotificationEvent.NewNotification, (data: unknown) => {
    const { payload } = data as INotification;
    if (notificationsToRefetch.has(payload.topic)) {
      const shouldScroll = payload.topic !== NotificationTopic.PrescriptionGenerated;
      void fetchConsultation(shouldScroll);

      if (payload.topic === NotificationTopic.ConsultationUpdate) {
        const appointmentId = params.consultationId as string;
        if (appointmentId) {
          dispatch(showReviewModal({ appointmentId }));
        }
      }
    }
  });

  useEffect(() => {
    void fetchConsultation();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-8">
        {/* Skeleton for Consultation Details */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Skeleton className="mb-2 h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skeleton for Prescriptions */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-4 w-64" />
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>

        {/* Skeleton for Lab Requests */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="mb-1 h-3 w-40" />
                  <Skeleton className="mb-2 h-3 w-56" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Separator className="mt-6" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skeleton for Radiology Requests */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="mb-1 h-3 w-40" />
              <Skeleton className="mb-2 h-3 w-56" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleProvider role={Role.Patient}>
      <div className="space-y-8 p-4 md:p-8">
        <ConsultationHeader consultationDetails={consultationDetails} />

        <HistoryNotesSection consultationDetails={consultationDetails} />

        <PrescriptionsSection consultationDetails={consultationDetails} />

        <LabRequestsSection
          consultationDetails={consultationDetails}
          onDownloadRequest={handleDownloadLabRequest}
          downloadingRequest={downloadingLabRequest}
        />

        {/* Radiology Requests Section */}
        <RadiologyRequestsSection
          consultationDetails={consultationDetails}
          onDownloadRequest={handleDownloadRadiologyRequest}
          downloadingRequest={downloadingRadiologyRequest}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <FileText className="text-primary" />
                Referrals
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {consultationDetails?.referrals && consultationDetails.referrals.length > 0 ? (
              consultationDetails.referrals.map((referral, index) => (
                <div
                  key={`${index}-${referral.doctorName}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      {referral.type === 'internal' && referral.doctor ? (
                        <>
                          <h4 className="font-semibold text-gray-800">
                            Dr. {referral.doctor.firstName} {referral.doctor.lastName}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            <span className="font-medium">Specialization:</span>{' '}
                            {referral.doctor.specializations?.[0] || 'General Practitioner'}
                          </p>
                        </>
                      ) : (
                        <>
                          <h4 className="font-semibold text-gray-800">{referral.doctorName}</h4>
                          <p className="mt-1 text-sm text-gray-600">
                            <span className="font-medium">Facility:</span> {referral.facility}
                          </p>
                          {referral.email && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span> {referral.email}
                            </p>
                          )}
                        </>
                      )}
                      {referral.notes && (
                        <p className="mt-2 text-sm text-gray-500 italic">
                          &#34;{referral.notes}&#34;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {referral.type === 'internal' && referral.doctor?.id ? (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          child={
                            <a
                              href={`/dashboard/doctor/${referral.doctor.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Connect with Doctor
                            </a>
                          }
                        />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            referral.id &&
                            handleDownloadReferral(referral.id, referral.doctorName || 'referral')
                          }
                          disabled={!referral.id || downloadingReferral === referral.id}
                          isLoading={downloadingReferral === referral.id}
                          child={
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download Letter
                            </>
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
                No referrals issued.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div ref={endRef} />
    </RoleProvider>
  );
};

export default PatientConsultationView;
