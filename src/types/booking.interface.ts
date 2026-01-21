import { Dispatch, SetStateAction } from 'react';
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';

export interface IInitializeAppointment {
  slotId?: string;
  reason: string;
  additionalInfo: string;
}

export interface IBookingForm extends IInitializeAppointment {
  date: string;
  time?: string;
  appointmentType: string;
}

export type IBookingSlotId = Pick<IBookingForm, 'slotId'>;

export type AvailabilityProps = {
  doctorId?: string;
  register: UseFormRegister<IBookingForm>;
  setValue: UseFormSetValue<IBookingForm>;
  setCurrentStep?: Dispatch<SetStateAction<number>>;
  isValid?: boolean;
  watch: UseFormWatch<IBookingForm>;
  errors?: FieldErrors<IBookingForm>;
};
