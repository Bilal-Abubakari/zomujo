import { Toast } from "@/hooks/use-toast";
import axios, { axiosErrorHandler } from "@/lib/axios";
import { generateSuccessToast } from "@/lib/utils";
import { IResponse } from "@/types/shared.interface";
import { IFeedback, ISupport } from "@/types/support.interface";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const reportIssue = createAsyncThunk(
  'support/reportIssue',
  async (data:ISupport): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`common/issues`, data);
      
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
export const provideFeedback = createAsyncThunk(
  'support/provideFeedback',
  async (data:IFeedback): Promise<Toast> => {
    try {
      const {
        data: { message },
      } = await axios.post<IResponse>(`common/feedback`, data);
      
      return generateSuccessToast(message);
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
