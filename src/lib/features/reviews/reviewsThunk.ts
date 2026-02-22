import { createAsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { generateSuccessToast, getValidQueryString } from '@/lib/utils';
import { IResponse, IPagination, IQueryParams } from '@/types/shared.interface';
import { IReviewRequest, IReview, ILandingPageReview } from '@/types/review.interface';

export const createReview = createAsyncThunk(
  'reviews/create-review',
  async (data: IReviewRequest): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`common/reviews`, data);

      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getReviews = createAsyncThunk(
  'reviews/getReviews',
  async (query: IQueryParams<''>): Promise<IPagination<IReview> | Toast> => {
    try {
      const { data } = await axios.get<IResponse<IPagination<IReview>>>(
        `common/reviews?${getValidQueryString(query)}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const completeReview = createAsyncThunk(
  'reviews/completeReview',
  async (id: string): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse>(`common/reviews/complete/${id}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const skipReview = createAsyncThunk(
  'reviews/skipReview',
  async (id: string): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.patch<IResponse>(`common/reviews/skip/${id}`);
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getLandingPageReviews = createAsyncThunk(
  'reviews/getLandingPageReviews',
  async (): Promise<ILandingPageReview[] | Toast> => {
    try {
      const { data } = await axios.get<IResponse<ILandingPageReview[]>>(
        'common/reviews/landing-page',
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
