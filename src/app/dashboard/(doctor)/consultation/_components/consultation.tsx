'use client';
import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  ClockFading,
  FlaskConical,
  GitMerge,
  History as HistoryIcon,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { capitalize, caseToSentence, cn, showErrorToast } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  authenticateConsultation,
  endConsultation as endConsultationRequest,
  getConsultationAppointment,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { linkAppointment, unlinkAppointment } from '@/lib/features/appointments/appointmentsThunk';
import {
  updateAppointmentLinkId,
  showReviewModal,
} from '@/lib/features/appointments/appointmentsSlice';
import { useParams, useRouter } from 'next/navigation';
import {
  selectConsultationStatus,
  hasConsultationEnded,
  isConsultationInProgress,
  isConsultationInvestigatingProgress,
  selectAppointmentRadiology,
  selectHistoryNotes,
  selectIsConsultationAuthenticated,
  selectIsLoading,
  selectRequestedLabs,
  selectSymptoms,
  selectAppointmentLinkId,
  selectIsFollowUp,
  selectAppointmentDoctorId,
} from '@/lib/features/appointments/appointmentSelector';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { getPatientRecords } from '@/lib/features/records/recordsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RoleProvider } from '@/app/dashboard/_components/providers/roleProvider';
import { Role } from '@/types/shared.enum';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import ConsultationAuthDialog from './ConsultationAuthDialog';
import { TooltipComp } from '@/components/ui/tooltip';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

const History = dynamic(() => import('@/app/dashboard/(doctor)/consultation/_components/history'), {
  loading: () => <StageFallback />,
  ssr: false,
});
const InvestigationResults = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/InvestigationResults'),
  { loading: () => <StageFallback />, ssr: false },
);
const Investigation = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/investigation'),
  { loading: () => <StageFallback />, ssr: false },
);

const Prescription = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/prescription'),
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
const PatientConsultationHistory = dynamic(
  () => import('@/app/dashboard/(doctor)/_components/PatientConsultationHistory'),
  { loading: () => <StageFallback />, ssr: false },
);
const ConsultationViewSheet = dynamic(
  () => import('@/app/dashboard/(doctor)/_components/ConsultationViewSheet'),
  { loading: () => <StageFallback />, ssr: false },
);

const regularStages = ['history', 'investigation', 'prescription', 'review'] as const;
const investigatingStages = [
  'investigationResults',
  'history',
  'investigation',
  'prescription',
  'review',
] as const;

type RegularStage = (typeof regularStages)[number];
type InvestigatingStage = (typeof investigatingStages)[number];
type StageType = RegularStage | InvestigatingStage;

const getStageLabel = (stage: StageType): string => {
  if (stage === 'investigationResults') {
    return 'Investigation Results';
  }
  return capitalize(stage);
};

