import { Gender, Role, Status } from '@/types/shared.enum';

export interface IPersonalDetails {
  MDCRegistration: string;
  dob: Date;
  contact: string;
  gender: Gender;
}

export interface IDoctorPhotoUpload {
  profilePicture: File;
}

export interface IDoctorIdentification {
  front: File | string;
  back: File | string;
}

export type DoctorOnboarding = IPersonalDetails & IDoctorPhotoUpload & IDoctorIdentification;

export interface ILoginResponse {
  user: IUser;
  extra: unknown;
}

export interface IBaseUser {
  email: string;
  firstName: string;
  lastName: string;
}

export interface IUser extends IBaseUser {
  id: string;
  status: Status;
  isActive: boolean;
  role: Role;
  createdAt: Date;
}

export interface ISignUp extends IBaseUser {
  password: string;
  confirmPassword: string;
  name: string;
  location: string;
  role: Role;
  lat: number;
  long: number;
  gpsLink: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IResetPassword extends Omit<IUpdatePassword, 'currentPassword'> {
  token: string;
}

export interface IUpdatePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
