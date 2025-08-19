import { createSelector } from '@reduxjs/toolkit';
import { selectExtra } from '@/lib/features/auth/authSelector';

export const selectDoctorSignature = createSelector(selectExtra, (extra) =>
  extra && 'signaturePath' in extra ? extra?.signaturePath : null,
);
