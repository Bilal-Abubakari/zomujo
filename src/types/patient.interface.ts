import { IExtraBase } from '@/types/shared.interface';
import { BloodGroup, Denomination, MaritalStatus } from '@/types/shared.enum';
import { familyRelations } from '@/constants/constants';

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
  familyMembers: IFamilyMember[];
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
  lifestyle?: ILifestyle;
  prescription: string[];
  conditions: ICondition[];
  prescriptionPreviewUrl?: string;
  reasonEnded?: string;
  review?: string;
  surgeries: ISurgery[];
  temperature?: number;
  symptoms: string[];
  createdAt: string;
  updatedAt: string;
}

interface IIdName {
  id: string;
  name: string;
}

export interface IMedicine extends IIdName {
  dose: string;
}

export type IMedicineWithoutId = Omit<IMedicine, 'id'>;

export interface ICondition<T extends IMedicineWithoutId[] = IMedicine[]> extends IIdName {
  recordId: string;
  medicines: T;
}

export type IConditionWithoutId = Omit<ICondition<IMedicineWithoutId[]>, 'id'>;

export interface ISurgery extends IIdName {
  recordId: string;
  additionalNotes: string;
}

export type ISurgeryWithoutId = Omit<ISurgery, 'id'>;

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

export type relationType = (typeof familyRelations)[number];

export interface IFamilyMember<T = string> {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  image?: T;
  relation: relationType;
}

export interface IFamilyMemberRequest extends IFamilyMember<File> {
  recordId: string;
}

export type MedicalLevel = 'none' | 'light' | 'moderate' | 'heavy';

export interface ILifestyle {
  alcohol: MedicalLevel;
  smoking: MedicalLevel;
  stress: number;
}
