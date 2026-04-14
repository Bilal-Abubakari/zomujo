import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { CONSULTATION_START_ALLOWED_STATUS } from '@/constants/consultation.constants';

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

export const selectConsultationStatus = createSelector(
  selectAppointment,
  (appointment) => appointment?.status,
);

export const selectCanStartConsultation = createSelector(
  selectConsultationStatus,
  (status) => status && CONSULTATION_START_ALLOWED_STATUS.includes(status),
);

export const selectHasConsultationEnded = createSelector(
  selectConsultationStatus,
  (status) => status === AppointmentStatus.Completed || status === AppointmentStatus.Incomplete,
);

export const selectIsConsultationInProgress = createSelector(
  selectConsultationStatus,
  (status) => status === AppointmentStatus.Progress,
);

export const selectIsConsultationInvestigatingProgress = createSelector(
  selectConsultationStatus,
  (status) => status === AppointmentStatus.InvestigatingProgress,
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

export const selectConductedLabs = createSelector(selectAppointmentLabs, (lab) =>
  lab?.fileUrls && lab.fileUrls.length > 0 ? lab.data : [],
);

export const selectRequestedLabs = createSelector(selectAppointmentLabs, (lab) => lab?.data || []);

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

export const selectIsConsultationAuthenticated = createSelector(
  selectAppointment,
  (appointment) => appointment?.isAuthenticated ?? false,
);

export const selectAppointmentDoctorId = createSelector(
  selectAppointment,
  (appointment) => appointment?.doctor?.id,
);

export const selectPostInvestigationData = createSelector(
  selectAppointment,
  (appointment) => appointment?.ipData,
);

export const selectIsFollowUp = createSelector(
  selectAppointment,
  (appointment) => appointment?.isFollowUp ?? false,
);

export const selectAppointmentLinkId = createSelector(
  selectAppointment,
  (appointment) => appointment?.appointmentLinkId ?? null,
);
