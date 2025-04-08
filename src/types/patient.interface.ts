import { IExtraBase } from '@/types/shared.interface';
import { BloodGroup, Denomination, MaritalStatus } from '@/types/shared.enum';

export interface IPatient extends IExtraBase {
  maritalStatus?: MaritalStatus;
  denomination?: Denomination;
  lifestyle: unknown;
  city?: string;
  address?: string;
  NHISnumber?: string;
  insuranceInfo: string;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface IMedicalRecord {
  id: string;
  allergies: string[];
  bloodGroup?: BloodGroup;
  bloodPressure?: IBloodPressure;
  bloodSugarLevel?: number;
  complaints: string;
  diagnosis: string[];
  examination: string[];
  familyMembers: string[];
  futureVisits: string[];
  gynae: string[];
  height?: number;
  weight?: number;
  heartRate?: number;
  invoice?: string;
  lab: string[];
  lifestyle?: string;
  prescription: string[];
  prescriptionPreviewUrl?: string;
  reasonEnded?: string;
  review?: string;
  status: 'active';
  surgeries: string[];
  temperature?: number;
  symptoms: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IPatientWithRecord extends IPatient {
  record: IMedicalRecord;
  recordId: string;
}

export type IPatientBasic = Pick<IMedicalRecord, 'height' | 'bloodGroup'> &
  Pick<IPatient, 'maritalStatus' | 'denomination'>;

export interface IBloodPressure {
  systolic: number;
  diastolic: number;
}

export type IPatientMandatory = Pick<IPatient, 'gender' | 'dob'>;
