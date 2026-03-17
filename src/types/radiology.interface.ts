import {
  RadiologySection,
  PlainRadiologyCategory,
  UltrasoundScansCategory,
  SpecializedImagingCategory,
  InterventionalRadiologyCategory,
  OtherInvestigationsCategory,
} from '@/types/radiology.enum';
import { RequestStatus } from '@/types/shared.enum';

export type RadiologyCategoryType =
  | PlainRadiologyCategory
  | UltrasoundScansCategory
  | SpecializedImagingCategory
  | InterventionalRadiologyCategory
  | OtherInvestigationsCategory;

export interface IRadiologyTest {
  category: RadiologySection;
  categoryType: RadiologyCategoryType;
  testName: string;
  fileUrl?: string;
}
export interface IRadiologyRequest {
  tests: IRadiologyTest[];
  procedureRequest: string;
  history: string;
  instructions?: string;
  fileUrls?: string[];
}

export interface IRadiologyRequestWithRecordId {
  recordId: string;
  appointmentId: string;
  tests: IRadiologyTest[];
  procedureRequest: string;
  history: string;
  instructions?: string;
}

export interface IRadiology extends IRadiologyRequest {
  id: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IUploadRadiology {
  id: string;
  file: File;
}

export interface RadiologyTest {
  [RadiologySection.PlainRadiology]: PlainRadiology;
  [RadiologySection.UltrasoundScans]: UltrasoundScans;
  [RadiologySection.SpecializedImaging]: SpecializedImaging;
  [RadiologySection.InterventionalRadiology]: InterventionalRadiology;
  [RadiologySection.OtherInvestigations]: OtherInvestigations;
}

export type PlainRadiology = Record<PlainRadiologyCategory, string[]>;

export type UltrasoundScans = Record<UltrasoundScansCategory, string[]>;

export type SpecializedImaging = Record<SpecializedImagingCategory, string[]>;

export type InterventionalRadiology = Record<InterventionalRadiologyCategory, string[]>;

export type OtherInvestigations = Record<OtherInvestigationsCategory, string[]>;
