import { IExtraBase } from '@/types/shared.interface';
import { BloodGroup, Denomination, MaritalStatus } from '@/types/shared.enum';

export interface IPatient extends IExtraBase {
  maritalStatus?: MaritalStatus;
  denomination?: Denomination;
  height?: number;
  bloodGroup?: BloodGroup;
  weight?: number;
  heartRate?: number;
  bloodSugarLevel?: number;
  bloodPressure?: IBloodPressure;
  temperature?: number;
  lifestyle: unknown;
  city?: string;
  address?: string;
  NHISnumber?: string;
  insuranceInfo: string;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export type IPatientBasic = Pick<
  IPatient,
  'maritalStatus' | 'gender' | 'dob' | 'denomination' | 'height' | 'bloodGroup'
>;

export interface IBloodPressure {
  systolic: number;
  diastolic: number;
}
