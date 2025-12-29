'use client';
import React, { JSX, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, ClockFading, Loader2 } from 'lucide-react';
import { capitalize, cn, showErrorToast } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  endConsultation as endConsultationRequest,
  getConsultationAppointment,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams, useRouter } from 'next/navigation';
import {
  consultationStatus,
  hasConsultationEnded,
  isConsultationInProgress,
  selectDiagnoses,
  selectIsLoading,
  selectRequestedLabs,
  selectSymptoms,
} from '@/lib/features/appointments/appointmentSelector';
import { showReviewModal } from '@/lib/features/appointments/appointmentsSlice';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { getPatientRecords } from '@/lib/features/records/recordsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RoleProvider } from '@/app/dashboard/_components/providers/roleProvider';
import { Role } from '@/types/shared.enum';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';

const History = dynamic(() => import('@/app/dashboard/(doctor)/consultation/_components/history'), {
  loading: () => <StageFallback />,
  ssr: false,
});
const Investigation = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/investigation'),
  { loading: () => <StageFallback />, ssr: false },
);
const DiagnosePrescribe = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/diagnosePrescribe'),
  { loading: () => <StageFallback />, ssr: false },
);
const ReviewConsultation = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/ReviewConsultation'),
  { loading: () => <StageFallback />, ssr: false },
);
const ConsultationHistory = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/ConsultationHistory'),
  { loading: () => <StageFallback />, ssr: false },
);

const stages = ['history', 'investigation', 'diagnose & prescribe', 'review'] as const;

type StageType = (typeof stages)[number];

