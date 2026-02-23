import { IAppointment } from '@/types/appointment.interface';
import { ILaboratoryRequest } from '@/types/labs.interface';
import { IRadiology } from '@/types/radiology.interface';
import { IDiagnosis, IPrescription } from '@/types/medical.interface';
import { IPatientSymptomMap, SymptomsType, IReferral } from '@/types/consultation.interface';
import { capitalize } from '@/lib/utils';

export const generateHeader = (appointment: IAppointment, doctorName: string): string =>
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

export const generateChiefComplaints = (
  appointment: IAppointment,
  complaints?: string[],
): string => {
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

const parseHistoryNotes = (historyNotes: string): string => {
  const SECTION_KEYS: Array<[string, string]> = [
    ['historyOfPresentingComplaint', 'History of Presenting Complaint'],
    ['onDirectQuestions', 'On Direct Questions'],
    ['systematicEnquiry', 'Systematic Enquiry'],
    ['pastMedicalSurgicalHistory', 'Past Medical/Surgical History'],
    ['drugHistory', 'Drug History'],
    ['familyHistory', 'Family History'],
    ['socialHistory', 'Social History'],
    ['assessment', 'Assessment'],
    ['plan', 'Plan'],
  ];

  try {
    const parsed = JSON.parse(historyNotes);
    const sections = SECTION_KEYS.filter(([key]) => parsed[key])
      .map(([key, label]) => `${label}:\n${parsed[key]}\n`)
      .join('');
    return `HISTORY OF PRESENT ILLNESS:\n${sections}`;
  } catch {
    return `HISTORY OF PRESENT ILLNESS:\n${historyNotes}\n\n`;
  }
};

const formatSymptomGroup = (
  symptomType: string,
  symptomList: Array<{ name: string; notes?: string }>,
): string => {
  const items = symptomList
    .map(({ name, notes }) => `  • ${name}${notes ? ` - ${notes}` : ''}\n`)
    .join('');
  return `${capitalize(symptomType)} System:\n${items}\n`;
};

const formatSymptoms = (symptoms: IPatientSymptomMap): string => {
  const body = Object.keys(symptoms)
    .map((key) => {
      const symptomList = symptoms[key as SymptomsType];
      return symptomList?.length ? formatSymptomGroup(key, symptomList) : '';
    })
    .join('');

  return `HISTORY OF PRESENT ILLNESS:\n\nThe patient presents with the following symptoms:\n\n${body}`;
};

export const generateSymptoms = (symptoms?: IPatientSymptomMap, historyNotes?: string): string => {
  if (historyNotes) {
    return parseHistoryNotes(historyNotes);
  }
  if (!symptoms || Object.keys(symptoms).length === 0) {
    return '';
  }
  return formatSymptoms(symptoms);
};

export const generateMedications = (appointment: IAppointment): string => {
  if (!appointment.symptoms?.medicinesTaken || appointment.symptoms.medicinesTaken.length === 0) {
    return '';
  }
  const lines: string[] = [`MEDICATIONS PREVIOUSLY TAKEN:\n`];
  appointment.symptoms.medicinesTaken.forEach(({ name, dose }: { name: string; dose: string }) => {
    lines.push(`• ${name} - ${dose}\n`);
  });
  lines.push('\n');
  return lines.join('');
};

export const generateLabs = (
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
    requestedLabs.forEach(({ testName, categoryType }) => {
      lines.push(`  • ${testName} (Category: ${categoryType})`);
    });
    lines.push('\n');
  }
  if (conductedLabs && conductedLabs.length > 0) {
    lines.push(`Completed Tests:\n`);
    conductedLabs.forEach(({ testName }) => {
      lines.push(`  • ${testName}\n`);
    });
    lines.push('\n');
  }
  return lines.join('');
};

export const generateRadiology = (radiology?: IRadiology): string => {
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
  return lines.join('');
};

export const generateDiagnosesAndTreatment = (
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

export const generatePlan = (): string =>
  `PLAN:\n[Doctor can add additional recommendations, follow-up instructions, or notes here]\n\n`;

export const generateSignature = (doctorName: string): string =>
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
