import { IExtraBase } from '@/types/shared.interface';
import { BloodGroup, Denomination, MaritalStatus } from '@/types/shared.enum';
import {
  allergyTypes,
  familyRelations,
  medicalLevels,
  severityOptions,
} from '@/constants/constants';

export interface IPatient extends IExtraBase {
  lifestyle: unknown;
  city?: string;
  address?: string;
  NHISnumber?: string;
  insuranceInfo: string;
}

export interface IMedicalRecord {
  id: string;
  allergies: IAllergy[];
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

export type RelationType = (typeof familyRelations)[number];

export interface IFamilyMember<T = string> {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  image?: T;
  relation: RelationType;
}

export interface IFamilyMemberRequest extends IFamilyMember<File> {
  recordId: string;
}

export type MedicalLevelType = (typeof medicalLevels)[number];

export interface ILevelDescription<T = MedicalLevelType> {
  level: T;
  description?: string;
}

export interface ILifestyle {
  alcohol: ILevelDescription;
  smoking: ILevelDescription;
  stress: ILevelDescription<string>;
}

export type AllergyTypesType = (typeof allergyTypes)[number];

export type SeverityType = (typeof severityOptions)[number];

export interface IAllergy {
  id: string;
  allergy: string;
  type: AllergyTypesType;
  severity: SeverityType;
}

export type IAllergyWithoutId = Omit<IAllergy, 'id'>;

export interface IAllergyRequest extends IAllergy {
  recordId: string;
}
