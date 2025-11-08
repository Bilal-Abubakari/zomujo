import { DurationType } from '@/types/shared.enum';
import { IExtraBase } from '@/types/shared.interface';
import { IMedicineWithoutId, IDiagnosis } from '@/types/medical.interface';
import { IPatientLab } from '@/types/labs.interface';
import { ISlot } from '@/types/slots.interface';

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
  lab: IPatientLab[];
  diagnosis: IDiagnosis[];
  slot: ISlot;
}

export interface IConsultationSymptoms {
  complaints: string[];
  duration: IDuration;
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

/**
 * The interface used to ensure compatibility with react-hook-form.
 * React-Hook-Form's useFieldArray only supports arrays of objects (not flat arrays).
 * HFC = Hook Form Compatibility
 */
export interface IConsultationSymptomsHFC extends Omit<IConsultationSymptoms, 'complaints'> {
  complaints: IName[];
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
