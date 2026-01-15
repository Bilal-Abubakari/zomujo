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
import { IPatientSymptomMap, SymptomsType } from '@/types/consultation.interface';
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
import { IAppointment } from '@/types/appointment.interface';
import { ILab } from '@/types/labs.interface';
import { IRadiology } from '@/types/radiology.interface';
import { IDiagnosis } from '@/types/medical.interface';

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

  const generateHeader = (appointment: IAppointment, doctorName: string): string =>
    [
      `CONSULTATION NOTES\n`,
      `Date: ${new Date(appointment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}\n`,
      `Patient: ${appointment.patient.firstName} ${appointment.patient.lastName}\n`,
      `Doctor: ${doctorName}\n`,
      `\n${'='.repeat(80)}\n\n`,
    ].join('');

  const generateChiefComplaints = (appointment: IAppointment, complaints?: string[]): string => {
    if (!complaints || complaints.length === 0) {
      return '';
    }
    const lines: string[] = [`CHIEF COMPLAINTS:\n`];
    complaints.forEach((complaint) => {
      const duration = appointment.symptoms?.complaints?.find(
        (c) => c.complaint === complaint,
      )?.duration;
      lines.push(
        `• ${complaint}${duration ? ` (Duration: ${duration.value} ${duration.type})` : ''}\n`,
      );
    });
    lines.push('\n');
    return lines.join('');
  };

  const generateSymptoms = (symptoms?: IPatientSymptomMap): string => {
    if (!symptoms || Object.keys(symptoms).length === 0) {
      return '';
    }
    const lines: string[] = [
      `HISTORY OF PRESENT ILLNESS:\n`,
      `The patient presents with the following symptoms:\n\n`,
    ];
    Object.keys(symptoms).forEach((key) => {
      const symptomType = key as SymptomsType;
      const symptomList = symptoms[symptomType];
      if (symptomList && symptomList.length > 0) {
        lines.push(`${capitalize(symptomType)} System:\n`);
        symptomList.forEach(({ name, notes }: { name: string; notes?: string }) => {
          lines.push(`  • ${name}${notes ? ` - ${notes}` : ''}\n`);
        });
        lines.push('\n');
      }
    });
    return lines.join('');
  };

  const generateMedications = (appointment: IAppointment): string => {
    if (!appointment.symptoms?.medicinesTaken || appointment.symptoms.medicinesTaken.length === 0) {
      return '';
    }
    const lines: string[] = [`MEDICATIONS PREVIOUSLY TAKEN:\n`];
    appointment.symptoms.medicinesTaken.forEach(
      ({ name, dose }: { name: string; dose: string }) => {
        lines.push(`• ${name} - ${dose}\n`);
      },
    );
    lines.push('\n');
    return lines.join('');
  };

  const generateLabs = (requestedLabs?: ILab[], conductedLabs?: ILab[]): string => {
    if (
      (!requestedLabs || requestedLabs.length === 0) &&
      (!conductedLabs || conductedLabs.length === 0)
    ) {
      return '';
    }
    const lines: string[] = [`LABORATORY INVESTIGATIONS:\n`];
    if (requestedLabs && requestedLabs.length > 0) {
      lines.push(`Requested Tests:\n`);
      requestedLabs.forEach(
        ({
          testName,
          specimen,
          fasting,
          notes,
        }: {
          testName: string;
          specimen: string;
          fasting: boolean;
          notes?: string;
        }) => {
          lines.push(
            `  • ${testName} (Specimen: ${specimen}, Fasting: ${fasting ? 'Yes' : 'No'})${notes ? ` - ${notes}` : ''}\n`,
          );
        },
      );
      lines.push('\n');
    }
    if (conductedLabs && conductedLabs.length > 0) {
      lines.push(`Completed Tests:\n`);
      conductedLabs.forEach(({ testName, notes }: { testName: string; notes?: string }) => {
        lines.push(`  • ${testName}${notes ? ` - ${notes}` : ''}\n`);
      });
      lines.push('\n');
    }
    return lines.join('');
  };

  const generateRadiology = (radiology?: IRadiology): string => {
    if (!radiology) {
      return '';
    }
    const lines: string[] = [
      `RADIOLOGY INVESTIGATIONS:\n`,
      `Procedure Request: ${radiology.procedureRequest}\n`,
      `Clinical History: ${radiology.history}\n\n`,
    ];
    const requestedTests = radiology.tests.filter(({ fileUrl }: { fileUrl?: string }) => !fileUrl);
    const completedTests = radiology.tests.filter(({ fileUrl }: { fileUrl?: string }) => fileUrl);
    if (requestedTests.length > 0) {
      lines.push(`Requested Studies:\n`);
      requestedTests.forEach(({ testName }: { testName: string }) => {
        lines.push(`  • ${testName}\n`);
      });
      lines.push('\n');
    }
    if (completedTests.length > 0) {
      lines.push(`Completed Studies:\n`);
      completedTests.forEach(({ testName }: { testName: string }) => {
        lines.push(`  • ${testName}\n`);
      });
      lines.push('\n');
    }
    if (radiology.questions && radiology.questions.length > 0) {
      lines.push(`Clinical Questions:\n`);
      radiology.questions.forEach((question: string) => {
        lines.push(`  • ${question}\n`);
      });
      lines.push('\n');
    }
    return lines.join('');
  };

  const generateDiagnoses = (diagnoses: IDiagnosis[]): string => {
    if (!diagnoses || diagnoses.length === 0) {
      return '';
    }
    const lines: string[] = [`ASSESSMENT AND DIAGNOSIS:\n`];
    diagnoses.forEach(({ name, prescriptions, notes }, index: number) => {
      let diagnosisText = `${index + 1}. ${name}\n`;
      if (notes) {
        diagnosisText += `   Notes: ${notes}\n`;
      }
      if (prescriptions && prescriptions.length > 0) {
        diagnosisText += `   Treatment Plan:\n`;
        prescriptions.forEach(({ name: drugName, doses, doseRegimen, numOfDays, route }) => {
          diagnosisText += `   • ${drugName} ${doses} - ${doseRegimen} for ${numOfDays} days (${route})\n`;
        });
      }
      diagnosisText += '\n';
      lines.push(diagnosisText);
    });
    return lines.join('');
  };

  const generatePlan = (): string =>
    `PLAN:\n[Doctor can add additional recommendations, follow-up instructions, or notes here]\n\n`;

  const generateSignature = (doctorName: string): string =>
    `\n${'='.repeat(80)}\n\nSigned by: Dr. ${doctorName}\nDate: ${new Date().toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    )}\n`;

  // Generate formatted doctor's notes from appointment data
  const generateDoctorNotes = useCallback((): string => {
    if (!appointment) {
      return '';
    }

    return [
      generateHeader(appointment, doctorName),
      generateChiefComplaints(appointment, complaints),
      generateSymptoms(symptoms),
      generateMedications(appointment),
      generateLabs(requestedLabs, conductedLabs),
      generateRadiology(radiology),
      generateDiagnoses(diagnoses),
      generatePlan(),
      generateSignature(doctorName),
    ].join('');
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
