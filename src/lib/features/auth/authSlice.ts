import { createSlice } from '@reduxjs/toolkit';
import {
  doctorOnboarding,
  forgotPassword,
  login,
  requestOrganization,
  resetPassword,
  signUp,
  verifyEmail,
} from '@/lib/features/auth/authThunk';
import { IDoctorIdentification, IPersonalDetails, IUser } from '@/types/auth.interface';
import {  IDoctor } from '@/types/doctor.interface';
import { IAdmin } from '@/types/admin.interface';
import { IPatient } from '@/types/patient.interface';


interface AuthenticationState {
  errorMessage: string;
  isLoading: boolean;
  currentStep: number;
  doctorPersonalDetails: IPersonalDetails | undefined;
  doctorIdentification: IDoctorIdentification | undefined;
  user: IUser | undefined;
  extra: IDoctor | IAdmin | IPatient | undefined;
  loggedInAt: undefined | string;
}

const initialState: AuthenticationState = {
  errorMessage: '',
  isLoading: false,
  currentStep: 1,
  doctorPersonalDetails: undefined,
  doctorIdentification: undefined,
  user: undefined,
  extra: undefined,
  loggedInAt: undefined,
};

const authSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setErrorMessage: (state, { payload }) => {
      state.errorMessage = payload;
    },
    updatePersonalDetails: (state, { payload }) => {
      state.doctorPersonalDetails = payload;
      state.currentStep = 2;
    },
    updateDoctorIdentification: (state, { payload }) => {
      state.doctorIdentification = payload;
      state.currentStep = 3;
    },
    updateCurrentStep: (state, { payload }) => {
      state.currentStep = payload;
    },
    setUserInfo: (state, { payload }) => {
      state.user = payload.user;
      state.extra = payload.extra;
      //Redux does not consider Date as a serializable value hence the need to stringify it
      state.loggedInAt = JSON.stringify(new Date());
    },
    updateExtra: (state, { payload }) => {
      state.extra = payload;
    },
    updateStatus: (state, { payload }) => {
      state.user!.status = payload;
    },
    resetAuthentication: (state) => {
      state.user = initialState.user;
      state.extra = initialState.extra;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.errorMessage = '';
        state.isLoading = true;
      })
      .addCase(login.fulfilled || login.rejected, (state) => {
        state.isLoading = false;
      });
    builder
      .addCase(doctorOnboarding.pending, (state) => {
        state.errorMessage = '';
        state.isLoading = true;
      })
      .addCase(doctorOnboarding.fulfilled || doctorOnboarding.rejected, (state) => {
        state.isLoading = false;
      });
    builder
      .addCase(signUp.pending, (state) => {
        state.errorMessage = '';
        state.isLoading = true;
      })
      .addCase(signUp.fulfilled || signUp.rejected, (state) => {
        state.isLoading = false;
      });
    builder
      .addCase(requestOrganization.pending, (state) => {
        state.errorMessage = '';
        state.isLoading = true;
      })
      .addCase(requestOrganization.fulfilled || requestOrganization.rejected, (state) => {
        state.isLoading = false;
      });
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.errorMessage = '';
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled || forgotPassword.rejected, (state) => {
        state.isLoading = false;
      });
    builder
      .addCase(resetPassword.pending, (state) => {
        state.errorMessage = '';
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled || resetPassword.rejected, (state) => {
        state.isLoading = false;
      });
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.errorMessage = '';
        state.isLoading = true;
      })
      .addCase(verifyEmail.fulfilled || resetPassword.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  setErrorMessage,
  updatePersonalDetails,
  updateDoctorIdentification,
  updateCurrentStep,
  setUserInfo,
  updateExtra,
  updateStatus,
  resetAuthentication,
} = authSlice.actions;
export default authSlice.reducer;
