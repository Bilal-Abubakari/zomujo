import { IQueryParams } from '@/types/shared.interface';
import { PaymentChannel, PaymentStatus, TransactionStatus } from '@/types/shared.enum';

type PaymentType = 'mobile_money' | 'ghipss';

export interface ITransactionUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePicture: string;
}

export interface ITransaction {
  id: string;
  status: string;
  type: string;
  amount: number;
  currency: string;
  reference: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  doctor: ITransactionUser | null;
  patient: ITransactionUser | null;
}

export interface ICashFlow {
  total: number;
  doctor: number;
  patient: number;
  tax: number;
  fees: number;
  platform: number;
}

export interface IPayment {
  id: string;
  reference: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paystackFee: number;
  netAmount: number;
  platformShare: number;
  doctorShare: number;
  doctorNet: number;
  currency: string;
  channel: PaymentChannel;
  status: PaymentStatus;
  patientId: string | null;
  authorizationCode: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  patient: ITransactionUser | null;
  doctor: ITransactionUser | null;
}

export interface IPaymentQueryParams extends IQueryParams<PaymentStatus | ''> {
  channel?: PaymentChannel | '';
  amountMin?: string;
  amountMax?: string;
  from?: string;
  to?: string;
}

export interface ITransactionQueryParams extends IQueryParams<TransactionStatus | ''> {
  amountMin?: string;
  amountMax?: string;
  from?: string;
  to?: string;
  type?: string;
}

export interface IWallet {
  gross: number;
  net: number;
}

export interface IWithdrawRequest {
  methodId: string;
  amount: number;
}

export type CardProps = {
  type: PaymentType;
  name: string;
  number: string;
};

export interface ICreatePaymentDetails {
  reference: string;
  accountNumber: string;
  type: PaymentType;
  bankCode: string;
  isDefault: boolean;
}

export interface IPaymentDetails extends ICreatePaymentDetails {
  id: string;
}

export interface IRate {
  amount: number;
  lengthOfSession?: number;
}

export interface IBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: PaymentType;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICheckout {
  authorization_url: string;
  access_code: string;
}

export interface IPendingPaymentSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface IPendingPaymentDoctor {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

export interface IPendingPayment {
  reference: string;
  status: 'pending' | 'failed';
  totalAmount: number;
  subtotal: number;
  tax: number;
  currency: 'GHS';
  createdAt: string;
  expiresAt: string;
  secondsLeft: number;
  canRetry: boolean;
  slot: IPendingPaymentSlot | null;
  doctor: IPendingPaymentDoctor | null;
  reason: string | null;
  additionalInfo: string | null;
  isFollowUp: boolean;
}

export interface IRetryPaymentResponse extends ICheckout {
  reference: string;
  expiresAt: string;
  secondsLeft: number;
}
