import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import { Role, Status } from '@/types/shared.enum';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectAuthentication = ({ authentication }: RootState) => authentication;

export const selectUserRole = createSelector(selectAuthentication, ({ user }) => user?.role);

export const selectIsPatient = createSelector(selectUserRole, (role) => role === Role.Patient);

export const selectIsAnAdmin = createSelector(
  selectUserRole,
  (role) => role === Role.Admin || role === Role.SuperAdmin,
);

export const selectIsOrganizationAdmin = createSelector(
  selectUserRole,
  (role) => role === Role.Admin,
);

export const selectOrganizationId = createSelector(
  selectAuthentication,
  ({ extra }) => extra?.orgId ?? '', //extra is not undefined for logged-in users except for super admin where it will not be used anyway
);

export const selectErrorMessage = createSelector(
  selectAuthentication,
  ({ errorMessage }) => errorMessage || '',
);

export const selectIsLoading = createSelector(selectAuthentication, ({ isLoading }) => isLoading);

export const selectUserName = createSelector(
  selectAuthentication,
  ({ user }) => `${user?.firstName} ${user?.lastName}`,
);

export const selectUserFirstName = createSelector(
  selectAuthentication,
  ({ user }) => user?.firstName,
);

export const selectUser = createSelector(selectAuthentication, ({ user }) => user);

export const selectMustUpdatePassword = createSelector(
  selectAuthentication,
  ({ user }) => user?.status === Status.Incomplete,
);

export const selectThunkState = createSelector(
  selectIsLoading,
  selectErrorMessage,
  (isLoading, errorMessage) => ({ isLoading, errorMessage }),
);

export const selectExtra = createSelector(selectAuthentication, ({ extra }) => extra);

export const selectUserId = createSelector(selectAuthentication, ({ user }) => user?.id);

export const selectPatientMustUpdateMandatoryInfo = createSelector(
  selectIsPatient,
  selectExtra,
  (isPatient, extra) => isPatient && (!extra?.dob || !extra?.gender),
);
