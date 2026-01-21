import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IHospitalAppointment } from '@/types/hospital-appointment.interface';
import {
  createHospitalAppointment,
  getHospitalAppointments,
  getHospitalAppointmentById,
  updateHospitalAppointment,
  acceptHospitalAppointment,
  declineHospitalAppointment,
  assignDoctorToHospitalAppointment,
  getHospitalAppointmentStats,
} from './hospitalAppointmentsThunk';

interface HospitalAppointmentsState {
  appointments: IHospitalAppointment[];
  currentAppointment: IHospitalAppointment | undefined;
  stats: {
    total: number;
    accepted: number;
    pending: number;
    cancelled: number;
  } | undefined;
  isLoading: boolean;
}

const initialState: HospitalAppointmentsState = {
  appointments: [],
  currentAppointment: undefined,
  stats: undefined,
  isLoading: false,
};

const hospitalAppointmentsSlice = createSlice({
  name: 'hospitalAppointments',
  initialState,
  reducers: {
    setCurrentAppointment: (state, action: PayloadAction<IHospitalAppointment | undefined>) => {
      state.currentAppointment = action.payload;
    },
    clearAppointments: (state) => {
      state.appointments = [];
      state.currentAppointment = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get appointments
      .addCase(getHospitalAppointments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHospitalAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && 'rows' in action.payload) {
          state.appointments = action.payload.rows;
        }
      })
      .addCase(getHospitalAppointments.rejected, (state) => {
        state.isLoading = false;
      })
      // Get appointment by ID
      .addCase(getHospitalAppointmentById.fulfilled, (state, action) => {
        if (action.payload && 'id' in action.payload) {
          state.currentAppointment = action.payload as IHospitalAppointment;
        }
      })
      // Get stats
      .addCase(getHospitalAppointmentStats.fulfilled, (state, action) => {
        if (action.payload && 'total' in action.payload) {
          state.stats = action.payload as { total: number; accepted: number; pending: number; cancelled: number };
        }
      });
  },
});

export const { setCurrentAppointment, clearAppointments } = hospitalAppointmentsSlice.actions;
export default hospitalAppointmentsSlice.reducer;
