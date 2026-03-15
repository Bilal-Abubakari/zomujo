import React, { JSX, useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  selectAppointment,
  selectAppointmentRadiology,
  selectComplaints,
  selectDiagnoses,
  selectPatientSymptoms,
  selectRequestedLabs,
  selectPrescriptions,
  selectHistoryNotes,
  selectAppointmentLabs,
  selectAppointmentLinkId,
  selectIsFollowUp,
} from '@/lib/features/appointments/appointmentSelector';
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Eye,
  FileText,
  GitMerge,
  LayoutGrid,
  Pill,
  Stethoscope,
  User,
} from 'lucide-react';
import { selectUserName, selectUserId } from '@/lib/features/auth/authSelector';
import { IReferral } from '@/types/consultation.interface';
import { showErrorToast } from '@/lib/utils';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import {
  parseInitialNotes,
  parsePostInvestigationInitialNotes,
} from '@/constants/historyNotes.constant';
import ConsultationViewSheet from '@/app/dashboard/(doctor)/_components/ConsultationViewSheet';
import { IAppointment } from '@/types/appointment.interface';
import axios from '@/lib/axios';
import { IResponse } from '@/types/shared.interface';
import moment from 'moment';
import { StatusBadge } from '@/components/ui/statusBadge';
import { Badge } from '@/components/ui/badge';

interface ReviewConsultationProps {
  isPastConsultation?: boolean;
  goToPrevious?: () => void;
}

interface LinkedConsultationBannerProps {
  appointmentLinkId: string;
}

