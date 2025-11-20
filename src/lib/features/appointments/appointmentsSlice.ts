import { IAppointment } from '@/types/appointment.interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getConsultationAppointment } from '@/lib/features/appointments/consultation/consultationThunk';
import { IConsultationSymptoms } from '@/types/consultation.interface';

interface AppointmentsState {
  appointment: IAppointment | undefined;
  isLoading: boolean;
  showReviewModal: boolean;
  reviewAppointmentId: string | undefined;
  reviewRecordId: string | undefined;
}
const initialState: AppointmentsState = {
  appointment: undefined,
  isLoading: false,
  showReviewModal: false,
  reviewAppointmentId: undefined,
  reviewRecordId: undefined,
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointment: (state, action: PayloadAction<IAppointment>) => {
      state.appointment = action.payload;
    },
    updateSymptoms: (state, action: PayloadAction<IConsultationSymptoms>) => {
      if (state.appointment) {
        state.appointment.symptoms = {
          ...state.appointment.symptoms,
          ...action.payload,
        };
      }
    },
    showReviewModal: (
      state,
      action: PayloadAction<{ appointmentId: string; recordId: string }>,
    ) => {
      state.showReviewModal = true;
      state.reviewAppointmentId = action.payload.appointmentId;
      state.reviewRecordId = action.payload.recordId;
    },
    hideReviewModal: (state) => {
      state.showReviewModal = false;
      state.reviewAppointmentId = undefined;
      state.reviewRecordId = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConsultationAppointment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConsultationAppointment.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(getConsultationAppointment.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setAppointment, updateSymptoms, showReviewModal, hideReviewModal } =
  appointmentsSlice.actions;

export default appointmentsSlice.reducer;
