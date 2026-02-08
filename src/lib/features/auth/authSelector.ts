import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import { Role, Status, AcceptDeclineStatus } from '@/types/shared.enum';
import { IDoctor } from '@/types/doctor.interface';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const selectAuthentication = ({ authentication }: RootState) => authentication;

export const selectUserRole = createSelector(selectAuthentication, ({ user }) => user?.role);

export const selectIsPatient = createSelector(selectUserRole, (role) => role === Role.Patient);

export const selectIsDoctor = createSelector(selectUserRole, (role) => role === Role.Doctor);

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

export const selectIsOAuthLoading = createSelector(
  selectAuthentication,
  ({ isOAuthLoading }) => isOAuthLoading,
);

export const selectUserName = createSelector(
  selectAuthentication,
  ({ user }) => `${user?.firstName} ${user?.lastName}`,
);

export const selectUserFirstName = createSelector(
  selectAuthentication,
  ({ user }) => user?.firstName,
);

export const selectUser = createSelector(selectAuthentication, ({ user }) => user);

export const selectIsOAuthOnly = createSelector(selectUser, (user) => !!user?.isOAuthOnly);

export const selectMustUpdatePassword = createSelector(
  selectAuthentication,
  ({ user }) => user?.status === Status.Incomplete,
);

export const selectThunkState = createSelector(
  selectIsLoading,
  selectIsOAuthLoading,
  selectErrorMessage,
  (isLoading, isOAuthLoading, errorMessage) => ({ isLoading, isOAuthLoading, errorMessage }),
);

export const selectExtra = createSelector(selectAuthentication, ({ extra }) => extra);

export const selectUserId = createSelector(selectAuthentication, ({ user }) => user?.id);

export const selectPatientMustUpdateMandatoryInfo = createSelector(
  selectIsPatient,
  selectExtra,
  (isPatient, extra) => isPatient && (!extra?.dob || !extra?.gender),
);

export const selectDoctorMustCompleteOnboarding = createSelector(
  selectIsDoctor,
  selectExtra,
  (isDoctor, extra) => isDoctor && !(extra as IDoctor).MDCRegistration,
);

export const selectUserProfilePicture = createSelector(
  selectExtra,
  (extra) => extra?.profilePicture ?? '',
);

export const selectDoctorStatus = createSelector(selectIsDoctor, selectExtra, (isDoctor, extra) => {
  if (!isDoctor || !extra) {
    return null;
  }
  return (extra as IDoctor).status;
});
export const selectHideOnboardingModal = createSelector(
  selectAuthentication,
  ({ hideOnboardingModal }) => hideOnboardingModal,
);

export const selectShouldShowDoctorOnboardingModal = createSelector(
  selectIsDoctor,
  selectDoctorStatus,
  selectExtra,
  selectHideOnboardingModal,
  (isDoctor, status, extra, hideModal) => {
    if (!isDoctor || hideModal) {
      return false;
    }

    const doctorExtra = extra as IDoctor;
    if (!doctorExtra) {
      return false;
    }

    // Check if profile is incomplete (same logic as ProfileCompletionCard)
    const hasProfileInfo =
      doctorExtra.experience &&
      doctorExtra.specializations?.length > 0 &&
      doctorExtra.languages?.length > 0 &&
      doctorExtra.bio;

    const isProfileIncomplete =
      !hasProfileInfo || !doctorExtra.fee || !doctorExtra.hasDefaultPayment;

    if (status === AcceptDeclineStatus.Pending && isProfileIncomplete) {
      return true;
    }

    if (status === AcceptDeclineStatus.Accepted && isProfileIncomplete) {
      return true;
    }

    return !(status === AcceptDeclineStatus.Accepted && !isProfileIncomplete);
  },
);
