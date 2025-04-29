import { DurationType } from '@/types/shared.enum';

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
  // Endocrine = 'endocrine' TODO: We will add this system as soon as data is ready,
}

export type ISymptomMap = {
  [key in SymptomsType]: ISymptom[];
};

export type IPatientSymptomMap = {
  [key in SymptomsType]: IPatientSymptom[];
};

export interface IConsultationSymptoms {
  complaints: string[];
  duration: IDuration;
  symptoms: IPatientSymptomMap;
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
