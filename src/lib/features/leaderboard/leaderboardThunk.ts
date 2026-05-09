import axios, { axiosErrorHandler } from '@/lib/axios';
import { IAdminLeaderboardResponse, ILeaderboardEntry } from '@/types/leaderboard.interface';
import { IResponse } from '@/types/shared.interface';
import { Toast } from '@/hooks/use-toast';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getDoctorLeaderboard = createAsyncThunk(
  'leaderboard/doctors',
  async (): Promise<ILeaderboardEntry[] | Toast> => {
    try {
      const { data } = await axios.get<IResponse<ILeaderboardEntry[]>>('doctors/leaderboard');
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);

export const getAdminDoctorLeaderboard = createAsyncThunk(
  'leaderboard/adminDoctors',
  async ({
    cursor,
    limit,
  }: {
    cursor?: string;
    limit?: number;
  }): Promise<IAdminLeaderboardResponse | Toast> => {
    try {
      const params = new URLSearchParams();
      if (cursor) {
        params.set('cursor', cursor);
      }
      if (limit) {
        params.set('limit', String(limit));
      }
      const query = params.toString();
      const computedQuery = query ? `?${query}` : '';
      const { data } = await axios.get<IResponse<IAdminLeaderboardResponse>>(
        `admins/leaderboard/doctors${computedQuery}`,
      );
      return data.data;
    } catch (error) {
      return axiosErrorHandler(error, true) as Toast;
    }
  },
);
