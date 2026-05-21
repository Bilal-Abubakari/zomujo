import { AppointmentStatus } from './appointmentStatus.enum';
import { IPatient } from './patient.interface';
import { IDoctor } from './doctor.interface';
import { IHospital } from './hospital.interface';
import { ISlot } from './slots.interface';

export interface IHospitalAppointment {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: AppointmentStatus;
  meetingLink?: string;
  reason?: string;
  additionalInfo?: string;
  ref?: string;
  appointmentDate?: string;
  patient: IPatient;
  doctor?: IDoctor;
  hospital: IHospital;
  slot?: ISlot;
}
