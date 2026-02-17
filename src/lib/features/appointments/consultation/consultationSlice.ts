import { ILaboratoryRequest } from '@/types/labs.interface';
import { IRadiologyRequest } from '@/types/radiology.interface';
import { createSlice } from '@reduxjs/toolkit';

interface ConsultationState {
  currentLabRequest: ILaboratoryRequest[];
  currentRadiologyRequest: IRadiologyRequest | null;
}

export const initialState: ConsultationState = {
  currentLabRequest: [],
  currentRadiologyRequest: null,
};

export const consultationSlice = createSlice({
  name: 'consultation',
  initialState,
  reducers: {
    setCurrentLabRequest: (state: ConsultationState, action: { payload: ILaboratoryRequest[] }) => {
      state.currentLabRequest = action.payload;
    },
    removeLabRequest: (state: ConsultationState, action: { payload: { name: string } }) => {
      const { name } = action.payload;
      state.currentLabRequest = state.currentLabRequest.filter(({ testName }) => testName !== name);
    },
    setCurrentRadiologyRequest: (
      state: ConsultationState,
      action: { payload: IRadiologyRequest | null },
    ) => {
      state.currentRadiologyRequest = action.payload;
    },
  },
});

export const { setCurrentLabRequest, setCurrentRadiologyRequest, removeLabRequest } =
  consultationSlice.actions;

export default consultationSlice.reducer;
