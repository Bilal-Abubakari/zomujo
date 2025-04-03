import { AppointmentStatus, ApproveDeclineStatus } from './shared.enum';
import { frequencies, weekDays } from '@/constants/appointments.constant';
import { IDoctor } from '@/types/doctor.interface';
import { IPatient } from '@/types/patient.interface';

interface IBaseAppointment {
  id: string;
  patient: IPatient;
  doctor: IDoctor;
}

export interface IAppointment extends IBaseAppointment, ISlotBase {
  slot: ISlot;
  status: AppointmentStatus;
  reason: string;
  additionalInfo: string;
  meetingLink: string | null;
}

export interface IRecordRequest extends IBaseAppointment {
  status: ApproveDeclineStatus;
  createdAt: string;
}

export enum AppointmentType {
  Virtual = 'virtual',
  Visit = 'visit',
}

export interface IRule {
  freq?: IFrequency;
  count?: number;
  interval?: number;
  byDay?: string;
  byMonth?: string;
  byMonthDay?: string;
  byWeekNo?: string;
}

export type IFrequency = (typeof frequencies)[number];

export type IWeekDays = (typeof weekDays)[number];

interface ISlotBase {
  startTime: string;
  endTime: string;
  type: AppointmentType;
}

export enum SlotStatus {
  Available = 'available',
  Unavailable = 'unavailable',
}

export interface ISlotPatternBase extends ISlotBase {
  recurrence: string;
  startDate: string;
  endDate?: string;
  duration: number;
}

export interface ISlot extends ISlotBase {
  id: string;
  date: string;
  status: SlotStatus;
  createdAt: string;
  updatedAt: string;
  doctorId: string;
  patternId: string;
  exceptionId: string | null;
}

export interface ISlotPattern extends ISlotPatternBase {
  id: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updateAt: string;
}

export type IPatternException = Pick<ISlot, 'patternId' | 'date' | 'startTime' | 'endTime'> & {
  reason: string;
  type: 'modification' | 'cancellation';
};
