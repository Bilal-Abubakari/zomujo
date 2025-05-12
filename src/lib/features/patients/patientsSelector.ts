import { RootState } from '@/lib/store';
import { createSelector } from '@reduxjs/toolkit';
import { selectLabIds } from '@/lib/features/appointments/appointmentSelector';

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

export const selectSurgeries = createSelector(selectRecord, (record) => record?.surgeries);

export const selectFamilyMembers = createSelector(selectRecord, (record) => record?.familyMembers);

export const selectLifestyle = createSelector(selectRecord, (record) => record?.lifestyle);

export const selectAllergies = createSelector(selectRecord, (record) => record?.allergies);

export const selectLabs = createSelector(selectRecord, (record) => record?.lab);

export const selectPreviousLabs = createSelector(selectLabs, selectLabIds, (labs, labIds) =>
  labs?.filter(({ id }) => !labIds?.includes(id)),
);

export const selectConditions = createSelector(selectRecord, (record) => record?.conditions);
