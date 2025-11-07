import { IExtraBase } from '@/types/shared.interface';
import { BloodGroup, Denomination, MaritalStatus } from '@/types/shared.enum';
import {
  allergyTypes,
  familyRelations,
  medicalLevels,
  severityOptions,
} from '@/constants/constants';
import { ILab, IUploadLab } from '@/types/labs.interface';
import {
  IMedicine,
  ICondition,
  ISurgery,
  IDiagnosis,
} from '@/types/medical.interface';

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
  lab: ILab[];
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

export interface IPatientMedicalHistory {
  id: string;
  patientId: string;
  diagnoses: IDiagnosis[];
  medications: IMedicine[];
  allergies: IAllergy[];
  createdAt: string;
  updatedAt: string;
  labResults: ILab[];
  imagingReports: IUploadLab[];
}

