'use client';
import React, { JSX, useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { getAppointments } from '@/lib/features/appointments/appointmentsThunk';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import './PatientConsultationHistory.css';
import { IAppointment } from '@/types/appointment.interface';
import { OrderDirection } from '@/types/shared.enum';
import { IPagination, IResponse } from '@/types/shared.interface';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/statusBadge';
import axios from '@/lib/axios';
import {
  Activity,
  ChevronRight,
  Clock,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Loader2,
  Pill,
  Target,
  User,
} from 'lucide-react';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import { parseInitialNotes } from '@/constants/historyNotes.constant';

// Timeline dot component
const TimelineDot = ({ isActive }: { isActive: boolean }): JSX.Element => (
  <div
    className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[3px] ${
      isActive
        ? 'border-primary bg-primary shadow-primary/40 shadow-lg'
        : 'border-gray-300 bg-white'
    }`}
  >
    {isActive && <div className="h-2 w-2 animate-pulse rounded-full bg-white" />}
  </div>
);

interface PatientConsultationHistoryProps {
  patientId: string;
  onViewConsultation: (appointmentId: string) => void;
  currentAppointmentId?: string;
}

const PatientConsultationHistory = ({
  patientId,
  onViewConsultation,
  currentAppointmentId,
}: PatientConsultationHistoryProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [consultations, setConsultations] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [consultationPreviews, setConsultationPreviews] = useState<Record<string, IAppointment>>(
    {},
  );
  const [loadingPreviews, setLoadingPreviews] = useState<Record<string, boolean>>({});

  const lastConsultationRef = useInfiniteScroll({
    isLoading,
    hasMore,
    onLoadMore: () => setPage((prev) => prev + 1),
  });

  const fetchConsultations = async (): Promise<void> => {
    if (!patientId) {
      return;
    }

    setIsLoading(true);
    const { payload } = await dispatch(
      getAppointments({
        patientId,
        page,
        pageSize: 10,
        orderBy: 'createdAt',
        orderDirection: OrderDirection.Descending,
      }),
    );

    if (payload && showErrorToast(payload)) {
      toast(payload);
      setIsLoading(false);
      return;
    }

    const paginationData = payload as IPagination<IAppointment>;
    setConsultations((prev) => [...prev, ...paginationData.rows]);
    setTotalConsultations(paginationData.total);
    setHasMore(page < paginationData.totalPages);
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchConsultations();
  }, [page, patientId]);

  const fetchConsultationPreview = async (consultationId: string): Promise<void> => {
    if (consultationPreviews[consultationId] || loadingPreviews[consultationId]) {
      return; // Already loaded or loading
    }

    setLoadingPreviews((prev) => ({ ...prev, [consultationId]: true }));

    try {
      const { data } = await axios.get<IResponse<IAppointment>>(`appointments/${consultationId}`);
      setConsultationPreviews((prev) => ({ ...prev, [consultationId]: data.data }));
    } catch (error) {
      // Silently fail for preview - not critical
      console.error('Failed to fetch consultation preview:', error);
    } finally {
      setLoadingPreviews((prev) => ({ ...prev, [consultationId]: false }));
    }
  };

  useEffect(() => {
    // Fetch previews for visible consultations
    consultations.forEach((consultation) => {
      void fetchConsultationPreview(consultation.id);
    });
  }, [consultations]);

  const formatDate = (dateString: string): string => moment(dateString).format('MMM DD, YYYY');

  const formatTime = (timeString: string): string => moment(timeString).format('hh:mm A');

  type PrescriptionSummary = { count: number; drugs: string[] } | null;

  // Render loading skeleton for preview
  const renderLoadingSkeleton = (): JSX.Element => (
    <div className="animate-pulse space-y-2 border-t border-gray-100 pt-3">
      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
      <div className="h-4 w-1/2 rounded bg-gray-200"></div>
    </div>
  );

  // Render detailed preview with Assessment/Plan
  const renderDetailedPreview = (preview: IAppointment, hasLab: boolean): JSX.Element => {
    const complaints = extractChiefComplaints(preview);
    const assessment = extractAssessment(preview);
    const plan = extractPlan(preview);
    const prescriptionInfo = getPrescriptionSummary(preview);

    return (
      <div className="space-y-3 border-t border-gray-100 pt-3">
        {/* Chief Complaints Preview */}
        {complaints.length > 0 && (
          <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <span className="text-xs font-bold text-amber-700">!</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-wider text-amber-700 uppercase">
                  Chief Complaints
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">{complaints.join(', ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Assessment / Impression Preview */}
        {assessment && (
          <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3">
            <div className="flex items-start gap-2">
              <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-wider text-teal-600 uppercase">
                  Assessment / Impression
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-800">{assessment}</p>
              </div>
            </div>
          </div>
        )}

        {/* Plan Preview */}
        {plan && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
            <div className="flex items-start gap-2">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase">
                  Plan
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-800">{plan}</p>
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions with Drug Names */}
        {prescriptionInfo && (
          <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-3">
            <div className="flex items-start gap-2">
              <Pill className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-wider text-purple-600 uppercase">
                  Prescriptions ({prescriptionInfo.count})
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {prescriptionInfo.drugs.join(', ')}
                  {prescriptionInfo.count > 2 && (
                    <span className="text-purple-600"> +{prescriptionInfo.count - 2} more</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lab Badge */}
        {hasLab && (
          <div className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs">
            <FlaskConical className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-medium text-blue-700">Lab Results Available</span>
          </div>
        )}
      </div>
    );
  };

  // Render fallback basic info when preview is not available
  const renderFallbackInfo = (consultation: IAppointment): JSX.Element | null => {
    const hasPrescriptions = consultation.prescriptions && consultation.prescriptions.length > 0;
    const hasLab = !!consultation.lab;

    if (!hasPrescriptions && !hasLab) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-2">
        {hasPrescriptions && (
          <div className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs">
            <Pill className="h-3.5 w-3.5 text-purple-600" />
            <span className="font-medium text-purple-700">
              {consultation.prescriptions.length} Prescription
              {consultation.prescriptions.length === 1 ? '' : 's'}
            </span>
          </div>
        )}

        {hasLab && (
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs">
            <FlaskConical className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-medium text-blue-700">Lab Results</span>
          </div>
        )}
      </div>
    );
  };

  // Helper function to extract chief complaints from notes or symptoms
  const extractChiefComplaints = (preview: IAppointment): string[] => {
    // Try to get from symptoms.complaints
    if (preview.symptoms?.complaints && preview.symptoms.complaints.length > 0) {
      return preview.symptoms.complaints.map((c) => c.complaint).slice(0, 2);
    }

    // Try to parse from historyNotes (JSON format)
    if (preview.historyNotes) {
      try {
        const parsed = parseInitialNotes(preview.historyNotes);
        if (parsed.presentingComplaint) {
          return [parsed.presentingComplaint];
        }
      } catch {
        // Ignore parsing errors
      }
    }

    return [];
  };

  // Helper function to extract Assessment/Impression from historyNotes
  const extractAssessment = (preview: IAppointment): string | null => {
    if (preview.historyNotes) {
      try {
        const parsed = parseInitialNotes(preview.historyNotes);
        if (parsed.assessment?.trim()) {
          // Limit to first 100 characters for preview
          const text = parsed.assessment.trim();
          return text.length > 100 ? text.substring(0, 100) + '...' : text;
        }
      } catch {
        // Ignore parsing errors
      }
    }
    return null;
  };

  // Helper function to extract Plan from historyNotes
  const extractPlan = (preview: IAppointment): string | null => {
    if (preview.historyNotes) {
      try {
        const parsed = parseInitialNotes(preview.historyNotes);
        if (parsed.plan?.trim()) {
          // Limit to first 80 characters for preview
          const text = parsed.plan.trim();
          return text.length > 80 ? text.substring(0, 80) + '...' : text;
        }
      } catch {
        // Ignore parsing errors
      }
    }
    return null;
  };

  // Helper function to get prescription summary with drug names
  const getPrescriptionSummary = (preview: IAppointment): PrescriptionSummary => {
    if (preview.prescriptions && preview.prescriptions.length > 0) {
      const drugNames = preview.prescriptions
        .slice(0, 2)
        .map((p) => p.name) // IPrescription has 'name' property
        .filter(Boolean);

      return {
        count: preview.prescriptions.length,
        drugs: drugNames,
      };
    }
    return null;
  };

  if (consultations.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 rounded-full bg-linear-to-br from-green-50 to-indigo-50 p-6">
          <Clock className="h-12 w-12 text-green-400" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">No Consultation History</h3>
        <p className="max-w-md text-gray-500">
          This patient has no completed consultations yet. Start a new consultation to begin
          building their medical timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="from-primary/5 rounded-xl bg-linear-to-r via-green-50 to-indigo-50 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
            <Clock className="text-primary h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Consultation Timeline</h2>
            <p className="mt-1 text-sm text-gray-500">
              Complete medical history and consultations
              {totalConsultations > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary ml-2">
                  {totalConsultations} consultation{totalConsultations === 1 ? '' : 's'}
                </Badge>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Continuous vertical line - styled with pure CSS */}
        <div className="timeline-vertical-line" />

        {/* Timeline items */}
        <div className="space-y-6">
          {consultations.map((consultation, index) => {
            const isCurrentConsultation = consultation.id === currentAppointmentId;
            const preview = consultationPreviews[consultation.id];
            const isLoadingPreview = loadingPreviews[consultation.id];
            const hasLab = !!preview?.lab;

            return (
              <div
                key={`${consultation.id}-${index}`}
                ref={index === consultations.length - 1 ? lastConsultationRef : null}
                className="relative"
              >
                {/* Timeline Row: Dot + Content */}
                <div className="flex gap-4">
                  {/* Timeline Dot */}
                  <TimelineDot isActive={isCurrentConsultation} />

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    {/* Date Label */}
                    <div className="-mt-0.5 mb-2 flex items-center gap-2">
                      <span className="text-primary text-xs font-bold tracking-wider uppercase">
                        {moment(consultation.slot.date).format('dddd')}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm font-medium text-gray-600">
                        {formatDate(consultation.slot.date)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {formatTime(consultation.slot.startTime)}
                      </span>
                    </div>

                    {/* Card */}
                    <div
                      className={`group rounded-xl border bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg ${
                        isCurrentConsultation
                          ? 'border-primary/50 ring-primary/20 shadow-md ring-2'
                          : 'hover:border-primary/30 border-gray-200'
                      }`}
                    >
                      {/* Status Row */}
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={consultation.status} />
                          {isCurrentConsultation && (
                            <Badge className="bg-primary text-xs text-white">
                              <Activity className="mr-1 h-3 w-3" />
                              Current Session
                            </Badge>
                          )}
                        </div>

                        <Button
                          onClick={() => onViewConsultation(consultation.id)}
                          size="sm"
                          variant={isCurrentConsultation ? 'default' : 'outline'}
                          className="shrink-0 text-xs"
                          child={
                            <>
                              <span>View</span>
                              <ChevronRight className="ml-1 h-3.5 w-3.5" />
                            </>
                          }
                        />
                      </div>

                      <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                          <User className="h-3 w-3 text-gray-500" />
                        </div>
                        <span className="font-medium">
                          Dr. {consultation.doctor.firstName} {consultation.doctor.lastName}
                        </span>
                      </div>

                      {/* Preview Section */}
                      {((): JSX.Element => {
                        if (isLoadingPreview) {
                          return renderLoadingSkeleton();
                        }

                        if (preview) {
                          return renderDetailedPreview(preview, hasLab);
                        }

                        return renderFallbackInfo(consultation);
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="relative flex gap-4">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[3px] border-gray-200 bg-white">
                <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6">
                  <span className="text-sm font-medium text-gray-500">
                    Loading more consultations...
                  </span>
                </div>
              </div>
            </div>
          )}

          {!hasMore && consultations.length > 0 && (
            <div className="relative flex gap-4">
              {/* End dot */}
              <div className="border-primary/30 bg-primary/10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[3px]">
                <div className="bg-primary/50 h-1.5 w-1.5 rounded-full" />
              </div>
              <div className="flex-1">
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">End of consultation history</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientConsultationHistory;
