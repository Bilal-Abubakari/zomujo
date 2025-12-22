import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/features/auth/authSlice';
import hospitalReducer from '@/lib/features/hospitals/hospitalSlice';
import organizationRequestsReducer from '@/lib/features/organization-requests/organizationRequestsSlice';
import notificationsReducer from '@/lib/features/notifications/notificationsSlice';
import paymentsReducer from '@/lib/features/payments/paymentSlice';
import patientsReducer from '@/lib/features/patients/patientsSlice';
import appointmentsReducer from '@/lib/features/appointments/appointmentsSlice';
import consultationReducer from '@/lib/features/appointments/consultation/consultationSlice';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import aiReducer from '@/lib/features/ai/aiSlice';

const authPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['user', 'extra', 'loggedInAt', 'hideOnboardingModal'],
};

const rootReducer = combineReducers({
  authentication: persistReducer(authPersistConfig, authReducer),
  hospital: hospitalReducer,
  organizationRequests: organizationRequestsReducer,
  notifications: notificationsReducer,
  payments: paymentsReducer,
  patients: patientsReducer,
  appointments: appointmentsReducer,
  consultation: consultationReducer,
  ai: aiReducer,
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            'authentication/updateDoctorIdentification',
          ],
          ignoredPaths: [
            'authentication.doctorIdentification.front',
            'authentication.doctorIdentification.back',
          ],
        },
      }),
  });

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
