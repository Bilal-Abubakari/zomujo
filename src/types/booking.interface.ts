import { Dispatch, SetStateAction } from "react";
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

export type BookingForm = {
  date: string;
  time: string;
  reason: string;
  appointmentType: string;
  additionalInfo: string;
  
};



export type AvailabilityProps = {
  register: UseFormRegister<BookingForm>;
  setValue: UseFormSetValue<BookingForm>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  isValid?: boolean;
  watch: UseFormWatch<BookingForm>;
  errors?: FieldErrors<BookingForm>;
};
