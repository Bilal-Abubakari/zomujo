import { IPatientWithRecord } from '@/types/patient.interface';
import { createSlice } from '@reduxjs/toolkit';

interface PatientsState {
  patientWithRecords: IPatientWithRecord | undefined;
}

const initialState: PatientsState = {
  patientWithRecords: undefined,
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    updatePatientWithRecords: (state, { payload }) => {
      state.patientWithRecords = {
        ...state.patientWithRecords,
        ...payload,
      };
    },
    updatePatientRecord: (state, { payload }) => {
      if (!state.patientWithRecords) {
        return;
      }

      state.patientWithRecords.record = {
        ...state.patientWithRecords.record,
        ...payload,
      };
    },
  },
});

export const { updatePatientWithRecords, updatePatientRecord } = patientsSlice.actions;

export default patientsSlice.reducer;
