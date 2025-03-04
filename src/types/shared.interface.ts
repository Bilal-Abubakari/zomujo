import { AcceptDeclineStatus, Gender } from '@/types/shared.enum';
import { IUser } from '@/types/auth.interface';

export interface IResponse<T = undefined> {
  data: T;
  status: number;
  message: string;
}

export interface IPagination<T> {
  rows: T[];
  total: number;
  pageSize: number;
  page: number;
  nextPage: number | null;
  prevPage: number | null;
  totalPages: number;
}

export interface IQueryParams<T = undefined> {
  page?: number;
  search?: string;
  pageSize?: number;
  orderDirection?: string;
  orderBy?: string;
  status?: T;
  startDate?: string;
  endDate?: string;
  priceMin?: string;
  priceMax?: string;
  experienceMin?: string;
  experienceMax?: string;
  gender?: string;
  specialty?: string;
  rateMin?: string;
  rateMax?: string;
}

export interface IAction<T = undefined> {
  payload: T;
}

export interface IExtraBase extends Pick<IUser, 'email'> {
  id: string;
  firstName: string;
  lastName: string;
  status: AcceptDeclineStatus;
  contact: string;
  profilePicture: string;
  gender: Gender;
  dob: Date;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}