const LinkedConsultationBanner = ({
  appointmentLinkId,
}: LinkedConsultationBannerProps): JSX.Element => {
  const [linked, setLinked] = useState<IAppointment | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const { data } = await axios.get<IResponse<IAppointment>>(
          `appointments/${appointmentLinkId}`,
        );
        setLinked(data.data);
      } catch {
        setLinked(null);
      }
      setIsLoading(false);
    };
    void fetch();
  }, [appointmentLinkId]);

  const complaints = linked?.symptoms?.complaints?.map((c) => c.complaint) ?? [];

  const assessment = ((): string | null => {
    if (!linked?.historyNotes) {
      return null;
    }
    try {
      const parsed = parseInitialNotes(linked.historyNotes);
      return parsed.assessment?.trim() || null;
    } catch {
      return null;
    }
  })();

  const plan = ((): string | null => {
    if (!linked?.historyNotes) {
      return null;
    }
    try {
      const parsed = parseInitialNotes(linked.historyNotes);
      return parsed.plan?.trim() || null;
    } catch {
      return null;
    }
  })();

  const prescriptionCount = linked?.prescriptions?.length ?? 0;
  const diagnosisCount = linked?.diagnosis?.length ?? 0;

  let innerDetails;
  if (linked) {
    innerDetails = (
      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-green-700">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {moment(linked.slot.date).format('MMM DD, YYYY')}
        </span>
        <span className="text-green-400">·</span>
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          Dr. {linked.doctor.firstName} {linked.doctor.lastName}
        </span>
        {diagnosisCount > 0 && (
          <>
            <span className="text-green-400">·</span>
            <Badge className="border-green-200 bg-green-100 text-[10px] text-green-700">
              {diagnosisCount} diagnosis
            </Badge>
          </>
        )}
        {prescriptionCount > 0 && (
          <>
            <span className="text-green-400">·</span>
            <Badge className="border-green-200 bg-green-100 text-[10px] text-green-700">
              <Pill className="mr-0.5 h-2.5 w-2.5" />
              {prescriptionCount} Rx
            </Badge>
          </>
        )}
      </div>
    );
  } else {
    innerDetails = <p className="mt-0.5 text-xs text-green-600">Could not load details</p>;
  }

  const details = isLoading ? (
    <p className="mt-0.5 animate-pulse text-xs text-green-600">Loading details…</p>
  ) : (
    innerDetails
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-green-200 bg-green-50 shadow-sm">
        {/* Header row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
            <GitMerge className="h-4 w-4 text-green-700" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-green-800">Linked Past Consultation</p>
              {linked && <StatusBadge status={linked.status} />}
            </div>
            {details}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSheet(true)}
              className="border-green-300 text-xs text-green-700 hover:bg-green-100"
              child={
                <>
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Full View
                </>
              }
            />
            {linked && (complaints.length > 0 || assessment || plan) && (
              <button
                onClick={() => setIsExpanded((p) => !p)}
                className="flex items-center gap-1 rounded-lg border border-green-200 bg-white px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <>
                    Less <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Summary <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expandable summary panel */}
        {isExpanded && linked && (
          <div className="space-y-3 border-t border-green-200 bg-white/70 px-4 py-4">
            {complaints.length > 0 && (
              <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-amber-700 uppercase">
                  <Stethoscope className="h-3 w-3" />
                  Chief Complaints
                </p>
                <p className="text-sm text-gray-800">
                  {complaints.slice(0, 3).join(', ')}
                  {complaints.length > 3 && ` +${complaints.length - 3} more`}
                </p>
              </div>
            )}
            {assessment && (
              <div className="rounded-lg border border-teal-100 bg-teal-50/60 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-teal-700 uppercase">
                  <ClipboardCheck className="h-3 w-3" />
                  Assessment / Impression
                </p>
                <p className="text-sm leading-relaxed text-gray-800">
                  {assessment.length > 200 ? assessment.substring(0, 200) + '…' : assessment}
                </p>
              </div>
            )}
            {plan && (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-indigo-700 uppercase">
                  <ClipboardCheck className="h-3 w-3" />
                  Plan
                </p>
                <p className="text-sm leading-relaxed text-gray-800">
                  {plan.length > 160 ? plan.substring(0, 160) + '…' : plan}
                </p>
              </div>
            )}
            {linked.prescriptions && linked.prescriptions.length > 0 && (
              <div className="rounded-lg border border-purple-100 bg-purple-50/60 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-purple-700 uppercase">
                  <Pill className="h-3 w-3" />
                  Prescriptions ({linked.prescriptions.length})
                </p>
                <p className="text-sm text-gray-800">
                  {linked.prescriptions
                    .slice(0, 3)
                    .map((p) => p.name)
                    .filter(Boolean)
                    .join(', ')}
                  {linked.prescriptions.length > 3 && (
                    <span className="text-purple-600">
                      {' '}
                      +{linked.prescriptions.length - 3} more
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <ConsultationViewSheet
        open={showSheet}
        onOpenChange={setShowSheet}
        appointmentId={appointmentLinkId}
      />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const ReviewConsultation = ({
  isPastConsultation = false,
  goToPrevious,
}: ReviewConsultationProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const doctorSignature = useAppSelector(selectDoctorSignature);
  const diagnoses = useAppSelector(selectDiagnoses);
  const prescriptions = useAppSelector(selectPrescriptions); // Imported selectPrescriptions
  const complaints = useAppSelector(selectComplaints);
  const doctorName = useAppSelector(selectUserName);
  const currentDoctorId = useAppSelector(selectUserId);
  const symptoms = useAppSelector(selectPatientSymptoms);
  const requestedLabs = useAppSelector(selectRequestedLabs);
  const lab = useAppSelector(selectAppointmentLabs);
  const radiology = useAppSelector(selectAppointmentRadiology);
  const appointment = useAppSelector(selectAppointment);
  const historyNotes = useAppSelector(selectHistoryNotes);
  const appointmentLinkId = useAppSelector(selectAppointmentLinkId);
  const isFollowUp = useAppSelector(selectIsFollowUp);
  const [openAddSignature, setOpenAddSignature] = useState(false);
  const [addSignature, setAddSignature] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [isStartingConsultation, setIsStartingConsultation] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referrals, setReferrals] = useState<IReferral[]>([]);
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
      generateLabs(requestedLabs, lab?.fileUrls && lab.fileUrls.length > 0 ? lab.data : []),
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
    lab,
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
        generateLabs(requestedLabs, lab?.fileUrls && lab.fileUrls.length > 0 ? lab.data : []),
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
    lab,
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
        currentDoctorId={currentDoctorId}
      />

      <ReferralModal
        open={showReferralModal}
        patientId={appointment?.patient?.id}
        onClose={() => setShowReferralModal(false)}
        onSave={(referral) => setReferrals((prev) => [...prev, referral])}
      />

      <div className="space-y-6 pb-20">
        {appointmentLinkId && <LinkedConsultationBanner appointmentLinkId={appointmentLinkId} />}

        {isFollowUp && !appointmentLinkId && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <GitMerge className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Patient Requested Follow-Up</p>
              <p className="text-xs text-amber-600">
                This was flagged as a follow-up visit but no past consultation was linked.
                {!isPastConsultation && ' Visit the Patient Record tab to link one.'}
              </p>
            </div>
          </div>
        )}

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

          <TabsContent value="cards" className="mt-6 overflow-auto">
            {viewMode === 'cards' ? (
              <CardsView
                complaints={complaints}
                symptoms={symptoms}
                historyNotes={historyNotes}
                appointment={appointment}
                requestedLabs={requestedLabs}
                radiology={radiology}
                prescriptions={prescriptions || appointment?.prescriptions || []}
                referrals={referrals}
                onRemoveReferral={(index) =>
                  setReferrals((prev) => prev.filter((_, i) => i !== index))
                }
                labInstructions={lab?.instructions}
                labClinicalHistory={lab?.history}
                labFileUrls={lab?.fileUrls}
                postInvestigationData={parsePostInvestigationInitialNotes(appointment?.ipData)}
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

        {!isPastConsultation && goToPrevious && (
          <div className="fixed bottom-0 left-0 flex w-full justify-start border-t border-gray-300 bg-white p-4 shadow-md">
            <Button onClick={goToPrevious} variant="outline" child="Back to Prescription" />
          </div>
        )}
      </div>
    </>
  );
};

export default ReviewConsultation;
