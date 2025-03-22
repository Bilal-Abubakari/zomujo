import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

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

interface IQuery {
  tab: Tab;
  appointmentType: MedicalAppointmentType;
  [PaymentVerification.reference]: string;
  appointmentView: AppointmentView;
}

type QueryParamKey = keyof IQuery;

type QueryParamValue = IQuery[QueryParamKey];

export function useQueryParam(): {
  updateQuery: (key: QueryParamKey, value: QueryParamValue) => void;
  getQueryParam: (key: QueryParamKey) => QueryParamValue;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateQuery = (key: QueryParamKey, value: QueryParamValue): void => {
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    currentSearchParams.set(key, value);
    router.push(`${pathname}?${currentSearchParams.toString()}`);
  };

  const getQueryParam = useCallback(
    (key: QueryParamKey): QueryParamValue => searchParams.get(key) as QueryParamValue,
    [searchParams],
  );

  return { updateQuery, getQueryParam };
}
