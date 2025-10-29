type PaymentType = 'mobile_money' | 'ghipss';

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
  lengthOfSession: string;
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
