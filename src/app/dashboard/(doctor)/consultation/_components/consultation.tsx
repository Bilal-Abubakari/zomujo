'use client';
import React, { JSX, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, ClockFading, Loader2, ShieldCheck } from 'lucide-react';
import { capitalize, cn, showErrorToast } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  endConsultation as endConsultationRequest,
  getConsultationAppointment,
  authenticateConsultation,
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
  selectIsConsultationAuthenticated,
  selectHistoryNotes,
} from '@/lib/features/appointments/appointmentSelector';
import { showReviewModal } from '@/lib/features/appointments/appointmentsSlice';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { getPatientRecords } from '@/lib/features/records/recordsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RoleProvider } from '@/app/dashboard/_components/providers/roleProvider';
import { Role } from '@/types/shared.enum';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import ConsultationAuthDialog from './ConsultationAuthDialog';

const History = dynamic(() => import('@/app/dashboard/(doctor)/consultation/_components/history'), {
  loading: () => <StageFallback />,
  ssr: false,
});
const Investigation = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/investigation'),
  { loading: () => <StageFallback />, ssr: false },
);

const Prescription = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/prescription'),
  { loading: () => <StageFallback />, ssr: false },
);
const Diagnosis = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/diagnosis'),
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

const stages = ['history', 'investigation', 'prescription', 'diagnosis', 'review'] as const;

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
  const params = useParams();
  const [isEndingConsultation, setIsEndingConsultation] = useState(false);
  const symptoms = useAppSelector(selectSymptoms);
  const historyNotes = useAppSelector(selectHistoryNotes);
  const requestedAppointmentLabs = useAppSelector(selectRequestedLabs);
  const savedDiagnoses = useAppSelector(selectDiagnoses);
  const isConsultationAuthenticated = useAppSelector(selectIsConsultationAuthenticated);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showEndConsultationAuthDialog, setShowEndConsultationAuthDialog] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const canJumpToStage = useCallback(
    (stage: StageType): boolean => {
      const symptomsPassed = !!symptoms || !!historyNotes;
      if (stage === 'history' || stage === 'prescription') {
        return symptomsPassed;
      }
      if (stage === 'investigation') {
        return symptomsPassed;
      }

      if (stage === 'diagnosis') {
        // Can go to diagnosis if prescriptions passed? Or just linear?
        // Let's assume linear progression for simplicity or check previous steps
        return symptomsPassed;
      }
      if (stage === 'review') {
        return savedDiagnoses.length > 0;
      }
      return false;
    },
    [symptoms, requestedAppointmentLabs, savedDiagnoses],
  );

  const handleAuthenticateConsultation = async (code: string): Promise<void> => {
    setIsAuthenticating(true);
    const appointmentId = String(params.appointmentId);
    const payload = await dispatch(authenticateConsultation({ appointmentId, code })).unwrap();
    toast(payload);
    setIsAuthenticating(false);

    if (!showErrorToast(payload)) {
      setShowAuthDialog(false);
    }
  };

  const handleEndConsultationWithAuth = async (code: string): Promise<void> => {
    setIsEndingConsultation(true);
    const appointmentId = String(params.appointmentId);

    const payload = await dispatch(endConsultationRequest({ appointmentId, code })).unwrap();
    toast(payload);
    setIsEndingConsultation(false);

    if (!showErrorToast(payload)) {
      setShowEndConsultationAuthDialog(false);
      dispatch(showReviewModal({ appointmentId }));
      router.push('/dashboard');
    }
  };

  const handleEndConsultationWithoutAuth = async (): Promise<void> => {
    setIsEndingConsultation(true);
    const appointmentId = String(params.appointmentId);
    const payload = await dispatch(endConsultationRequest({ appointmentId, code: '' })).unwrap();
    toast(payload);
    setIsEndingConsultation(false);

    if (!showErrorToast(payload)) {
      dispatch(showReviewModal({ appointmentId }));
      router.push('/dashboard');
    }
  };

  const endConsultation = (): void => {
    // If consultation is already authenticated, end without requiring code again
    if (isConsultationAuthenticated) {
      void handleEndConsultationWithoutAuth();
    } else {
      // Show authentication dialog when not authenticated
      setShowEndConsultationAuthDialog(true);
    }
  };

  const getStage = (): JSX.Element => {
    switch (currentStage) {
      case 'investigation':
        return <Investigation goToNext={() => setCurrentStage('prescription')} />;
      case 'prescription':
        return (
          <Prescription
            updatePrescription={update}
            setUpdatePrescription={setUpdate}
            goToNext={() => setCurrentStage('diagnosis')}
          />
        );
      case 'diagnosis':
        return (
          <Diagnosis
            updateDiagnosis={update}
            setUpdateDiagnosis={setUpdate}
            goToNext={() => setCurrentStage('review')}
          />
        );
      case 'review':
        return <ReviewConsultation />;
      case 'history':
      default:
        return (
          <History
            updateSymptoms={update}
            setUpdateSymptoms={setUpdate}
            goToNext={() => setCurrentStage('investigation')}
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
      toast(payload);
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
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                    {!isConsultationAuthenticated && (
                      <Button
                        isLoading={isAuthenticating}
                        disabled={isAuthenticating}
                        onClick={() => setShowAuthDialog(true)}
                        child={
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="hidden sm:inline">Authenticate</span>
                          </span>
                        }
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary-light w-full text-sm sm:w-auto"
                      />
                    )}
                    {isConsultationAuthenticated && (
                      <Badge className="border-green-300 bg-green-100 px-3 py-2 text-xs text-green-700">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Authenticated
                      </Badge>
                    )}
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

        {/* Authentication Dialog for authenticating without ending */}
        <ConsultationAuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          onSubmit={handleAuthenticateConsultation}
          isLoading={isAuthenticating}
          title="Authenticate Consultation"
          description="Enter the authentication code provided by the patient. This will authenticate the consultation session."
          submitButtonText="Authenticate"
        />

        {/* Authentication Dialog for ending consultation */}
        <ConsultationAuthDialog
          open={showEndConsultationAuthDialog}
          onOpenChange={setShowEndConsultationAuthDialog}
          onSubmit={handleEndConsultationWithAuth}
          isLoading={isEndingConsultation}
          title="End Consultation"
          description="To end this consultation, please enter the authentication code provided by the patient."
          submitButtonText="End Consultation"
        />
      </div>
    </RoleProvider>
  );
};

export default Consultation;
