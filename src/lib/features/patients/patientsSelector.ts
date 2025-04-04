import { RootState } from '@/lib/store';
import { createSelector } from '@reduxjs/toolkit';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectPatients = ({ patients }: RootState) => patients;

export const selectPatientWithRecord = createSelector(
  selectPatients,
  ({ patientWithRecords }) => patientWithRecords,
);
