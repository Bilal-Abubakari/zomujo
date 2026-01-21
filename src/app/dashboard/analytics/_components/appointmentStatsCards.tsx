'use client';

import { JSX } from 'react';
import { StatsCards } from '@/app/dashboard/_components/statsCards';
import { IStatsCard } from '@/types/stats.interface';
import { IAppointmentStats } from '@/types/analytics.interface';

interface AppointmentStatsCardsProps {
  stats: IAppointmentStats | null;
  trends?: {
    thisMonth: number;
    lastMonth: number;
    percentage: number;
  };
  isLoading?: boolean;
}

const AppointmentStatsCards = ({
  stats,
  trends,
  isLoading,
}: AppointmentStatsCardsProps): JSX.Element => {
  if (isLoading || !stats) {
    return <StatsCards statsData={[]} numberOfCards={4} isLoading={true} />;
  }

  const statsData: IStatsCard[] = [
    {
      title: 'Total Appointments',
      value: String(stats.total),
      percentage: trends ? String(Math.abs(trends.percentage).toFixed(1)) : '0',
      trend: trends && trends.percentage >= 0 ? 'up' : 'down',
    },
    {
      title: 'Pending Appointments',
      value: String(stats.pending),
      percentage: '0',
      trend: 'up',
    },
    {
      title: 'Accepted Appointments',
      value: String(stats.accepted),
      percentage: '0',
      trend: 'up',
    },
    {
      title: 'Cancelled Appointments',
      value: String(stats.cancelled),
      percentage: '0',
      trend: 'down',
    },
  ];

  return <StatsCards statsData={statsData} numberOfCards={4} isLoading={false} />;
};

export default AppointmentStatsCards;
