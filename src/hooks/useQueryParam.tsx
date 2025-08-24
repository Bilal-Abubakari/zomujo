import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { IQueryParams } from '@/types/shared.interface';

export enum Tab {
  Doctors = 'doctors',
  Hospitals = 'hospitals',
}

export enum MedicalAppointmentType {
  Doctor = 'doctor',
  Hospital = 'hospital',
}

export enum AppointmentView {
  Upcoming = 'upcoming',
  Requests = 'requests',
}

export enum PaymentVerification {
  reference = 'reference',
}

export enum AppointmentDate {
  selectedDate = 'selectedDate',
}

export enum RecordsTab {
  Requests = 'requests',
  MyRecord = 'myRecord',
}

interface IQuery extends Pick<IQueryParams, 'specialty' | 'booking'> {
  tab: Tab;
  appointmentType: MedicalAppointmentType;
  [PaymentVerification.reference]: string;
  [AppointmentDate.selectedDate]: string;
  appointmentView: AppointmentView;
  recordsTab: RecordsTab;
  appointmentId: string;
}

export type QueryParamKey = keyof IQuery;

type QueryParamValue = IQuery[QueryParamKey];

export function useQueryParam(): {
  updateQuery: (key: QueryParamKey, value: QueryParamValue) => void;
  getQueryParam: (key: QueryParamKey) => QueryParamValue;
  hasSearchParams: boolean;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateQuery = (key: QueryParamKey, value: QueryParamValue): void => {
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    if (value) {
      currentSearchParams.set(key, String(value));
    }
    router.push(`${pathname}?${currentSearchParams.toString()}`);
  };

  const getQueryParam = useCallback(
    (key: QueryParamKey): QueryParamValue => searchParams.get(key) as QueryParamValue,
    [searchParams],
  );

  return { updateQuery, getQueryParam, hasSearchParams: !![...searchParams.values()].length };
}
