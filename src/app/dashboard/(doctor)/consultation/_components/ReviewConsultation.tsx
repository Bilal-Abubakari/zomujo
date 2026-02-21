import React, { JSX, useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  selectAppointment,
  selectAppointmentRadiology,
  selectComplaints,
  selectConductedLabs,
  selectConductedRadiology,
  selectDiagnoses,
  selectPatientSymptoms,
  selectRequestedLabs,
  selectRequestedRadiology,
  selectPrescriptions,
  selectHistoryNotes,
  selectAppointmentLabs,
} from '@/lib/features/appointments/appointmentSelector';
import { FileText, LayoutGrid } from 'lucide-react';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { IReferral } from '@/types/consultation.interface';
import { showErrorToast } from '@/lib/utils';
import { Modal } from '@/components/ui/dialog';
import Signature from '@/components/signature/signature';
import { selectDoctorSignature } from '@/lib/features/doctors/doctorsSelector';
import { startConsultation } from '@/lib/features/appointments/consultation/consultationThunk';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { ReviewHeader } from './ReviewHeader';
import { SignatureAlert } from './SignatureAlert';
import { CardsView } from './CardsView';
import { DoctorNotesView } from './DoctorNotesView';
import { IncompleteConsultationModal } from './IncompleteConsultationModal';
import { ReferralModal } from './ReferralModal';
import {
  generateChiefComplaints,
  generateDiagnosesAndTreatment,
  generateHeader,
  generateLabs,
  generateMedications,
  generatePlan,
  generateRadiology,
  generateSignature,
  generateSymptoms,
} from '@/lib/utils/doctorNotesUtils';

interface ReviewConsultationProps {
  isPastConsultation?: boolean;
}

