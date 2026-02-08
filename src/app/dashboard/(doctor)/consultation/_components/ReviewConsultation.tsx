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
} from '@/lib/features/appointments/appointmentSelector';
import { FileText, LayoutGrid } from 'lucide-react';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { IPatientSymptomMap, SymptomsType, IReferral } from '@/types/consultation.interface';
import { capitalize, showErrorToast } from '@/lib/utils';
import { Modal } from '@/components/ui/dialog';
import Signature from '@/components/signature/signature';
import { selectDoctorSignature } from '@/lib/features/doctors/doctorsSelector';
import {
  generatePrescription,
  startConsultation,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams, useRouter } from 'next/navigation';
import { Toast, toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { ReviewHeader } from './ReviewHeader';
import { SignatureAlert } from './SignatureAlert';
import { CardsView } from './CardsView';
import { DoctorNotesView } from './DoctorNotesView';
import { IncompleteConsultationModal } from './IncompleteConsultationModal';
import { PrescriptionNotesModal } from './PrescriptionNotesModal';
import { ReferralModal } from './ReferralModal';
import { IAppointment } from '@/types/appointment.interface';
import { ILaboratoryRequest } from '@/types/labs.interface';
import { IRadiology } from '@/types/radiology.interface';
import { IDiagnosis, IPrescription } from '@/types/medical.interface';
import { ToastStatus } from '@/types/shared.enum';

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
  const prescriptions = useAppSelector(selectPrescriptions); // Imported selectPrescriptions
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
  const [showReferralModal, setShowReferralModal] = useState(false); // Add state
  const [referrals, setReferrals] = useState<IReferral[]>([]); // Add state for referrals
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
      let complaintLine = `• ${complaint}`;
      if (duration) {
        complaintLine += ` (Duration: ${duration.value} ${duration.type})`;
      }
      complaintLine += '\n';
      lines.push(complaintLine);
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
          let symptomLine = `  • ${name}`;
          if (notes) {
            symptomLine += ` - ${notes}`;
          }
          symptomLine += '\n';
          lines.push(symptomLine);
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

  const generateLabs = (
    requestedLabs?: ILaboratoryRequest[],
    conductedLabs?: ILaboratoryRequest[],
  ): string => {
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
          let labLine = `  • ${testName} (Specimen: ${specimen}, Fasting: ${fasting ? 'Yes' : 'No'})`;
          if (notes) {
            labLine += ` - ${notes}`;
          }
          labLine += '\n';
          lines.push(labLine);
        },
      );
      lines.push('\n');
    }
    if (conductedLabs && conductedLabs.length > 0) {
      lines.push(`Completed Tests:\n`);
      conductedLabs.forEach(({ testName, notes }: { testName: string; notes?: string }) => {
        let conductedLabLine = `  • ${testName}`;
        if (notes) {
          conductedLabLine += ` - ${notes}`;
        }
        conductedLabLine += '\n';
        lines.push(conductedLabLine);
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

  const generateDiagnosesAndTreatment = (
    diagnoses: IDiagnosis[],
    prescriptions: IPrescription[],
    referrals: IReferral[],
  ): string => {
    const lines: string[] = [];
    if (diagnoses && diagnoses.length > 0) {
      lines.push(`DIAGNOSIS:\n`);
      diagnoses.forEach(({ name, status, notes }) => {
        let line = `• ${name} (${status})`;
        if (notes) {
          line += `\n  Notes: ${notes}`;
        }
        lines.push(line + '\n');
      });
      lines.push('\n');
    }

    if (prescriptions && prescriptions.length > 0) {
      lines.push(`TREATMENT / PRESCRIPTIONS:\n`);
      prescriptions.forEach(({ name, doses, route, doseRegimen, numOfDays }) => {
        lines.push(`• ${name} ${doses} via ${route} (${doseRegimen}) for ${numOfDays} days\n`);
      });
      lines.push('\n');
    }

    if (referrals && referrals.length > 0) {
      lines.push(`REFERRALS:\n`);
      referrals.forEach((referral) => {
        if (referral.type === 'internal' && referral.doctor) {
          lines.push(
            `• Referred to Dr. ${referral.doctor.firstName} ${referral.doctor.lastName} (${referral.doctor.specializations?.[0] || 'General'}) at ${'Zomujo Platform'}\n`,
          );
        } else {
          lines.push(`• Referred to ${referral.doctorName} at ${referral.facility}\n`);
          if (referral.notes) {
            lines.push(`  Note: ${referral.notes}\n`);
          }
        }
      });
      lines.push('\n');
    }

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
    requestedLabs,
    conductedLabs,
    radiology,
    diagnoses,
    prescriptions,
    referrals,
    doctorName,
  ]);

  const sendPrescription = async (notes: string): Promise<void> => {
    setIsSendingPrescription(true);
    const result = await dispatch(
      generatePrescription({ appointmentId: String(params.appointmentId), notes }),
    ).unwrap();
    if (showErrorToast(result)) {
      toast(result as Toast);
    } else {
      toast({
        title: ToastStatus.Success,
        description: 'Prescription sent successfully!',
        variant: 'success',
      });
    }
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
    if (appointment && doctorName) {
      const notes = [
        generateHeader(appointment, doctorName),
        generateChiefComplaints(appointment, complaints),
        generateSymptoms(symptoms),
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

      <ReferralModal
        open={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        onSave={(referral) => setReferrals((prev) => [...prev, referral])}
      />

      <div className="space-y-6 pb-20">
        <ReviewHeader
          isPastConsultation={isPastConsultation}
          hasSignature={hasSignature}
          addSignature={addSignature}
          isSendingPrescription={isSendingPrescription}
          onSignatureToggle={() => setAddSignature((prev) => !prev)}
          onSendPrescription={() => setShowPrescriptionModal(true)}
          onAddReferral={() => setShowReferralModal(true)} // Pass onAddReferral
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
                appointment={appointment}
                requestedLabs={requestedLabs}
                conductedLabs={conductedLabs}
                radiology={radiology}
                requestedRadiology={requestedRadiology}
                conductedRadiology={conductedRadiology}
                diagnoses={diagnoses}
                prescriptions={prescriptions || appointment?.prescriptions || []}
                referrals={referrals} // Pass referrals
                onRemoveReferral={(index) =>
                  setReferrals((prev) => prev.filter((_, i) => i !== index))
                } // Pass remove handler
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
