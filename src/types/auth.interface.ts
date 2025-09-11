import { Gender, Role, Status } from '@/types/shared.enum';
import { ICheckout } from '@/types/payment.interface';
import { IUseBookingInfo } from '@/hooks/useBookingInfo';

export interface IPersonalDetails {
  MDCRegistration: string;
  dob: string;
  contact: string;
  gender: Gender;
}

export interface IDoctorPhotoUpload {
  profilePicture: File;
}

export interface IDoctorIdentification<T = File | string> {
  front: T;
  back: T;
}

export type DoctorOnboarding = IPersonalDetails & IDoctorPhotoUpload & IDoctorIdentification;

export interface ILoginResponse {
  user: IUser;
  extra: unknown;
  paystack?: ICheckout;
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

export interface IUserSignUp extends IBaseUser {
  password: string;
  confirmPassword: string;
}

export type IAuthBooking = Partial<Pick<IUseBookingInfo, 'doctorId' | 'slotId'>>;

export interface IUserSignUpRole extends IUserSignUp, IAuthBooking {
  role: Role;
}

export interface IOrganizationRequest extends Pick<IBaseUser, 'email'> {
  name: string;
  location: string;
  lat: number;
  long: number;
  gpsLink: string;
}

export interface ILogin extends IAuthBooking {
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
