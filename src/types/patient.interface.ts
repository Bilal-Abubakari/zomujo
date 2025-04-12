import { IExtraBase } from '@/types/shared.interface';
import { BloodGroup, Denomination, MaritalStatus } from '@/types/shared.enum';

export interface IPatient extends IExtraBase {
  lifestyle: unknown;
  city?: string;
  address?: string;
  NHISnumber?: string;
  insuranceInfo: string;
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
  maritalStatus?: MaritalStatus;
  denomination?: Denomination;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  gynae: string[];
  height?: number;
  weight?: number;
  heartRate?: number;
  invoice?: string;
  lab: string[];
  lifestyle?: string;
  prescription: string[];
  conditions: ICondition[];
  prescriptionPreviewUrl?: string;
  reasonEnded?: string;
  review?: string;
  surgeries: string[];
  temperature?: number;
  symptoms: string[];
  createdAt: string;
  updatedAt: string;
}

interface IConditionMedicineBase {
  id: string;
  name: string;
}

export interface IMedicine extends IConditionMedicineBase {
  doses: string;
}

export interface ICondition extends IConditionMedicineBase {
  recordId: string;
  medicines: IMedicine[];
}

export type IConditionWithoutId = Omit<ICondition, 'id'>;

export interface IPatientWithRecord extends IPatient {
  record: IMedicalRecord;
  recordId: string;
}

export type IPatientBasic = Pick<
  IMedicalRecord,
  'height' | 'bloodGroup' | 'maritalStatus' | 'denomination'
>;

export interface IBloodPressure {
  systolic: number;
  diastolic: number;
}

export type IPatientMandatory = Pick<IPatient, 'gender' | 'dob'>;

export type IPatientVitals = Pick<
  IMedicalRecord,
  | 'bloodPressure'
  | 'weight'
  | 'heartRate'
  | 'respiratoryRate'
  | 'bloodSugarLevel'
  | 'temperature'
  | 'oxygenSaturation'
>;

export type IPatientDataCombined = IPatient & IMedicalRecord;
