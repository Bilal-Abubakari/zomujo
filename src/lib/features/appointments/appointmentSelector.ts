import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import { RequestStatus } from '@/types/shared.enum';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectAppointments = ({ appointments }: RootState) => appointments;

export const selectAppointment = createSelector(
  selectAppointments,
  (appointments) => appointments.appointment,
);

export const selectSymptoms = createSelector(
  selectAppointment,
  (appointment) => appointment?.symptoms,
);

export const selectComplaints = createSelector(selectSymptoms, (symptoms) => symptoms?.complaints);

export const selectAppointmentLabs = createSelector(
  selectAppointment,
  (appointment) => appointment?.lab,
);

export const selectConductedLabs = createSelector(selectAppointmentLabs, (labs) =>
  labs?.filter(({ status }) => status === RequestStatus.Completed),
);

export const selectRequestedLabs = createSelector(selectAppointmentLabs, (labs) =>
  labs?.filter(({ status }) => status === RequestStatus.Pending),
);

export const selectLabIds = createSelector(selectAppointmentLabs, (labs) =>
  labs?.map(({ id }) => id),
);

export const selectIsLoading = createSelector(
  selectAppointments,
  (appointments) => appointments.isLoading,
);

export const selectDiagnoses = createSelector(
  selectAppointment,
  (appointment) => appointment?.diagnosis ?? [],
);
