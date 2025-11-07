import { AcceptDeclineStatus, Gender, OrderDirection, ConditionStatus } from '@/types/shared.enum';
import { IUser } from '@/types/auth.interface';

export interface IResponse<T = undefined> {
  data: T;
  status: number;
  message: string;
}

export interface ICustomResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export interface IPagination<T> {
  rows: T[];
  total: number;
  pageSize: number;
  page: number;
  nextPage: number | null;
  prevPage: number | null;
  totalPages: number;
}

export type Month =
  | 'jan'
  | 'feb'
  | 'mar'
  | 'apr'
  | 'may'
  | 'jun'
  | 'jul'
  | 'aug'
  | 'sep'
  | 'oct'
  | 'nov'
  | 'dec';

export interface IQueryParams<T = undefined> {
  page?: number;
  search?: string;
  pageSize?: number;
  orderDirection?: OrderDirection;
  orderBy?: string;
  status?: T;
  startTime?: string;
  endTime?: string;
  startDate?: Date;
  date?: string;
  month?: Month;
  orgId?: string;
  endDate?: Date;
  priceMin?: string;
  priceMax?: string;
  experienceMin?: string;
  experienceMax?: string;
  gender?: string;
  specialty?: string;
  rateMin?: string;
  rateMax?: string;
  booking?: boolean;
  doctorId?: string;
  patientId?: string;
  id?: string;
  temperature?: string;
  bloodPressure?: string;
  bloodSugarLevel?: string;
  oxygenSaturation?: string;
  respiratoryRate?: string;
  heartRate?: string;
}

export interface IAction<T = undefined> {
  payload: T;
}

export interface IExtraBase extends Pick<IUser, 'email'> {
  id: string;
  firstName: string;
  lastName: string;
  status: AcceptDeclineStatus;
  contact: string;
  profilePicture: string;
  gender: Gender;
  dob: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AcceptDecline = 'accept' | 'decline';

// Shared medical interfaces to avoid circular dependencies
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

export interface IPrescription {
  name: string;
  doses: string;
  instructions?: string;
  frequency: string;
}

export interface IDiagnosis {
  name: string;
  diagnosedAt: string;
  notes?: string;
  status: ConditionStatus;
  prescriptions: IPrescription[];
}
