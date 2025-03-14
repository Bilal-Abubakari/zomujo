import { AppointmentStatus, VisitType } from './shared.enum';
import { Dispatch, SetStateAction } from 'react';
import { frequencies, weekDays } from '@/constants/appointments.constant';

export interface IAppointmentRequest extends ISlotBase {
  id: number;
  date: string;
  slotId: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  reason: string;
  notes: string;
  status: AppointmentStatus;
  option?: 'Accept' | 'Decline';
  slot?: {
    startTime: string;
    endTime: string;
    date: string;
    type: AppointmentType;
  };
}

export enum AppointmentType {
  Virtual = 'virtual',
  Visit = 'visit',
}

export type ModalProps = Pick<IAppointmentRequest, 'patient' | 'option'> & {
  setModal?: Dispatch<SetStateAction<boolean>>;
};

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
  type: VisitType;
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
