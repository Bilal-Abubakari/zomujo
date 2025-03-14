import { Role } from '@/types/shared.enum';

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
}

export enum NotificationEvent {
  NewNotification = 'newNotification',
  NewRequest = 'newRequest'
}