const getStatusBadgeVariant = (
  status: AppointmentStatus | undefined,
): 'brown' | 'default' | 'destructive' => {
  switch (status) {
    case AppointmentStatus.Progress:
    case AppointmentStatus.InvestigatingProgress:
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
    case 'investigating_progress':
      return <ClockFading size="16" className="mr-1 text-xs" />;
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
  const [update, setUpdate] = useState(false);
  const dispatch = useAppDispatch();
  const isLoadingAppointment = useAppSelector(selectIsLoading);
  const currentConsultationStatus = useAppSelector(selectConsultationStatus);
  const isInProgress = useAppSelector(isConsultationInProgress);
  const isInvestigatingProgress = useAppSelector(isConsultationInvestigatingProgress);
  const hasEnded = useAppSelector(hasConsultationEnded);
  const params = useParams();
  const [isEndingConsultation, setIsEndingConsultation] = useState(false);
  const symptoms = useAppSelector(selectSymptoms);
  const historyNotes = useAppSelector(selectHistoryNotes);
  const requestedAppointmentLabs = useAppSelector(selectRequestedLabs);
  const requestedAppointmentRadiology = useAppSelector(selectAppointmentRadiology);
  const isConsultationAuthenticated = useAppSelector(selectIsConsultationAuthenticated);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showEndConsultationAuthDialog, setShowEndConsultationAuthDialog] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPastConsultationsDrawer, setShowPastConsultationsDrawer] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [showConsultationSheet, setShowConsultationSheet] = useState(false);
  const appointmentLinkId = useAppSelector(selectAppointmentLinkId);
  const isFollowUp = useAppSelector(selectIsFollowUp);
  const doctorId = useAppSelector(selectAppointmentDoctorId);

  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  // Stages depend on consultation type
  const stages = useMemo<readonly StageType[]>(
    () => (isInvestigatingProgress ? investigatingStages : regularStages),
    [isInvestigatingProgress],
  );

  const [currentStage, setCurrentStage] = useState<StageType>(stages[0]);

  // Reset to first stage whenever stages change (i.e., when isInvestigating resolves)
  useEffect(() => {
    setCurrentStage(stages[0]);
  }, [isInvestigatingProgress]);

  // Check if there are any investigations requested
  const hasInvestigation =
    (requestedAppointmentLabs && requestedAppointmentLabs.length > 0) ||
    !!requestedAppointmentRadiology;

  const canJumpToStage = useCallback(
    (stage: StageType): boolean => {
      const symptomsPassed = !!symptoms || !!historyNotes;
      if (stage === 'investigationResults') {
        return true;
      }
      if (stage === 'history' || stage === 'prescription') {
        return isInvestigatingProgress ? true : symptomsPassed;
      }
      if (stage === 'investigation') {
        return isInvestigatingProgress ? true : symptomsPassed;
      }
      if (stage === 'review') {
        return symptomsPassed;
      }
      return false;
    },
    [symptoms, historyNotes, isInvestigatingProgress],
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

  const handleEndConsultationWithAuth = async (
    code: string,
    isEndInvestigating?: boolean,
  ): Promise<void> => {
    setIsEndingConsultation(true);
    const appointmentId = String(params.appointmentId);

    const payload = await dispatch(
      endConsultationRequest({
        appointmentId,
        ...(isConsultationAuthenticated ? {} : { code }),
        isInvestigating: isEndInvestigating,
      }),
    ).unwrap();
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
    const payload = await dispatch(
      endConsultationRequest({ appointmentId, isInvestigating: false }),
    ).unwrap();
    toast(payload);
    setIsEndingConsultation(false);

    if (!showErrorToast(payload)) {
      dispatch(showReviewModal({ appointmentId }));
      router.push('/dashboard');
    }
  };

  const endConsultation = (): void => {
    // Show dialog if not authenticated OR if there are investigations (to allow post-investigation follow-up option)
    if (isConsultationAuthenticated && !hasInvestigation) {
      void handleEndConsultationWithoutAuth();
    } else {
      setShowEndConsultationAuthDialog(true);
    }
  };

  const handleViewPastConsultation = (consultationId: string): void => {
    setSelectedConsultationId(consultationId);
    setShowConsultationSheet(true);
    setShowPastConsultationsDrawer(false);
  };

  const getStage = (): JSX.Element => {
    switch (currentStage) {
      case 'investigationResults':
        return <InvestigationResults goToNext={() => setCurrentStage('history')} />;
      case 'investigation':
        return (
          <Investigation
            goToNext={() => setCurrentStage('prescription')}
            goToPrevious={() => setCurrentStage('history')}
          />
        );
      case 'prescription':
        return (
          <Prescription
            updatePrescription={update}
            setUpdatePrescription={setUpdate}
            goToNext={() => setCurrentStage('review')}
            goToPrevious={() => setCurrentStage('investigation')}
          />
        );
      case 'review':
        return <ReviewConsultation goToPrevious={() => setCurrentStage('prescription')} />;
      case 'history':
      default:
        return <History goToNext={() => setCurrentStage('investigation')} />;
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

  const linkedDrawerNote = appointmentLinkId
    ? 'The linked past visit is highlighted below.'
    : 'Use "My consultations only" filter to find and link a past visit.';
  const drawerDescription = isFollowUp
    ? `This is a follow-up consultation. ${linkedDrawerNote}`
    : 'View previous consultations with this patient.';

  const handleLink = async (linkedAppointmentId: string): Promise<void> => {
    setIsLinking(true);
    const result = await dispatch(
      linkAppointment({
        appointmentId: String(params.appointmentId),
        appointmentLinkId: linkedAppointmentId,
      }),
    ).unwrap();
    toast(result);
    if (!showErrorToast(result)) {
      dispatch(updateAppointmentLinkId(linkedAppointmentId));
    }
    setIsLinking(false);
  };

  const handleUnlink = async (): Promise<void> => {
    if (!appointmentLinkId) {
      return;
    }
    setIsUnlinking(true);
    const result = await dispatch(
      unlinkAppointment({
        appointmentId: String(params.appointmentId),
        appointmentLinkId: String(appointmentLinkId),
      }),
    ).unwrap();
    toast(result);
    if (!showErrorToast(result)) {
      dispatch(updateAppointmentLinkId(null));
    }
    setIsUnlinking(false);
  };

  return (
    <RoleProvider role={Role.Doctor}>
      <div>
        {isLoadingConsultation && <LoadingOverlay />}
        <div className="rounded-2xl border border-gray-300 px-4 py-6 sm:px-6 sm:py-4">
          {(isLoadingAppointment || isLoadingRecords) && <LoadingOverlay />}

          {/* Title row — status badges live here */}
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium sm:text-base">Consultation</span>
            {currentConsultationStatus && (
              <Badge
                className="px-2 py-1 text-xs sm:px-3 sm:py-1.5"
                variant={getStatusBadgeVariant(currentConsultationStatus)}
              >
                {getStatusIcon(currentConsultationStatus)}
                {caseToSentence(currentConsultationStatus, true)}
              </Badge>
            )}
            {isInvestigatingProgress && (
              <Badge className="flex items-center gap-1 border-blue-300 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                <FlaskConical className="h-3 w-3" />
                Post-Investigation
              </Badge>
            )}
            {/* Follow-Up indicators — shown next to status, not buried in the actions row */}
            {isFollowUp && appointmentLinkId && (
              <Badge className="flex items-center gap-1 border-green-300 bg-green-50 px-2 py-1 text-xs text-green-700">
                <GitMerge className="h-3 w-3" />
                Follow-Up · Linked
              </Badge>
            )}
            {isFollowUp && !appointmentLinkId && (
              <Badge className="flex items-center gap-1 border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                <GitMerge className="h-3 w-3" />
                Follow-Up
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
                  'sticky top-0 z-50 mb-3 flex flex-col gap-4 border-t border-b border-gray-300 bg-gray-100 py-1 font-bold text-gray-500 sm:mb-5 sm:py-3 lg:flex-row lg:justify-between',
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
                        'inline-block px-6 text-xs whitespace-nowrap md:px-8',
                      )}
                    >
                      {stage === 'investigationResults' ? (
                        <span className="flex items-center gap-1">
                          <FlaskConical className="h-3 w-3" />
                          Results
                        </span>
                      ) : (
                        getStageLabel(stage)
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                  <TooltipComp tip="View Past Consultations">
                    <Button
                      child={<HistoryIcon />}
                      onClick={() => setShowPastConsultationsDrawer(true)}
                    />
                  </TooltipComp>
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
          hasInvestigation={hasInvestigation}
          isAuthenticated={isConsultationAuthenticated}
        />

        {/* Past consultations drawer — also supports linking for follow-up consultations */}
        {(isInProgress || isInvestigatingProgress) && (
          <Drawer open={showPastConsultationsDrawer} onOpenChange={setShowPastConsultationsDrawer}>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle className="flex flex-wrap items-center gap-2">
                  Patient&apos;s Consultation History
                  {isFollowUp && (
                    <Badge
                      className={`text-xs ${
                        appointmentLinkId
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : 'border-amber-300 bg-amber-50 text-amber-700'
                      }`}
                    >
                      <GitMerge className="mr-1 h-3 w-3" />
                      {appointmentLinkId ? 'Follow-Up · Linked' : 'Follow-Up · Not Linked'}
                    </Badge>
                  )}
                </DrawerTitle>
                <DrawerDescription>{drawerDescription}</DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-4">
                <PatientConsultationHistory
                  patientId={String(params.patientId)}
                  onViewConsultation={handleViewPastConsultation}
                  onViewLinkedConsultation={(id) => {
                    setSelectedConsultationId(id);
                    setShowConsultationSheet(true);
                    setShowPastConsultationsDrawer(false);
                  }}
                  currentAppointmentId={String(params.appointmentId)}
                  doctorId={doctorId}
                  isFollowUp={isFollowUp}
                  appointmentLinkId={appointmentLinkId}
                  onLink={handleLink}
                  onUnlink={handleUnlink}
                  isLinking={isLinking}
                  isUnlinking={isUnlinking}
                  isConsultationCompleted={hasEnded}
                />
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline" child="Close" />
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}

        <ConsultationViewSheet
          open={showConsultationSheet}
          onOpenChange={setShowConsultationSheet}
          appointmentId={selectedConsultationId}
        />
      </div>
    </RoleProvider>
  );
};

export default Consultation;
