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
} from '@/lib/features/appointments/appointmentSelector';
import { FileText, LayoutGrid } from 'lucide-react';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { SymptomsType } from '@/types/consultation.interface';
import { capitalize, showErrorToast } from '@/lib/utils';
import { Modal } from '@/components/ui/dialog';
import Signature from '@/components/signature/signature';
import { selectDoctorSignature } from '@/lib/features/doctors/doctorsSelector';
import {
  generatePrescription,
  startConsultation,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { ReviewHeader } from './ReviewHeader';
import { SignatureAlert } from './SignatureAlert';
import { CardsView } from './CardsView';
import { DoctorNotesView } from './DoctorNotesView';
import { IncompleteConsultationModal } from './IncompleteConsultationModal';
import { PrescriptionNotesModal } from './PrescriptionNotesModal';

interface ReviewConsultationProps {
  isPastConsultation?: boolean;
}

const ReviewConsultation = ({
  isPastConsultation = false,
}: ReviewConsultationProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const router = useRouter();
  const doctorSignature = useAppSelector(selectDoctorSignature);
  const diagnoses = useAppSelector(selectDiagnoses);
  const complaints = useAppSelector(selectComplaints);
  const doctorName = useAppSelector(selectUserName);
  const symptoms = useAppSelector(selectPatientSymptoms);
  const requestedLabs = useAppSelector(selectRequestedLabs);
  const conductedLabs = useAppSelector(selectConductedLabs);
  const requestedRadiology = useAppSelector(selectRequestedRadiology);
  const radiology = useAppSelector(selectAppointmentRadiology);
  const conductedRadiology = useAppSelector(selectConductedRadiology);
  const appointment = useAppSelector(selectAppointment);
  const [openAddSignature, setOpenAddSignature] = useState(false);
  const [addSignature, setAddSignature] = useState(false);
  const [isSendingPrescription, setIsSendingPrescription] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [isStartingConsultation, setIsStartingConsultation] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'notes'>('cards');

  const hasSignature = !!doctorSignature;
  const isConsultationIncomplete = appointment?.status !== AppointmentStatus.Completed;

  // Generate formatted doctor's notes from appointment data
  const generateDoctorNotes = useCallback((): string => {
    if (!appointment) {
      return '';
    }

    const sections: string[] = [];

    // Header
    sections.push(`CONSULTATION NOTES\n`);
    sections.push(
      `Date: ${new Date(appointment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}\n`,
    );
    sections.push(`Patient: ${appointment.patient.firstName} ${appointment.patient.lastName}\n`);
    sections.push(`Doctor: ${doctorName}\n`);
    sections.push(`\n${'='.repeat(80)}\n\n`);

    // Chief Complaints
    if (complaints && complaints.length > 0) {
      sections.push(`CHIEF COMPLAINTS:\n`);
      complaints.forEach((complaint) => {
        const duration = appointment.symptoms?.complaints?.find(
          (c) => c.complaint === complaint,
        )?.duration;
        if (duration) {
          sections.push(`• ${complaint} (Duration: ${duration.value} ${duration.type})\n`);
        } else {
          sections.push(`• ${complaint}\n`);
        }
      });
      sections.push('\n');
    }

    // History of Present Illness / Symptoms
    if (symptoms && Object.keys(symptoms).length > 0) {
      sections.push(`HISTORY OF PRESENT ILLNESS:\n`);
      sections.push(`The patient presents with the following symptoms:\n\n`);

      Object.keys(symptoms).forEach((key) => {
        const symptomType = key as SymptomsType;
        const symptomList = symptoms[symptomType];
        if (symptomList && symptomList.length > 0) {
          sections.push(`${capitalize(symptomType)} System:\n`);
          symptomList.forEach(({ name, notes }) => {
            sections.push(`  • ${name}${notes ? ` - ${notes}` : ''}\n`);
          });
          sections.push('\n');
        }
      });
    }

    // Medications Previously Taken
    if (appointment.symptoms?.medicinesTaken && appointment.symptoms.medicinesTaken.length > 0) {
      sections.push(`MEDICATIONS PREVIOUSLY TAKEN:\n`);
      appointment.symptoms.medicinesTaken.forEach(({ name, dose }) => {
        sections.push(`• ${name} - ${dose}\n`);
      });
      sections.push('\n');
    }

    // Laboratory Tests
    if (
      (requestedLabs && requestedLabs.length > 0) ||
      (conductedLabs && conductedLabs.length > 0)
    ) {
      sections.push(`LABORATORY INVESTIGATIONS:\n`);

      if (requestedLabs && requestedLabs.length > 0) {
        sections.push(`Requested Tests:\n`);
        requestedLabs.forEach(({ testName, specimen, fasting, notes }) => {
          sections.push(
            `  • ${testName} (Specimen: ${specimen}, Fasting: ${fasting ? 'Yes' : 'No'})`,
          );
          if (notes) {
            sections.push(` - ${notes}`);
          }
          sections.push('\n');
        });
        sections.push('\n');
      }

      if (conductedLabs && conductedLabs.length > 0) {
        sections.push(`Completed Tests:\n`);
        conductedLabs.forEach(({ testName, notes }) => {
          sections.push(`  • ${testName}${notes ? ` - ${notes}` : ''}\n`);
        });
        sections.push('\n');
      }
    }

    // Radiology Tests
    if (radiology) {
      sections.push(`RADIOLOGY INVESTIGATIONS:\n`);
      sections.push(`Procedure Request: ${radiology.procedureRequest}\n`);
      sections.push(`Clinical History: ${radiology.history}\n\n`);

      const requestedTests = radiology.tests.filter(({ fileUrl }) => !fileUrl);
      const completedTests = radiology.tests.filter(({ fileUrl }) => fileUrl);

      if (requestedTests.length > 0) {
        sections.push(`Requested Studies:\n`);
        requestedTests.forEach(({ testName }) => {
          sections.push(`  • ${testName}\n`);
        });
        sections.push('\n');
      }

      if (completedTests.length > 0) {
        sections.push(`Completed Studies:\n`);
        completedTests.forEach(({ testName }) => {
          sections.push(`  • ${testName}\n`);
        });
        sections.push('\n');
      }

      if (radiology.questions && radiology.questions.length > 0) {
        sections.push(`Clinical Questions:\n`);
        radiology.questions.forEach((question) => {
          sections.push(`  • ${question}\n`);
        });
        sections.push('\n');
      }
    }

    // Diagnosis and Treatment Plan
    if (diagnoses && diagnoses.length > 0) {
      sections.push(`ASSESSMENT AND DIAGNOSIS:\n`);
      diagnoses.forEach(({ name, prescriptions, notes }, index) => {
        sections.push(`${index + 1}. ${name}\n`);
        if (notes) {
          sections.push(`   Notes: ${notes}\n`);
        }

        if (prescriptions && prescriptions.length > 0) {
          sections.push(`   Treatment Plan:\n`);
          prescriptions.forEach(({ name: drugName, doses, doseRegimen, numOfDays, route }) => {
            sections.push(
              `   • ${drugName} ${doses} - ${doseRegimen} for ${numOfDays} days (${route})\n`,
            );
          });
        }
        sections.push('\n');
      });
    }

    // Additional Notes/Plan
    sections.push(`PLAN:\n`);
    sections.push(
      `[Doctor can add additional recommendations, follow-up instructions, or notes here]\n\n`,
    );

    // Signature
    sections.push(`\n${'='.repeat(80)}\n`);
    sections.push(`\nSigned by: Dr. ${doctorName}\n`);
    sections.push(
      `Date: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}\n`,
    );

    return sections.join('');
  }, [
    appointment,
    complaints,
    symptoms,
    requestedLabs,
    conductedLabs,
    radiology,
    diagnoses,
    doctorName,
  ]);

  const sendPrescription = async (notes: string): Promise<void> => {
    setIsSendingPrescription(true);
    const result = await dispatch(
      generatePrescription({ appointmentId: String(params.appointmentId), notes }),
    ).unwrap();
    toast(result);
    setIsSendingPrescription(false);
    setPrescriptionNotes('');
  };

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
    if (appointment && !doctorNotes) {
      setDoctorNotes(appointment.notes || generateDoctorNotes());
    }
  }, [appointment, doctorNotes, generateDoctorNotes]);

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

      <PrescriptionNotesModal
        open={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        prescriptionNotes={prescriptionNotes}
        onNotesChange={setPrescriptionNotes}
        isSendingPrescription={isSendingPrescription}
        onSendPrescription={() => {
          setShowPrescriptionModal(false);
          void sendPrescription(prescriptionNotes);
        }}
      />

      <div className="space-y-6 pb-20">
        <ReviewHeader
          isPastConsultation={isPastConsultation}
          hasSignature={hasSignature}
          addSignature={addSignature}
          isSendingPrescription={isSendingPrescription}
          onSignatureToggle={() => setAddSignature((prev) => !prev)}
          onSendPrescription={() => setShowPrescriptionModal(true)}
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
            <CardsView
              appointment={appointment}
              complaints={complaints}
              symptoms={symptoms}
              requestedLabs={requestedLabs}
              conductedLabs={conductedLabs}
              radiology={radiology}
              requestedRadiology={requestedRadiology}
              conductedRadiology={conductedRadiology}
              diagnoses={diagnoses}
              doctorName={doctorName}
            />
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
