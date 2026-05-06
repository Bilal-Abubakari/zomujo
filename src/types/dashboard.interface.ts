import {
  PaymentChannel,
  PaymentStatus,
  TransactionStatus,
  TransactionType,
} from '@/types/shared.enum';
import { ITransactionUser } from '@/types/payment.interface';

export interface IPaymentStats {
  totalRevenue: number;
  platformRevenue: number;
  doctorPayouts: number;
  paystackFees: number;
  transactionsCount: number;
  refundsCount: number;
}

export interface IRecentTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  reference: string;
  status: TransactionStatus;
  description: string | null;
  createdAt: string;
}

export interface IRecentPayment {
  id: string;
  reference: string;
  subtotal: number;
  tax: number;
  amount: number;
  paystackFee: number;
  netAmount: number;
  platformShare: number;
  doctorShare: number;
  doctorNet: number;
  currency: string;
  channel: PaymentChannel;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  patient: ITransactionUser | null;
  doctor: ITransactionUser | null;
}

export interface IUserStats {
  allUsers: number;
  removedUsers: number;
  penndingUsers: number;
  doctors: number;
  patients: number;
  others: number;
}

export interface IActiveUsersRow {
  date: string;
  total: number;
}

export interface IActiveUsers {
  today: number;
  thisWeek: number;
  lastMonth: number;
  rows: IActiveUsersRow[];
}

export interface IAppointmentStatRow {
  date: string;
  total: number;
}

export interface IAppointmentStat {
  total: number;
  thisMonth: number;
  lastMonth: number;
  percentage: number;
  rows: IAppointmentStatRow[];
}

export interface IChartDataPoint {
  date: string;
  value: number;
}
