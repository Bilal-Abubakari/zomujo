import { IAppointment } from '@/types/appointment.interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getConsultationAppointment } from '@/lib/features/appointments/consultation/consultationThunk';
import { IConsultationSymptoms } from '@/types/consultation.interface';

interface AppointmentsState {
  appointment: IAppointment | undefined;
  isLoading: boolean;
  showReviewModal: boolean;
  reviewAppointmentId: string | undefined;
}
const initialState: AppointmentsState = {
  appointment: undefined,
  isLoading: false,
  showReviewModal: false,
  reviewAppointmentId: undefined,
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointment: (state, action: PayloadAction<IAppointment>) => {
      state.appointment = action.payload;
    },
    updateAppointmentNotes: (state, action: PayloadAction<string>) => {
      if (state.appointment) {
        state.appointment.notes = action.payload;
      }
    },
    updateAppointmentHistoryNotes: (state, action: PayloadAction<string>) => {
      if (state.appointment) {
        state.appointment.historyNotes = action.payload;
      }
    },
    updateSymptoms: (state, action: PayloadAction<IConsultationSymptoms>) => {
      if (state.appointment) {
        state.appointment.symptoms = {
          ...state.appointment.symptoms,
          ...action.payload,
        };
      }
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      if (state.appointment) {
        state.appointment.isAuthenticated = action.payload;
      }
    },
    showReviewModal: (state, action: PayloadAction<{ appointmentId: string }>) => {
      state.showReviewModal = true;
      state.reviewAppointmentId = action.payload.appointmentId;
    },
    hideReviewModal: (state) => {
      state.showReviewModal = false;
      state.reviewAppointmentId = undefined;
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

export const {
  setAppointment,
  updateSymptoms,
  setIsAuthenticated,
  showReviewModal,
  hideReviewModal,
  updateAppointmentNotes,
  updateAppointmentHistoryNotes,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
