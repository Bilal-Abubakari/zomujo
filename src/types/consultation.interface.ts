import { DurationType } from '@/types/shared.enum';
import { IExtraBase } from '@/types/shared.interface';
import { IMedicineWithoutId, IDiagnosis, IPrescription } from '@/types/medical.interface';
import { ILab } from '@/types/labs.interface';
import { ISlot } from '@/types/slots.interface';
import { IRadiology } from '@/types/radiology.interface';
import { IDoctor } from './doctor.interface';

interface IName {
  name: string;
}

export interface IPatientSymptom extends IName {
  notes?: string;
}

export interface ISymptom extends IName {
  id: string;
}

export enum SymptomsType {
  Neurological = 'neurological',
  Cardiovascular = 'cardiovascular',
  Gastrointestinal = 'gastrointestinal',
  Musculoskeletal = 'musculoskeletal',
  Genitourinary = 'genitourinary',
  Integumentary = 'integumentary',
  Endocrine = 'endocrine',
}

export type ISymptomMap = {
  [key in SymptomsType]: ISymptom[];
};

export type IPatientSymptomMap = {
  [key in SymptomsType]: IPatientSymptom[];
};

export interface IConsultationDetails {
  id: string;
  status: ConsultationStatus;
  doctor: Pick<IExtraBase, 'id' | 'firstName' | 'lastName' | 'profilePicture'>;
  patient: Pick<IExtraBase, 'firstName' | 'lastName' | 'profilePicture'>;
  prescriptionUrl: string;
  lab: ILab;
  radiology: IRadiology;
  diagnosis: IDiagnosis[];
  prescriptions: IPrescription[];
  referrals: IReferral[];
  slot: ISlot;
}

export interface IComplaint {
  complaint: string;
  duration: IDuration;
}

export interface IConsultationSymptoms {
  complaints: IComplaint[];
  symptoms: IPatientSymptomMap;
  medicinesTaken: IMedicineWithoutId[];
}

export interface IConsultationSymptomsRequest extends IConsultationSymptoms {
  appointmentId: string;
}

export interface IDuration {
  value: string;
  type: DurationType;
}

export interface IDiagnosisOnlyRequest {
  diagnoses: Omit<IDiagnosis, 'prescriptions'>[];
  appointmentId: string;
}

export interface IPrescriptionRequest {
  prescriptions: (IPrescription & { appointmentId: string })[];
  appointmentId: string;
}

export interface IDiagnosisRequest {
  diagnoses: IDiagnosis[];
  appointmentId: string;
}

export enum ConsultationStatus {
  Pending = 'pending',
  Completed = 'completed',
  Progress = 'progress',
  Cancelled = 'cancelled',
}

export interface ConsultationStatusRequest {
  status: ConsultationStatus;
  appointmentId: string;
}

export interface IConsultationAuthRequest {
  appointmentId: string;
  code: string;
}

export type ReferralType = 'internal' | 'external';

export interface IReferral {
  id?: string;
  type: ReferralType;
  doctorName?: string;
  facility?: string;
  email?: string;
  notes?: string;
  doctorId?: string;
  doctor?: IDoctor;
  createdAt?: string;
}
