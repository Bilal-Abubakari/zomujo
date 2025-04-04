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
    setPatientWithRecords: (state, { payload }) => {
      state.patientWithRecords = payload;
    },
  },
});

export const { setPatientWithRecords } = patientsSlice.actions;

export default patientsSlice.reducer;
