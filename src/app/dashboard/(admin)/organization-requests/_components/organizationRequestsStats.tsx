import { StatsCards } from '@/app/dashboard/_components/statsCards';
import React, { JSX, useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { getOrganizationRequestsStats } from '@/lib/features/organization-requests/organizationRequestsThunk';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { IOrganizationRequestsCountResponse, IStatsCard } from '@/types/stats.interface';

const OrganizationRequestsStats = (): JSX.Element => {
  const [statsData, setStatsData] = useState<IStatsCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchRequestCounts = async (): Promise<void> => {
      const { payload } = await dispatch(getOrganizationRequestsStats());

      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoading(false);
        return;
      }

      if (payload) {
        const { all, approved, approvedInc, allInc, rejectedInc, rejected } =
          payload as IOrganizationRequestsCountResponse;

        setStatsData([
          {
            title: 'Total requests',
            value: all,
            percentage: allInc,
            trend: allInc >= 0 ? 'up' : 'down',
          },
          {
            title: 'Approved requests',
            value: approved,
            percentage: approvedInc,
            trend: approvedInc >= 0 ? 'up' : 'down',
          },
          {
            title: 'Rejected requests',
            value: rejected,
            percentage: rejectedInc,
            trend: rejectedInc >= 0 ? 'up' : 'down',
          },
        ]);
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void fetchRequestCounts();
  }, []);

  return (
    <div className="mt-10 mb-12 flex flex-wrap justify-evenly gap-6">
      <StatsCards isLoading={isLoading} statsData={statsData} />
    </div>
  );
};

export default OrganizationRequestsStats;
