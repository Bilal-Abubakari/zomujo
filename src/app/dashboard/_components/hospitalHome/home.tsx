'use client';

import { getGreeting } from '@/lib/date';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/app/dashboard/_components/statsCards';
import { JSX, useEffect, useState } from 'react';
import { IStatsCard } from '@/types/stats.interface';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { selectUser, selectExtra } from '@/lib/features/auth/authSelector';
import { getAppointments } from '@/lib/features/appointments/appointmentsThunk';
import { IAppointment } from '@/types/appointment.interface';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { OrderDirection } from '@/types/shared.enum';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { IPagination } from '@/types/shared.interface';
import { IHospital } from '@/types/hospital.interface';

const HospitalHome = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  const extra = useAppSelector(selectExtra) as IHospital | undefined;
  const dispatch = useAppDispatch();
  const [stats, setStats] = useState<IStatsCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      if (!user?.id || !extra?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch appointments for the hospital
        const { payload } = await dispatch(
          getAppointments({
            orgId: extra.id,
            orderBy: 'createdAt',
            orderDirection: OrderDirection.Descending,
            page: 1,
            pageSize: 1,
            search: '',
            status: '',
          }),
        );

        if (payload && showErrorToast(payload)) {
          toast(payload);
          setIsLoading(false);
          return;
        }

        const appointments = payload as IPagination<IAppointment>;
        const totalAppointments = appointments?.total || 0;

        // Count appointments by status
        const { payload: pendingPayload } = await dispatch(
          getAppointments({
            orgId: extra.id,
            orderBy: 'createdAt',
            orderDirection: OrderDirection.Descending,
            page: 1,
            pageSize: 1,
            search: '',
            status: AppointmentStatus.Pending,
          }),
        );

        const { payload: acceptedPayload } = await dispatch(
          getAppointments({
            orgId: extra.id,
            orderBy: 'createdAt',
            orderDirection: OrderDirection.Descending,
            page: 1,
            pageSize: 1,
            search: '',
            status: AppointmentStatus.Accepted,
          }),
        );

        const pendingAppointments =
          pendingPayload && !showErrorToast(pendingPayload)
            ? (pendingPayload as IPagination<IAppointment>).total || 0
            : 0;
        const acceptedAppointments =
          acceptedPayload && !showErrorToast(acceptedPayload)
            ? (acceptedPayload as IPagination<IAppointment>).total || 0
            : 0;

        setStats([
          {
            title: 'Total Appointments',
            value: String(totalAppointments),
            percentage: '0',
            trend: 'up',
          },
          {
            title: 'Pending Appointments',
            value: String(pendingAppointments),
            percentage: '0',
            trend: 'up',
          },
          {
            title: 'Accepted Appointments',
            value: String(acceptedAppointments),
            percentage: '0',
            trend: 'up',
          },
        ]);
      } catch (error) {
        console.error('Error fetching hospital stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();
  }, [user, extra, dispatch]);

  return (
    <div className="pb-20">
      <div className="flex flex-col">
        <span className="text-[38px] font-bold">{getGreeting()}</span>
        <span className="text-grayscale-500">
          Welcome to {extra?.name || 'your hospital'} dashboard
        </span>
      </div>
      <div className="mt-10 flex flex-wrap justify-evenly gap-6">
        <StatsCards statsData={stats} />
      </div>
      <div className="mt-8">
        <Card className="rounded-2xl">
          <CardContent className="p-8">
            <CardTitle className="mb-4 text-grayscale-500 text-base font-medium">
              Hospital Overview
            </CardTitle>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hospital Information</h3>
                <p className="text-gray-600">
                  {extra?.name || 'Hospital name not available'}
                </p>
                {extra?.location && (
                  <p className="text-gray-600">Location: {extra.location}</p>
                )}
                {extra?.email && (
                  <p className="text-gray-600">Email: {extra.email}</p>
                )}
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Manage your hospital appointments, view bookings, and update settings from the
                  navigation menu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalHome;

