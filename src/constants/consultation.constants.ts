import { AppointmentStatus } from '@/types/appointmentStatus.enum';

export const CONSULTATION_START_ALLOWED_STATUS = [
  AppointmentStatus.InvestigatingProgress,
  AppointmentStatus.InvestigatingScheduled,
  AppointmentStatus.Progress,
  AppointmentStatus.Accepted,
  AppointmentStatus.Pending,
];