const getStatusBadgeVariant = (
  status: AppointmentStatus | undefined,
): 'brown' | 'default' | 'destructive' => {
  switch (status) {
    case AppointmentStatus.Progress:
      return 'brown';
    case AppointmentStatus.Completed:
      return 'default';
    case AppointmentStatus.Incomplete:
      return 'destructive';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string | undefined): JSX.Element => {
  switch (status?.toLowerCase()) {
    case 'progress':
      return <ClockFading className="mr-1" />;
    case 'completed':
      return <CheckCircle className="mr-1" />;
    default:
      return <Clock className="mr-1" />;
  }
};

const StageFallback = (): JSX.Element => (
  <div className="flex items-center justify-center p-12">
    <Loader2 className="animate-spin" size={32} />
  </div>
);

const Consultation = (): JSX.Element => {
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(true);
  const router = useRouter();
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [currentStage, setCurrentStage] = useState<StageType>(stages[0]);
  const [update, setUpdate] = useState(false);
  const dispatch = useAppDispatch();
  const isLoadingAppointment = useAppSelector(selectIsLoading);
  const currentConsultationStatus = useAppSelector(consultationStatus);
  const isInProgress = useAppSelector(isConsultationInProgress);
  const hasEnded = useAppSelector(hasConsultationEnded);
  const recordId = useAppSelector(selectRecordId);
  const params = useParams();
  const [isEndingConsultation, setIsEndingConsultation] = useState(false);
  const symptoms = useAppSelector(selectSymptoms);
  const [hasSavedSymptoms, setHasSavedSymptoms] = useState(false);
  const requestedAppointmentLabs = useAppSelector(selectRequestedLabs);
  const [hasSavedLabs, setHasSavedLabs] = useState(false);
  const savedDiagnoses = useAppSelector(selectDiagnoses);
  const [hasSavedDiagnosis, setHasSavedDiagnosis] = useState(false);

  const canJumpToStage = useCallback(
    (stage: StageType): boolean => {
      const symptomsPassed = !!symptoms || hasSavedSymptoms;
      if (stage === 'history' || stage === 'diagnose & prescribe') {
        return symptomsPassed;
      }
      if (stage === 'investigation') {
        return symptomsPassed && (!!requestedAppointmentLabs || hasSavedLabs);
      }
      if (stage === 'review') {
        return hasSavedDiagnosis || savedDiagnoses.length > 0;
      }
      return false;
    },
    [
      symptoms,
      requestedAppointmentLabs,
      hasSavedSymptoms,
      hasSavedLabs,
      hasSavedDiagnosis,
      savedDiagnoses,
    ],
  );

  const endConsultation = async (): Promise<void> => {
    setIsEndingConsultation(true);
    const appointmentId = String(params.appointmentId);
    const payload = await dispatch(endConsultationRequest(appointmentId)).unwrap();
    toast(payload);
    setIsEndingConsultation(false);

    if (!showErrorToast(payload)) {
      router.push('/dashboard');

      if (recordId) {
        dispatch(showReviewModal({ appointmentId, recordId }));
      }
    }
  };

  const getStage = (): JSX.Element => {
    switch (currentStage) {
      case 'investigation':
        return (
          <Investigation
            goToDiagnoseAndPrescribe={() => {
              setHasSavedLabs(true);
              setCurrentStage(stages[2]);
            }}
            updateInvestigation={update}
            setUpdateInvestigation={setUpdate}
          />
        );
      case 'diagnose & prescribe':
        return (
          <DiagnosePrescribe
            goToReview={() => {
              setHasSavedDiagnosis(true);
              setCurrentStage(stages[3]);
            }}
            updateDiagnosis={update}
            setUpdateDiagnosis={setUpdate}
          />
        );
      case 'review':
        return <ReviewConsultation />;
      default:
        return (
          <History
            goToLabs={() => {
              setHasSavedSymptoms(true);
              setCurrentStage(stages[1]);
            }}
          />
        );
    }
  };

  const fetchPatientRecords = async (): Promise<void> => {
    setIsLoadingRecords(true);
    const { payload } = await dispatch(getPatientRecords(String(params.patientId)));
    if (showErrorToast(payload)) {
      toast(payload as Toast);
    }
    setIsLoadingRecords(false);
  };

  const fetchConsultationAppointment = async (): Promise<void> => {
    setIsLoadingConsultation(true);
    const payload = await dispatch(
      getConsultationAppointment(String(params.appointmentId)),
    ).unwrap();
    if (showErrorToast(payload)) {
      toast(payload as Toast);
    }
    setIsLoadingConsultation(false);
  };

  useEffect(() => {
    void fetchPatientRecords();
    void fetchConsultationAppointment();
  }, []);

  return (
    <RoleProvider role={Role.Doctor}>
      <div>
        {isLoadingConsultation && <LoadingOverlay />}
        <div className="rounded-2xl border border-gray-300 px-4 py-6 sm:px-6 sm:py-8">
          {(isLoadingAppointment || isLoadingRecords) && <LoadingOverlay />}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium sm:text-base">Consultation</span>
            {currentConsultationStatus && (
              <Badge
                className="px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm"
                variant={getStatusBadgeVariant(currentConsultationStatus)}
              >
                {getStatusIcon(currentConsultationStatus)}
                {capitalize(currentConsultationStatus)}
              </Badge>
            )}
          </div>
          {hasEnded ? (
            <div className="mt-8">
              <ConsultationHistory />
            </div>
          ) : (
            <>
              <div
                className={cn(
                  update || isLoadingAppointment ? '' : 'sticky top-0 z-50',
                  'sticky top-0 z-50 mb-6 flex flex-col gap-4 border-t border-b border-gray-300 bg-gray-100 py-4 font-bold text-gray-500 sm:mb-8 sm:py-6 lg:flex-row lg:justify-between',
                )}
                id="clip"
              >
                <div className="scrollbar-hide flex gap-1 overflow-x-auto sm:gap-0">
                  {stages.map((stage, index) => (
                    <button
                      onClick={() => setCurrentStage(stage)}
                      key={stage}
                      disabled={!canJumpToStage(stage)}
                      className={cn(
                        index === 0 || index === stages.length - 1 ? '' : 'in-between',
                        index === stages.length - 1 && 'last-crumb rounded-r-2xl sm:rounded-r-4xl',
                        index === 0 && 'first-crumb rounded-l-2xl sm:rounded-l-4xl',
                        canJumpToStage(stage) ? 'cursor-pointer' : 'cursor-not-allowed',
                        currentStage === stage ||
                          stages.indexOf(currentStage) > stages.indexOf(stage)
                          ? 'bg-primary-light text-primary'
                          : 'bg-gray-200',
                        'inline-block px-6 py-3 text-xs whitespace-nowrap sm:py-4.5 sm:text-sm md:px-8',
                      )}
                    >
                      {capitalize(stage)}
                    </button>
                  ))}
                </div>
                {isInProgress && (
                  <div className="flex justify-end lg:block">
                    <Button
                      isLoading={isEndingConsultation}
                      disabled={isEndingConsultation}
                      onClick={() => endConsultation()}
                      child="End Consultation"
                      variant="destructive"
                      className="w-full text-sm sm:w-auto"
                    />
                  </div>
                )}
              </div>
              {getStage()}
            </>
          )}
        </div>
      </div>
    </RoleProvider>
  );
};

export default Consultation;