const ReviewConsultation = ({
  isPastConsultation = false,
}: ReviewConsultationProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const doctorSignature = useAppSelector(selectDoctorSignature);
  const diagnoses = useAppSelector(selectDiagnoses);
  const prescriptions = useAppSelector(selectPrescriptions); // Imported selectPrescriptions
  const complaints = useAppSelector(selectComplaints);
  const doctorName = useAppSelector(selectUserName);
  const symptoms = useAppSelector(selectPatientSymptoms);
  const requestedLabs = useAppSelector(selectRequestedLabs);
  const lab = useAppSelector(selectAppointmentLabs);
  const conductedLabs = useAppSelector(selectConductedLabs);
  const requestedRadiology = useAppSelector(selectRequestedRadiology);
  const radiology = useAppSelector(selectAppointmentRadiology);
  const conductedRadiology = useAppSelector(selectConductedRadiology);
  const appointment = useAppSelector(selectAppointment);
  const historyNotes = useAppSelector(selectHistoryNotes);
  const [openAddSignature, setOpenAddSignature] = useState(false);
  const [addSignature, setAddSignature] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [isStartingConsultation, setIsStartingConsultation] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false); // Add state
  const [referrals, setReferrals] = useState<IReferral[]>([]); // Add state for referrals
  const [doctorNotes, setDoctorNotes] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'notes'>('cards');

  const hasSignature = !!doctorSignature;
  const isConsultationIncomplete = appointment?.status !== AppointmentStatus.Completed;

  // Generate formatted doctor's notes from appointment data
  const generateDoctorNotes = useCallback((): string => {
    if (!appointment) {
      return '';
    }

    return [
      generateHeader(appointment, doctorName),
      generateChiefComplaints(appointment, complaints),
      generateSymptoms(symptoms, historyNotes),
      generateMedications(appointment),
      generateLabs(requestedLabs, conductedLabs),
      generateRadiology(radiology),
      generateDiagnosesAndTreatment(
        diagnoses,
        prescriptions || appointment.prescriptions,
        referrals,
      ),
      generatePlan(),
      generateSignature(doctorName),
    ].join('');
  }, [
    appointment,
    complaints,
    symptoms,
    historyNotes,
    requestedLabs,
    conductedLabs,
    radiology,
    diagnoses,
    prescriptions,
    referrals,
    doctorName,
  ]);

  const handleStartConsultation = async (): Promise<void> => {
    if (!appointment?.id) {
      return;
    }

    setIsStartingConsultation(true);
    const result = await dispatch(startConsultation(appointment.id)).unwrap();

    if (showErrorToast(result)) {
      toast(result);
    } else {
      router.push(`/dashboard/consultation/${appointment.patient.id}/${appointment.id}`);
    }
    setIsStartingConsultation(false);
  };

  // Check if consultation is incomplete when viewing past consultation
  useEffect(() => {
    if (isPastConsultation && isConsultationIncomplete && appointment) {
      setShowIncompleteModal(true);
    }
  }, [isPastConsultation, isConsultationIncomplete, appointment]);

  useEffect(() => {
    if (addSignature) {
      setOpenAddSignature(true);
    }
  }, [addSignature]);

  useEffect(() => {
    if (!openAddSignature) {
      setAddSignature(false);
    }
  }, [openAddSignature]);

  // Generate doctor's notes when appointment data is available
  useEffect(() => {
    if (appointment && doctorName) {
      const notes = [
        generateHeader(appointment, doctorName),
        generateChiefComplaints(appointment, complaints),
        generateSymptoms(symptoms, historyNotes),
        generateMedications(appointment),
        generateLabs(requestedLabs, conductedLabs),
        generateRadiology(radiology),
        generateDiagnosesAndTreatment(
          diagnoses,
          prescriptions || appointment.prescriptions,
          referrals,
        ),
      ].join('');
      setDoctorNotes(notes);
    }
  }, [
    appointment,
    doctorName,
    complaints,
    symptoms,
    historyNotes,
    requestedLabs,
    conductedLabs,
    radiology,
    diagnoses,
    prescriptions,
    referrals,
  ]);

  return (
    <>
      <Modal
        setState={setOpenAddSignature}
        open={openAddSignature}
        content={
          <Signature
            signatureAdded={() => setOpenAddSignature(false)}
            hasExistingSignature={hasSignature}
          />
        }
        showClose={true}
      />

      <IncompleteConsultationModal
        open={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        appointment={appointment}
        isStartingConsultation={isStartingConsultation}
        onStartConsultation={handleStartConsultation}
      />

      <ReferralModal
        open={showReferralModal}
        patientId={appointment?.patient?.id}
        onClose={() => setShowReferralModal(false)}
        onSave={(referral) => setReferrals((prev) => [...prev, referral])}
      />

      <div className="space-y-6 pb-20">
        <ReviewHeader
          isPastConsultation={isPastConsultation}
          hasSignature={hasSignature}
          addSignature={addSignature}
          onSignatureToggle={() => setAddSignature((prev) => !prev)}
          onAddReferral={() => setShowReferralModal(true)}
        />

        {!isPastConsultation && (
          <SignatureAlert
            hasSignature={hasSignature}
            onAddSignature={() => setOpenAddSignature(true)}
          />
        )}

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'notes')}>
          <TabsList className="grid w-full grid-cols-2 lg:w-100">
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Cards View
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Doctor&apos;s Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-6">
            {viewMode === 'cards' ? (
              <CardsView
                doctorName={doctorName}
                complaints={complaints}
                symptoms={symptoms}
                historyNotes={historyNotes}
                appointment={appointment}
                requestedLabs={requestedLabs}
                conductedLabs={conductedLabs}
                radiology={radiology}
                requestedRadiology={requestedRadiology}
                conductedRadiology={conductedRadiology}
                diagnoses={diagnoses}
                prescriptions={prescriptions || appointment?.prescriptions || []}
                referrals={referrals}
                onRemoveReferral={(index) =>
                  setReferrals((prev) => prev.filter((_, i) => i !== index))
                }
                labInstructions={lab?.instructions}
                labClinicalHistory={lab?.history}
              />
            ) : (
              <DoctorNotesView
                doctorNotes={doctorNotes}
                onNotesChange={setDoctorNotes}
                appointmentId={appointment?.id ?? ''}
                onResetNotes={() => setDoctorNotes(appointment?.notes || generateDoctorNotes())} // Fix props mismatch
              />
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <DoctorNotesView
              doctorNotes={doctorNotes}
              onNotesChange={setDoctorNotes}
              onResetNotes={() => setDoctorNotes(appointment?.notes || generateDoctorNotes())}
              appointmentId={appointment?.id ?? ''}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ReviewConsultation;
