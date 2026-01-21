'use client';

import { getGreeting } from '@/lib/date';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/app/dashboard/_components/statsCards';
import { JSX, useEffect, useState } from 'react';
import { IStatsCard } from '@/types/stats.interface';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { selectUser, selectExtra } from '@/lib/features/auth/authSelector';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { IHospital } from '@/types/hospital.interface';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Globe, MapPin, Building2, BedDouble, Languages, Stethoscope, Building } from 'lucide-react';
import { getHospitalAppointmentStats } from '@/lib/features/hospital-appointments/hospitalAppointmentsThunk';
import { getHospitalAppointmentTrends } from '@/lib/features/analytics/analyticsThunk';
import moment from 'moment';

const HospitalHome = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  const extra = useAppSelector(selectExtra) as IHospital | undefined;
  const dispatch = useAppDispatch();
  const router = useRouter();
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
        // Fetch current appointment statistics
        const { payload: statsPayload } = await dispatch(getHospitalAppointmentStats());

        if (statsPayload && showErrorToast(statsPayload)) {
          toast(statsPayload);
          setIsLoading(false);
          return;
        }

        const currentStats = statsPayload as { total: number; accepted: number; pending: number; cancelled: number };

        // Fetch trends for percentage calculation
        const now = moment();
        const startOfMonth = now.clone().startOf('month');
        const endOfMonth = now.clone().endOf('month');
        const startOfLastMonth = now.clone().subtract(1, 'month').startOf('month');
        const endOfLastMonth = now.clone().subtract(1, 'month').endOf('month');

        // Fetch current month trends
        const { payload: currentTrendsPayload } = await dispatch(
          getHospitalAppointmentTrends({
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString(),
          }),
        );

        // Fetch last month trends for comparison
        const { payload: lastTrendsPayload } = await dispatch(
          getHospitalAppointmentTrends({
            startDate: startOfLastMonth.toISOString(),
            endDate: endOfLastMonth.toISOString(),
          }),
        );

        let totalPercentage = '0';
        let totalTrend: 'up' | 'down' = 'up';

        if (currentTrendsPayload && !showErrorToast(currentTrendsPayload) && lastTrendsPayload && !showErrorToast(lastTrendsPayload)) {
          const currentTrends = currentTrendsPayload as { total: number; thisMonth: number; lastMonth: number; percentage: number };
          const lastTrends = lastTrendsPayload as { total: number; thisMonth: number; lastMonth: number; percentage: number };

          // Calculate percentage change for total
          const currentTotal = currentTrends.thisMonth || currentTrends.total;
          const lastTotal = lastTrends.thisMonth || lastTrends.total;
          
          if (lastTotal > 0) {
            const percentageChange = ((currentTotal - lastTotal) / lastTotal) * 100;
            totalPercentage = Math.abs(percentageChange).toFixed(1);
            totalTrend = percentageChange >= 0 ? 'up' : 'down';
          } else if (currentTotal > 0) {
            totalPercentage = '100';
            totalTrend = 'up';
          }
        } else if (currentTrendsPayload && !showErrorToast(currentTrendsPayload)) {
          const trends = currentTrendsPayload as { total: number; thisMonth: number; lastMonth: number; percentage: number };
          totalPercentage = Math.abs(trends.percentage || 0).toFixed(1);
          totalTrend = (trends.percentage || 0) >= 0 ? 'up' : 'down';
        }

        // For pending and accepted, we'll use a simple calculation based on trends
        // In a real scenario, you'd want to fetch status-specific trends
        // For now, we'll use the overall trend as a proxy
        const pendingPercentage = totalPercentage;
        const acceptedPercentage = totalPercentage;
        const pendingTrend = totalTrend;
        const acceptedTrend = totalTrend;

        setStats([
          {
            title: 'Total Appointments',
            value: String(currentStats.total || 0),
            percentage: totalPercentage,
            trend: totalTrend,
          },
          {
            title: 'Pending Appointments',
            value: String(currentStats.pending || 0),
            percentage: pendingPercentage,
            trend: pendingTrend,
          },
          {
            title: 'Accepted Appointments',
            value: String(currentStats.accepted || 0),
            percentage: acceptedPercentage,
            trend: acceptedTrend,
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

  const handleStatsCardClick = (): void => {
    router.push('/dashboard/analytics');
  };

  // Use the hospital data from extra (already available from login)
  // Hospital users don't need to fetch hospital data separately
  const displayHospital = extra;
  const organizationType = displayHospital?.organizationType || displayHospital?.specialties?.[0] || 'Hospital';
  const addressParts = [
    displayHospital?.street,
    displayHospital?.city,
    displayHospital?.state,
    displayHospital?.country,
  ].filter(Boolean);

  return (
    <div className="pb-20">
      <div className="flex flex-col">
        <span className="text-[38px] font-bold">{getGreeting()}</span>
        <span className="text-grayscale-500">
          Welcome to {extra?.name || 'your hospital'} dashboard
        </span>
      </div>
      <div className="mt-10 flex flex-wrap justify-evenly gap-6">
        <StatsCards statsData={stats} isLoading={isLoading} onClick={handleStatsCardClick} />
      </div>
      <div className="mt-8">
        <Card className="rounded-2xl">
          <CardContent className="p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <CardTitle className="mb-2 text-2xl font-bold text-gray-900">
                  {displayHospital?.name || 'Hospital Overview'}
                </CardTitle>
                {displayHospital?.description && (
                  <p className="mt-2 text-gray-600">{displayHospital.description}</p>
                )}
              </div>
              {displayHospital?.organizationType && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
                  {displayHospital.organizationType}
                </span>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Contact & Location Section */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Building2 size={20} className="text-primary" />
                  Contact & Location
                </h3>
                <div className="space-y-3">
                  {displayHospital?.mainPhone && (
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-gray-400" />
                      <a
                        href={`tel:${displayHospital.mainPhone}`}
                        className="text-gray-600 hover:text-primary transition-colors"
                      >
                        {displayHospital.mainPhone}
                      </a>
                    </div>
                  )}
                  {displayHospital?.mainEmail && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-gray-400" />
                      <a
                        href={`mailto:${displayHospital.mainEmail}`}
                        className="text-gray-600 hover:text-primary transition-colors"
                      >
                        {displayHospital.mainEmail}
                      </a>
                    </div>
                  )}
                  {displayHospital?.website && (
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-gray-400" />
                      <a
                        href={displayHospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary transition-colors"
                      >
                        {displayHospital.website}
                      </a>
                    </div>
                  )}
                  {(addressParts.length > 0 || displayHospital?.location) && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="mt-0.5 text-gray-400" />
                      <div className="text-gray-600">
                        {addressParts.length > 0 ? addressParts.join(', ') : displayHospital?.location}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Features Section */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Stethoscope size={20} className="text-primary" />
                  Key Features
                </h3>
                <div className="flex flex-wrap gap-3">
                  {displayHospital?.hasEmergency && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                      Emergency Services
                    </span>
                  )}
                  {displayHospital?.telemedicine && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      Telemedicine
                    </span>
                  )}
                  {displayHospital?.bedCount && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      <BedDouble size={14} />
                      {displayHospital.bedCount} Beds
                    </span>
                  )}
                  {displayHospital?.isActive !== undefined && (
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        displayHospital.isActive
                          ? 'bg-success-100 text-success-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {displayHospital.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>

                {/* Additional Info */}
                {(displayHospital?.languages?.length || displayHospital?.specialties?.length) && (
                  <div className="mt-4 space-y-3">
                    {displayHospital?.languages && displayHospital.languages.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Languages size={16} className="text-gray-400" />
                          Languages
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {displayHospital.languages.map((lang, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {displayHospital?.specialties && displayHospital.specialties.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Building size={16} className="text-gray-400" />
                          Specialties
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {displayHospital.specialties.slice(0, 5).map((specialty, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                            >
                              {specialty}
                            </span>
                          ))}
                          {displayHospital.specialties.length > 5 && (
                            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                              +{displayHospital.specialties.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalHome;

