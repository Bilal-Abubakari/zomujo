import { IPatientWithRecord } from '@/types/patient.interface';
import { createSlice } from '@reduxjs/toolkit';

interface PatientsState {
  patientWithRecords: IPatientWithRecord;
}

const initialState: PatientsState = {
  patientWithRecords: {} as IPatientWithRecord,
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
      state.patientWithRecords.record = {
        ...state.patientWithRecords.record,
        ...payload,
      };
    },
    updateConditions: (state, { payload }) => {
      const record = state.patientWithRecords?.record;
      if (!record) {
        return;
      }
      record.conditions = [...(record.conditions ?? []), payload];
    },
    updateSurgeries: (state, { payload }) => {
      const record = state.patientWithRecords?.record;
      if (!record) {
        return;
      }
      record.surgeries = [...(record.surgeries ?? []), payload];
    },
    updateFamilyMembers: (state, { payload }) => {
      const record = state.patientWithRecords?.record;
      if (!record) {
        return;
      }
      record.familyMembers = [...(record.familyMembers ?? []), payload];
    },
    updateAllergies: (state, { payload }) => {
      const record = state.patientWithRecords?.record;
      if (!record) {
        return;
      }
      record.allergies = [...(record.allergies ?? []), payload];
    },
  },
});

export const {
  updatePatientWithRecords,
  updatePatientRecord,
  updateConditions,
  updateSurgeries,
  updateFamilyMembers,
  updateAllergies,
} = patientsSlice.actions;

export default patientsSlice.reducer;
