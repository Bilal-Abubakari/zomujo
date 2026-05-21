import { ApproveDeclineStatus } from '@/types/shared.enum';

export enum OrganizationType {
  Private = 'private',
  Public = 'public',
  Teaching = 'teaching',
  Clinic = 'clinic',
}

export enum HospitalImageType {
  Logo = 'logo',
  Photo = 'photo',
  Floorplan = 'floorplan',
}

export enum ServiceAvailability {
  Available = 'available',
  Limited = 'limited',
  NotAvailable = 'not_available',
}

export interface IHospitalNamedEntity {
  id: string;
  name: string;
  icon?: string;
}

export interface IHospitalServiceInfo {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface IHospitalOpeningHours {
  id: string;
  weekday: string;
  openTime?: string;
  closeTime?: string;
  is24Hours: boolean;
  isClosed: boolean;
  notes?: string;
}

export interface IInsuranceCompany {
  id: string;
  name: string;
  code?: string;
  logo?: string;
}

export interface IHospitalInsuranceNetwork {
  id: string;
  insuranceCompany: IInsuranceCompany;
  planNotes?: string;
  acceptedSince?: Date;
}

// Legacy interface for organizations (kept for backward compatibility)
export interface IHospital extends IHospitalProfile {
  id: string;
  location: string;
  email: string;
  status: ApproveDeclineStatus;
  distance: number;
  gpsLink: string;
  image: string | null;
  updatedAt: Date;
  createdAt: Date;
  isActive?: boolean;
}

export interface IHospitalProfile {
  supportedInsurance: string[];
  specialties?: string[];
  name: string;
  regularFee: number;
  image: string | null | File;
  images?: (File | string)[];
  imageOrder?: string[];
  description?: string;
  organizationType?: OrganizationType;
  mainPhone?: string;
  mainEmail?: string;
  website?: string;
  languages?: string[];
  bedCount?: number;
  telemedicine?: boolean;
  hasEmergency?: boolean;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  fax?: string;
  gpsLink?: string;
}

export interface INearByQueryParams {
  lat: number;
  long: number;
  radius: number;
}

export interface IHospitalAddress {
  id: string;
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  fax?: string;
  isPrimary: boolean;
}

export interface IHospitalImage {
  id: string;
  type: HospitalImageType;
  url: string;
  meta?: unknown;
}

export interface IHospitalService {
  id: string;
  serviceId: string;
  service: IHospitalServiceInfo;
  availability: ServiceAvailability;
  priceRange?: unknown;
  notes?: string;
  bookingUrl?: string;
}

export interface IHospitalDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organizationType: OrganizationType;
  mainPhone?: string;
  mainEmail?: string;
  website?: string;
  isActive: boolean;
  hasEmergency: boolean;
  bedCount?: number;
  telemedicine: boolean;
  languages: string[];
  accreditations?: unknown;
  primaryAddress?: IHospitalAddress;
  addresses?: IHospitalAddress[];
  images?: IHospitalImage[];
  services?: IHospitalService[];
  departments?: IHospitalNamedEntity[];
  amenities?: IHospitalNamedEntity[];
  tags?: IHospitalNamedEntity[];
  openingHours?: IHospitalOpeningHours[];
  insuranceNetworks?: IHospitalInsuranceNetwork[];
}

export interface IHospitalListItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organizationType: OrganizationType;
  mainPhone?: string;
  mainEmail?: string;
  website?: string;
  isActive: boolean;
  hasEmergency: boolean;
  bedCount?: number;
  telemedicine: boolean;
  languages: string[];
  primaryAddress?: IHospitalAddress;
  images?: IHospitalImage[];
}
