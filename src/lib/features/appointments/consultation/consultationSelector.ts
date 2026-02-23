import { RootState } from '@/lib/store';
import { createSelector } from '@reduxjs/toolkit';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectConsultation = ({ consultation }: RootState) => consultation;

export const selectCurrentLabRequest = createSelector(
  selectConsultation,
  ({ currentLabRequest }) => currentLabRequest,
);

export const selectCurrentRadiologyRequest = createSelector(
  selectConsultation,
  ({ currentRadiologyRequest }) => currentRadiologyRequest,
);

export const selectHasInvestigation = createSelector(
  selectCurrentRadiologyRequest,
  (radiologyRequest) => !!radiologyRequest,
);
