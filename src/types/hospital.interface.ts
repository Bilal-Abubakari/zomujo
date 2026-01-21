import { ApproveDeclineStatus } from '@/types/shared.enum';

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
}

export interface IHospitalProfile {
  supportedInsurance: string[];
  specialties?: string[];
  name: string;
  regularFee: number;
  image: string | null | File;
  images?: (File | string)[];
  // New fields
  description?: string;
  organizationType?: 'private' | 'public' | 'teaching' | 'clinic';
  mainPhone?: string;
  mainEmail?: string;
  website?: string;
  languages?: string[];
  bedCount?: number;
  telemedicine?: boolean;
  hasEmergency?: boolean;
  // Address fields
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

// New hospital interface matching the backend model
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
  type: 'logo' | 'photo' | 'floorplan';
  url: string;
  meta?: any;
}

export interface IHospitalService {
  id: string;
  serviceId: string;
  service: {
    id: string;
    name: string;
    description?: string;
    category?: string;
  };
  availability: 'available' | 'limited' | 'not_available';
  priceRange?: any;
  notes?: string;
  bookingUrl?: string;
}

export interface IHospitalDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organizationType: 'private' | 'public' | 'teaching' | 'clinic';
  mainPhone?: string;
  mainEmail?: string;
  website?: string;
  isActive: boolean;
  hasEmergency: boolean;
  bedCount?: number;
  telemedicine: boolean;
  languages: string[];
  accreditations?: any;
  primaryAddress?: IHospitalAddress;
  addresses?: IHospitalAddress[];
  images?: IHospitalImage[];
  services?: IHospitalService[];
  departments?: Array<{ id: string; name: string }>;
  amenities?: Array<{ id: string; name: string; icon?: string }>;
  tags?: Array<{ id: string; name: string }>;
  openingHours?: Array<{
    id: string;
    weekday: string;
    openTime?: string;
    closeTime?: string;
    is24Hours: boolean;
    isClosed: boolean;
    notes?: string;
  }>;
  insuranceNetworks?: Array<{
    id: string;
    insuranceCompany: {
      id: string;
      name: string;
      code?: string;
      logo?: string;
    };
    planNotes?: string;
    acceptedSince?: Date;
  }>;
}

export interface IHospitalListItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organizationType: 'private' | 'public' | 'teaching' | 'clinic';
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
