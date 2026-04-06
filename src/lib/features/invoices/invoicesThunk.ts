import { createAsyncThunk } from '@reduxjs/toolkit';
import { IPagination, IQueryParams, IResponse } from '@/types/shared.interface';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { Toast } from '@/hooks/use-toast';
import { downloadBlob, generateSuccessToast, getValidQueryString } from '@/lib/utils';
import {
  IDoctorService,
  IServiceInvoice,
  ICreateInvoicePayload,
  ICreateServicePayload,
  IUpdateServicePayload,
  IInvoiceSendResponse, // used for typing the axios response only
  IInvoicePayResponse,
  IInvoiceLinkResponse,
  IConfirmPaymentResponse,
  IServiceQueryParams,
  ServiceInvoiceStatus,
} from '@/types/invoice.interface';

const INVOICES_PATH = 'invoices';

// ─── Service Catalog ─────────────────────────────────────────────────────────

export const createDoctorService = createAsyncThunk(
  'invoices/createService',
  async (payload: ICreateServicePayload): Promise<Toast> => {
    try {
      const { data } = await axios.post<IResponse<IDoctorService>>(
        `${INVOICES_PATH}/services`,
        payload,
      );
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getDoctorServices = createAsyncThunk(
  'invoices/getServices',
  async (queryParams: IServiceQueryParams): Promise<Toast | IPagination<IDoctorService>> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<IDoctorService>>>(
        `${INVOICES_PATH}/services?${getValidQueryString(queryParams as IQueryParams)}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const updateDoctorService = createAsyncThunk(
  'invoices/updateService',
  async ({ id, payload }: { id: string; payload: IUpdateServicePayload }): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse<IDoctorService>>(
        `${INVOICES_PATH}/services/${id}`,
        payload,
      );
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const deleteDoctorService = createAsyncThunk(
  'invoices/deleteService',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.delete<IResponse<null>>(`${INVOICES_PATH}/services/${id}`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const createInvoice = createAsyncThunk(
  'invoices/create',
  async (payload: ICreateInvoicePayload): Promise<Toast | IServiceInvoice> => {
    try {
      const { data } = await axios.post<IResponse<IServiceInvoice>>(INVOICES_PATH, payload);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getInvoices = createAsyncThunk(
  'invoices/getAll',
  async (
    queryParams: IQueryParams<ServiceInvoiceStatus | ''>,
  ): Promise<Toast | IPagination<IServiceInvoice>> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<IServiceInvoice>>>(
        `${INVOICES_PATH}?${getValidQueryString(queryParams)}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getInvoice = createAsyncThunk(
  'invoices/getOne',
  async (id: string): Promise<Toast | IServiceInvoice> => {
    try {
      const { data } = await axios.get<IResponse<IServiceInvoice>>(`${INVOICES_PATH}/${id}`);
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getPublicInvoice = createAsyncThunk(
  'invoices/getPublic',
  async (reference: string): Promise<Toast | IServiceInvoice> => {
    try {
      const { data } = await axios.get<IResponse<IServiceInvoice>>(
        `${INVOICES_PATH}/view/${reference}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const sendInvoice = createAsyncThunk('invoices/send', async (id: string): Promise<Toast> => {
  try {
    const { data } = await axios.post<IResponse<IInvoiceSendResponse>>(
      `${INVOICES_PATH}/${id}/send`,
    );
    return generateSuccessToast(data.message);
  } catch (error) {
    return axiosErrorHandler(error, true) as Toast;
  }
});

export const payInvoice = createAsyncThunk(
  'invoices/pay',
  async (id: string): Promise<Toast | IInvoicePayResponse> => {
    try {
      const { data } = await axios.post<IResponse<IInvoicePayResponse>>(
        `${INVOICES_PATH}/${id}/pay`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const downloadInvoiceReceipt = createAsyncThunk(
  'invoices/downloadReceipt',
  async ({ id, reference }: { id: string; reference: string }): Promise<Toast> => {
    try {
      const { data } = await axios.get(`${INVOICES_PATH}/${id}/receipt`, {
        responseType: 'blob',
      });
      downloadBlob(data as Blob, `receipt-${reference}.pdf`);
      return generateSuccessToast('Receipt downloaded successfully');
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const cancelInvoice = createAsyncThunk(
  'invoices/cancel',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.patch<IResponse<null>>(`${INVOICES_PATH}/${id}/cancel`);
      return generateSuccessToast(data.message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const previewInvoicePdf = createAsyncThunk(
  'invoices/previewPdf',
  async (id: string): Promise<Toast> => {
    try {
      const { data } = await axios.get<Blob>(`${INVOICES_PATH}/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(data);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      return generateSuccessToast('PDF opened in new tab');
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getInvoiceLink = createAsyncThunk(
  'invoices/getLink',
  async (id: string): Promise<Toast | IInvoiceLinkResponse> => {
    try {
      const { data } = await axios.get<IResponse<IInvoiceLinkResponse>>(
        `${INVOICES_PATH}/${id}/link`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const downloadPublicInvoicePdf = createAsyncThunk(
  'invoices/downloadPublicPdf',
  async (reference: string): Promise<Toast> => {
    try {
      const { data } = await axios.get<Blob>(`${INVOICES_PATH}/view/${reference}/pdf`, {
        responseType: 'blob',
      });
      downloadBlob(data, `invoice-${reference}.pdf`);
      return generateSuccessToast('Invoice PDF downloaded');
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const confirmPayment = createAsyncThunk(
  'invoices/confirmPayment',
  async (id: string): Promise<Toast | IConfirmPaymentResponse> => {
    try {
      const { data } = await axios.post<IResponse<IConfirmPaymentResponse>>(
        `${INVOICES_PATH}/${id}/confirm-payment`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const downloadPublicInvoiceReceipt = createAsyncThunk(
  'invoices/downloadPublicReceipt',
  async (reference: string): Promise<Toast> => {
    try {
      const { data } = await axios.get<Blob>(`${INVOICES_PATH}/view/${reference}/receipt`, {
        responseType: 'blob',
      });
      downloadBlob(data, `receipt-${reference}.pdf`);
      return generateSuccessToast('Receipt PDF downloaded');
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
