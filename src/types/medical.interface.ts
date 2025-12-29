import { ConditionStatus } from '@/types/shared.enum';

// Shared medical interfaces to avoid circular dependencies between
// patient.interface.ts and consultation.interface.ts

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
  route: string;
  numOfDays: string;
  doseRegimen: string;
}

export interface IDiagnosis {
  name: string;
  diagnosedAt: string;
  notes?: string;
  status: ConditionStatus;
  prescriptions: IPrescription[];
}
