import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';

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

export const selectIsLoading = createSelector(
  selectAppointments,
  (appointments) => appointments.isLoading,
);
