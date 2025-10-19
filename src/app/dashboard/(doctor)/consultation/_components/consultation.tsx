'use client';
import React, { JSX, useEffect, useState, lazy, Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { ClockFading, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { capitalize, cn, showErrorToast } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  getConsultationAppointment,
  endConsultation as endConsultationRequest,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams, useRouter } from 'next/navigation';
import {
  selectIsLoading,
  consultationStatus,
  isConsultationInProgress,
  hasConsultationEnded,
} from '@/lib/features/appointments/appointmentSelector';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { getPatientRecords } from '@/lib/features/records/recordsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RoleProvider } from '@/app/dashboard/_components/providers/roleProvider';
import { Role } from '@/types/shared.enum';

const Symptoms = lazy(() => import('@/app/dashboard/(doctor)/consultation/_components/symptoms'));
const Labs = lazy(() => import('@/app/dashboard/(doctor)/consultation/_components/labs'));
const DiagnosePrescribe = lazy(
  () => import('@/app/dashboard/(doctor)/consultation/_components/diagnosePrescribe'),
);
const ReviewConsultation = lazy(
  () => import('@/app/dashboard/(doctor)/consultation/_components/ReviewConsultation'),
);
const ConsultationHistory = lazy(
  () => import('@/app/dashboard/(doctor)/consultation/_components/ConsultationHistory'),
);

const stages = ['symptoms', 'labs', 'diagnose & prescribe', 'review'];

type StageType = (typeof stages)[number];

const getStatusBadgeVariant = (status: string | undefined): 'brown' | 'default' => {
  switch (status?.toLowerCase()) {
    case 'progress':
      return 'brown';
    case 'completed':
      return 'default';
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

  const endConsultation = async (): Promise<void> => {
    setIsEndingConsultation(true);
    const payload = await dispatch(endConsultationRequest(String(params.appointmentId))).unwrap();
    toast(payload);
    setIsEndingConsultation(false);
    router.push('/dashboard');
  };

  const getStage = (): JSX.Element => {
    switch (currentStage) {
      case 'labs':
        return (
          <Suspense fallback={<StageFallback />}>
            <Labs
              goToDiagnoseAndPrescribe={() => setCurrentStage(stages[2])}
              updateLabs={update}
              setUpdateLabs={setUpdate}
            />
          </Suspense>
        );
      case 'diagnose & prescribe':
        return (
          <Suspense fallback={<StageFallback />}>
            <DiagnosePrescribe
              goToReview={() => setCurrentStage(stages[3])}
              updateDiagnosis={update}
              setUpdateDiagnosis={setUpdate}
            />
          </Suspense>
        );
      case 'review':
        return (
          <Suspense fallback={<StageFallback />}>
            <ReviewConsultation />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<StageFallback />}>
            <Symptoms goToLabs={() => setCurrentStage(stages[1])} />
          </Suspense>
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
              <Suspense fallback={<StageFallback />}>
                <ConsultationHistory />
              </Suspense>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  update || isLoadingAppointment
                    ? 'mb-6 border-t border-b border-gray-300 bg-gray-100 py-4 font-bold text-gray-500 sm:mb-8 sm:py-6'
                    : 'sticky top-0 z-50 mb-6 border-t border-b border-gray-300 bg-gray-100 py-4 font-bold text-gray-500 sm:mb-8 sm:py-6',
                  'flex flex-col gap-4 lg:flex-row lg:justify-between',
                )}
                id="clip"
              >
                <div className="scrollbar-hide flex gap-1 overflow-x-auto sm:gap-0">
                  {stages.map((stage, index) => (
                    <button
                      onClick={() => setCurrentStage(stage)}
                      key={stage}
                      className={cn(
                        index === 0 || index === stages.length - 1 ? '' : 'in-between',
                        index === stages.length - 1 && 'last-crumb rounded-r-2xl sm:rounded-r-4xl',
                        index === 0 && 'first-crumb rounded-l-2xl sm:rounded-l-4xl',
                        'cursor-pointer',
                        currentStage === stage ||
                          stages.indexOf(currentStage) > stages.indexOf(stage)
                          ? 'bg-primary-light text-primary'
                          : 'bg-gray-200',
                        'inline-block px-6 py-3 text-xs whitespace-nowrap sm:py-[18px] sm:text-sm md:px-8',
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
