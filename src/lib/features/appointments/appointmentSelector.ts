import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { RequestStatus } from '@/types/shared.enum';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectAppointments = ({ appointments }: RootState) => appointments;

export const selectAppointment = createSelector(
  selectAppointments,
  (appointments) => appointments.appointment,
);

export const selectIsLoading = createSelector(
  selectAppointments,
  (appointments) => appointments.isLoading,
);

export const consultationStatus = createSelector(
  selectAppointment,
  (appointment) => appointment?.status,
);

export const hasConsultationEnded = createSelector(
  consultationStatus,
  (status) => status === AppointmentStatus.Completed,
);

export const isConsultationInProgress = createSelector(
  consultationStatus,
  (status) => status === AppointmentStatus.Progress,
);

export const selectSymptoms = createSelector(
  selectAppointment,
  (appointment) => appointment?.symptoms,
);

export const selectHistoryNotes = createSelector(
  selectAppointment,
  (appointment) => appointment?.historyNotes,
);

export const selectPatientSymptoms = createSelector(
  selectSymptoms,
  (symptoms) => symptoms?.symptoms,
);

export const selectComplaints = createSelector(selectSymptoms, (symptoms) =>
  symptoms?.complaints?.map((c) => c.complaint),
);

export const selectAppointmentLabs = createSelector(
  selectAppointment,
  (appointment) => appointment?.lab,
);

export const selectLabIds = createSelector(selectAppointmentLabs, (lab) =>
  lab?.data?.map((l) => l.id),
);

export const selectConductedLabs = createSelector(
  selectAppointmentLabs,
  (lab) => lab?.data?.filter((test) => !!test.fileUrl) || [],
);

export const selectRequestedLabs = createSelector(
  selectAppointmentLabs,
  (lab) => lab?.data?.filter((test) => !test.fileUrl) || [],
);

export const selectPrescriptions = createSelector(
  selectAppointment,
  (appointment) => appointment?.prescriptions ?? [],
);

export const selectDiagnoses = createSelector(
  selectAppointment,
  (appointment) => appointment?.diagnosis ?? [],
);

export const selectShowReviewModal = createSelector(
  selectAppointments,
  (appointments) => appointments.showReviewModal,
);

export const selectReviewAppointmentId = createSelector(
  selectAppointments,
  (appointments) => appointments.reviewAppointmentId,
);

export const selectAppointmentRadiology = createSelector(
  selectAppointment,
  (appointment) => appointment?.radiology,
);

export const selectRequestedRadiology = createSelector(selectAppointmentRadiology, (radiology) =>
  radiology?.status === RequestStatus.Pending ? radiology : null,
);

export const selectConductedRadiology = createSelector(selectAppointmentRadiology, (radiology) =>
  radiology?.tests?.some((test) => test.fileUrl) ? radiology : null,
);

export const selectIsConsultationAuthenticated = createSelector(
  selectAppointment,
  (appointment) => appointment?.isAuthenticated ?? false,
);

export const selectAppointmentDoctorId = createSelector(
  selectAppointment,
  (appointment) => appointment?.doctor?.id,
);
