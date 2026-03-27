import { AppointmentStatus } from './appointmentStatus.enum';
import { ApproveDeclineStatus } from './shared.enum';
import { IDoctor } from '@/types/doctor.interface';
import { IPatient } from '@/types/patient.interface';
import { IHospital } from './hospital.interface';
import {
  IConsultationSymptomsRequest,
  IExternalReferralRequest,
  IInternalReferralResponse,
} from '@/types/consultation.interface';
import { IDiagnosisResponse, IPrescriptionResponse } from '@/types/medical.interface';
import { ILab } from '@/types/labs.interface';
import { ISlot, ISlotBase } from '@/types/slots.interface';
import { IRadiology } from '@/types/radiology.interface';

interface IBaseAppointment {
  id: string;
  patient: IPatient;
  doctor: IDoctor;
  org: IHospital;
  createdAt: string;
}

export interface IAppointmentSymptoms extends IConsultationSymptomsRequest {
  id: string;
  createdAt: string;
}
export interface IPostInvestigationData {
  historyOfPresentingComplaints: string;
  assessmentImpression: string;
  plan: string;
  addendum: string;
}

export interface IAppointment extends IBaseAppointment, ISlotBase {
  slot: ISlot;
  status: AppointmentStatus;
  appointmentLinkId: string | null;
  isFollowUp: boolean;
  reason: string;
  additionalInfo: string;
  symptoms: IAppointmentSymptoms;
  lab: ILab;
  notes: string;
  historyNotes: string;
  isAuthenticated: boolean;
  radiology: IRadiology;
  prescriptionUrl: string | null;
  diagnosis: IDiagnosisResponse[];
  prescriptions: IPrescriptionResponse[];
  ipData: string;
  referralData: IExternalReferralRequest | null;
  referral: IInternalReferralResponse | null;
}

export interface IRecordRequest extends IBaseAppointment {
  status: ApproveDeclineStatus;
}

export interface IAppointmentDoctorId {
  appointmentId: string;
  doctorId: string;
}

export interface IAppointmentLinkPayload {
  appointmentId: string;
  appointmentLinkId: string;
}
