import {
  ChemicalPathologyCategory,
  HaematologyCategory,
  ImmunologyCategory,
  LabTestSection,
  MicrobiologyCategory,
} from '@/types/labs.enum';
import { RequestStatus } from '@/types/shared.enum';

export type CategoryType =
  | ChemicalPathologyCategory
  | HaematologyCategory
  | ImmunologyCategory
  | MicrobiologyCategory;

export interface ILaboratoryRequest {
  category: LabTestSection;
  categoryType: CategoryType;
  testName: string;
  notes: string;
  fasting: boolean;
  specimen: string;
}

export interface ILaboratoryRequestWithRecordId {
  recordId: string;
  appointmentId: string;
  labs: ILaboratoryRequest[];
}

export interface ILab extends ILaboratoryRequest {
  id: string;
  fileUrl: string | null;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LaboratoryTest {
  [LabTestSection.ChemicalPathology]: ChemicalPathology;
  [LabTestSection.Haematology]: Haematology;
  [LabTestSection.Immunology]: Immunology;
  [LabTestSection.Microbiology]: Microbiology;
}

export type ChemicalPathology = Record<ChemicalPathologyCategory, string[]>;

export type Haematology = Record<HaematologyCategory, string[]>;

export type Immunology = Record<ImmunologyCategory, string[]>;

export type Microbiology = Record<MicrobiologyCategory, string[]>;
