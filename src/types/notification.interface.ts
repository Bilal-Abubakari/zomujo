import { Role } from '@/types/shared.enum';
import { IAppointment } from '@/types/appointment.interface';

export interface INotification {
  id: number;
  event: NotificationEvent;
  fromId: string;
  toId: string;
  userId: string;
  payload: IPayload;
  read: boolean;
  createdAt: string;
}

interface IPayload {
  topic: string;
  requestId: string;
  scope: Role;
  message: string;
  appointment: IAppointment;
}

export enum NotificationEvent {
  NewNotification = 'newNotification',
  NewRequest = 'newRequest',
}
