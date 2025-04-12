import { RootState } from '@/lib/store';
import { createSelector } from '@reduxjs/toolkit';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectPatients = ({ patients }: RootState) => patients;

export const selectPatientWithRecord = createSelector(
  selectPatients,
  ({ patientWithRecords }) => patientWithRecords,
);

export const selectRecord = createSelector(
  selectPatientWithRecord,
  (patientWithRecords) => patientWithRecords?.record,
);

export const selectRecordId = createSelector(
  selectPatientWithRecord,
  (patientWithRecords) => patientWithRecords?.recordId,
);

export const selectMedicalConditions = createSelector(selectRecord, (record) => record?.conditions);
