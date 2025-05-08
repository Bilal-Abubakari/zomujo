import { IAppointment } from '@/types/appointment.interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getConsultationAppointment } from '@/lib/features/appointments/consultation/consultationThunk';

interface AppointmentsState {
  appointment: IAppointment | undefined;
  isLoading: boolean;
}
const initialState: AppointmentsState = {
  appointment: undefined,
  isLoading: false,
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointment: (state, action: PayloadAction<IAppointment>) => {
      state.appointment = action.payload;
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

export const { setAppointment } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
