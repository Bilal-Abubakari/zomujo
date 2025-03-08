import { IBaseUser } from '@/types/auth.interface';
import { IExtraBase } from '@/types/shared.interface';

export interface IDoctor extends IExtraBase {
  email: string;
  MDCRegistration: string;
  contact: string;
  address: string;
  city: string;
  qualifications: string[];
  specializations: string[];
  schoolsAttended: string[];
  experience: number;
  education: {
    school: string;
    degree: string;
  };
  notifications: {
    email: boolean;
    appointments: boolean;
    messages: boolean;
    fileRecordRequest: boolean;
  };
  bio: string;
  languages: string[];
  awards: string[];
  IDs: {
    front: string;
    back: string;
  };
  rate: number;
  balance: number | null;
  signaturePath: string;
  noOfConsultations?: number;
  ratings: number;
  fee: {
    lengthOfSession: string;
    amount: number;
  };
}

export type DoctorPersonalInfo = Pick<
  IDoctor,
  | 'firstName'
  | 'lastName'
  | 'contact'
  | 'experience'
  | 'languages'
  | 'awards'
  | 'specializations'
  | 'bio'
  | 'education'
>;

export type NotificationInfo = Pick<IDoctor, 'notifications'>;

export interface IInviteDoctors extends Pick<IExtraBase, 'orgId'> {
  users: IBaseUser[];
}
