'use client';
import { JSX, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';
import { useParams, useRouter } from 'next/navigation';
import { useQueryParam } from '@/hooks/useQueryParam';
import { startConsultation } from '@/lib/features/appointments/consultation/consultationThunk';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { showErrorToast } from '@/lib/utils';
import ExpiredConsultationView from './ExpiredConsultationView';
import { FileText, Loader2, User, Clock } from 'lucide-react';
import { getPatientRecords } from '@/lib/features/records/recordsThunk';
import { toast, Toast } from '@/hooks/use-toast';
import PatientConsultationHistory from './PatientConsultationHistory';
import ConsultationViewSheet from './ConsultationViewSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PatientCard = dynamic(() => import('@/app/dashboard/_components/patient/patientCard'), {
  loading: () => <CardFallback />,
  ssr: false,
});
const PatientConditionsCard = dynamic(
  () => import('@/app/dashboard/_components/patient/patientConditionsCard'),
  { loading: () => <CardFallback />, ssr: false },
);
const PatientSurgeriesCard = dynamic(
  () => import('@/app/dashboard/_components/patient/patientSurgeriesCard'),
  { loading: () => <CardFallback />, ssr: false },
);
const PatientFamilyMembersCard = dynamic(
  () => import('@/app/dashboard/_components/patient/PatientFamilyMembersCard'),
  { loading: () => <CardFallback />, ssr: false },
);
const PatientLifestyleCard = dynamic(
  () => import('@/app/dashboard/_components/patient/patientLifestyleCard'),
  { loading: () => <CardFallback />, ssr: false },
);
const PatientAllergiesCard = dynamic(
  () => import('@/app/dashboard/_components/patient/patientAllergiesCard'),
  { loading: () => <CardFallback />, ssr: false },
);

const CardFallback = (): JSX.Element => (
  <div className="flex items-center justify-center rounded-lg border border-gray-200 p-8">
    <Loader2 className="animate-spin" size={24} />
  </div>
);

const PatientOverview = (): JSX.Element => {
  const recordId = useAppSelector(selectRecordId);
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { getQueryParam } = useQueryParam();
  const dispatch = useAppDispatch();
  const [isStartingConsultation, setIsStartingConsultation] = useState(false);
  const [consultationExpired, setConsultationExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [showConsultationSheet, setShowConsultationSheet] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const redirectToConsultation = async (): Promise<void> => {
    const appointmentId = getQueryParam('appointmentId');
    if (!appointmentId) {
      return;
    }

    setIsStartingConsultation(true);
    await dispatch(startConsultation(appointmentId)).unwrap();
    router.push(`/dashboard/consultation/${patientId}/${appointmentId}`);
  };

  const handleViewPastConsultation = (): void => {
    const appointmentId = getQueryParam('appointmentId');
    if (appointmentId) {
      router.push(`/dashboard/consultation/review?appointmentId=${appointmentId}`);
    }
  };

  const handleGoBack = (): void => {
    setConsultationExpired(false);
    router.push('/dashboard/appointment');
  };

  const handleViewConsultation = (appointmentId: string): void => {
    setSelectedConsultationId(appointmentId);
    setShowConsultationSheet(true);
  };

  useEffect(() => {
    const fetchRecords = async (): Promise<void> => {
      if (!patientId) {
        return;
      }

      setIsLoading(true);
      const response = await dispatch(getPatientRecords(patientId)).unwrap();
      if (showErrorToast(response)) {
        toast(response as Toast);
      }
      setIsLoading(false);
    };

    void fetchRecords();
  }, [dispatch, patientId]);

  if (consultationExpired) {
    return (
      <ExpiredConsultationView
        onViewPastConsultation={handleViewPastConsultation}
        onGoBack={handleGoBack}
      />
    );
  }

  return (
    <div className="relative">
      {isStartingConsultation && <LoadingOverlay message="Starting consultation..." />}
      {isLoading && <LoadingOverlay message="Loading patient records..." />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="self-center text-xl font-bold">Patient Record</span>
        {getQueryParam('appointmentId') && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleViewPastConsultation}
              variant="outline"
              child={
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  View Consultation
                </>
              }
            />
            <Button
              onClick={redirectToConsultation}
              child="Start Consultation"
              disabled={isStartingConsultation}
            />
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview" className="gap-2">
            <User className="h-4 w-4" />
            Patient Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="h-4 w-4" />
            Consultation Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 gap-4 justify-self-center md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            <div className="space-y-4">
              <PatientCard />
              <PatientSurgeriesCard recordId={recordId} />
            </div>
            <div className="space-y-4">
              <PatientFamilyMembersCard recordId={recordId} />
              <PatientAllergiesCard recordId={recordId} />
            </div>
            <div className="space-y-4">
              <PatientConditionsCard recordId={recordId} />
              <PatientLifestyleCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <PatientConsultationHistory
            patientId={patientId}
            onViewConsultation={handleViewConsultation}
            currentAppointmentId={getQueryParam('appointmentId') || undefined}
          />
        </TabsContent>
      </Tabs>

      {/* Consultation View Modal */}
      <ConsultationViewSheet
        open={showConsultationSheet}
        onOpenChange={setShowConsultationSheet}
        appointmentId={selectedConsultationId}
      />
    </div>
  );
};

export default PatientOverview;
