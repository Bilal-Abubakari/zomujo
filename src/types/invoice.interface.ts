export type ServiceInvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export interface IDoctorService {
  id: string;
  name: string;
  price: number; // in pesewas
  description: string | null;
  isActive: boolean;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IServiceInvoiceItem {
  id: string;
  name: string;
  description: string | null;
  amount: number; // in pesewas
  serviceId: string | null;
  createdAt: string;
}

export interface IInvoiceUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

export interface IServiceInvoice {
  id: string;
  reference: string;
  status: ServiceInvoiceStatus;
  totalAmount: number; // in pesewas
  notes: string | null;
  doctorId: string;
  patientId: string;
  items: IServiceInvoiceItem[];
  doctor: IInvoiceUser;
  patient: IInvoiceUser;
  patientName: string;
  patientEmail: string;
  paymentReference: string | null;
  paidAt: string | null;
  emailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateInvoicePayload {
  patientName: string;
  patientEmail: string;
  patientId?: string;
  items: Array<{
    name: string;
    description?: string;
    amount: number; // in pesewas
    serviceId?: string;
  }>;
  notes?: string;
}

export interface ICreateServicePayload {
  name: string;
  price: number; // in pesewas
  description?: string;
}

export interface IUpdateServicePayload {
  name?: string;
  price?: number; // in pesewas
  description?: string;
  isActive?: boolean;
}

export interface IInvoiceSendResponse {
  reference: string;
  paymentUrl: string;
}

export interface IInvoicePayResponse {
  authorizationUrl: string;
  reference: string;
}

export interface IInvoiceLinkResponse {
  reference: string;
  paymentUrl: string;
}

export interface IConfirmPaymentResponse {
  id: string;
  reference: string;
  paidAt: string;
  paymentChannel: string;
}

export interface IServiceQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  isActive?: boolean;
}

// Local form type (client-side only)
export interface IInvoiceLineItem {
  _id: string;
  name: string;
  description: string;
  amount: string; // string for input binding (GHS)
  serviceId?: string;
}
