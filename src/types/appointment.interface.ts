import { AppointmentStatus, ApproveDeclineStatus } from './shared.enum';
import { IDoctor } from '@/types/doctor.interface';
import { IPatient } from '@/types/patient.interface';
import { IHospital } from './hospital.interface';
import { IConsultationSymptomsRequest } from '@/types/consultation.interface';
import { IDiagnosis } from '@/types/medical.interface';
import { ILab } from '@/types/labs.interface';
import { ISlot, ISlotBase } from '@/types/slots.interface';

interface IBaseAppointment {
  id: string;
  patient: IPatient;
  doctor: IDoctor;
  org: IHospital;
  createdAt: string;
}

export interface IAppointmentSymptoms extends IConsultationSymptomsRequest {
  id: string;
  createdAt: string;
}
export interface IAppointment extends IBaseAppointment, ISlotBase {
  slot: ISlot;
  status: AppointmentStatus;
  reason: string;
  additionalInfo: string;
  symptoms: IAppointmentSymptoms;
  lab: ILab[];
  diagnosis: IDiagnosis[];
}

export interface IRecordRequest extends IBaseAppointment {
  status: ApproveDeclineStatus;
}

export interface IAppointmentDoctorId {
  appointmentId: string;
  doctorId: string;
}
