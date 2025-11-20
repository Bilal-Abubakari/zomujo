import { createAsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';
import axios, { axiosErrorHandler } from '@/lib/axios';
import { generateSuccessToast } from '@/lib/utils';
import { IResponse } from '@/types/shared.interface';
import { IReviewRequest } from '@/types/review.interface';

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
