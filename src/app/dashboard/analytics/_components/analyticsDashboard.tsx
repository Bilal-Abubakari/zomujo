'use client';

import { JSX, useEffect, useState } from 'react';
import { getGreeting } from '@/lib/date';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser, selectExtra } from '@/lib/features/auth/authSelector';
import { getHospitalAppointmentTrends, getHospitalAppointmentStatsByDateRange } from '@/lib/features/analytics/analyticsThunk';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { IHospital } from '@/types/hospital.interface';
import { TimeRange } from '@/types/analytics.interface';
import AppointmentStatsCards from './appointmentStatsCards';
import AppointmentTrendsChart from './appointmentTrendsChart';
import { SelectInput, SelectOption } from '@/components/ui/select';
import { Control, useForm } from 'react-hook-form';
import moment from 'moment';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const timeRangeOptions: SelectOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

const chartConfig = {
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-2))',
  },
  accepted: {
    label: 'Accepted',
    color: 'hsl(var(--chart-1))',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const AnalyticsDashboard = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  const extra = useAppSelector(selectExtra) as IHospital | undefined;
  const dispatch = useAppDispatch();
  const { control, watch } = useForm<{ timeRange: TimeRange }>({
    defaultValues: { timeRange: 'month' },
  });

  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const trends = useAppSelector((state) => state.analytics.trends);
  const stats = useAppSelector((state) => state.analytics.stats);

  // Watch time range changes
  const selectedTimeRange = watch('timeRange');

  useEffect(() => {
    if (selectedTimeRange !== timeRange) {
      setTimeRange(selectedTimeRange);
    }
  }, [selectedTimeRange, timeRange]);

  // Calculate date range based on selected time range
  useEffect(() => {
    const now = moment();
    let start: moment.Moment;
    let end: moment.Moment = now;

    switch (timeRange) {
      case 'today':
        start = now.clone().startOf('day');
        end = now.clone().endOf('day');
        break;
      case 'week':
        start = now.clone().startOf('isoWeek');
        end = now.clone().endOf('isoWeek');
        break;
      case 'month':
        start = now.clone().startOf('month');
        end = now.clone().endOf('month');
        break;
      case 'year':
        start = now.clone().startOf('year');
        end = now.clone().endOf('year');
        break;
      default:
        start = now.clone().startOf('month');
        end = now.clone().endOf('month');
    }

    setStartDate(start.toDate());
    setEndDate(end.toDate());
  }, [timeRange]);

  // Fetch trends data
  useEffect(() => {
    const fetchTrends = async (): Promise<void> => {
      if (!user?.id || !extra?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params: { startDate?: string; endDate?: string } = {};
        if (startDate) {
          params.startDate = startDate.toISOString();
        }
        if (endDate) {
          params.endDate = endDate.toISOString();
        }

        const { payload } = await dispatch(getHospitalAppointmentTrends(params));

        if (payload && showErrorToast(payload)) {
          toast(payload);
        }
      } catch (error) {
        console.error('Error fetching trends:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTrends();
  }, [user, extra, dispatch, startDate, endDate]);

  // Fetch stats data
  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      if (!user?.id || !extra?.id || !startDate || !endDate) {
        return;
      }

      try {
        const { payload } = await dispatch(
          getHospitalAppointmentStatsByDateRange({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        );

        if (payload && showErrorToast(payload)) {
          toast(payload);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    void fetchStats();
  }, [user, extra, dispatch, startDate, endDate]);

  // Prepare status distribution chart data
  const statusChartData = stats
    ? [
        { status: 'Pending', value: stats.pending },
        { status: 'Accepted', value: stats.accepted },
        { status: 'Cancelled', value: stats.cancelled },
      ]
    : [];

  return (
    <div className="pb-20">
      <div className="flex flex-col">
        <span className="text-[38px] font-bold">{getGreeting()}</span>
        <span className="text-grayscale-500">
          Analytics dashboard for {extra?.name || 'your hospital'}
        </span>
      </div>

      {/* Time Range Selector */}
      <div className="mt-6 flex justify-end">
        <div className="w-[200px]">
          <SelectInput
            name="timeRange"
            options={timeRangeOptions}
            ref={null}
            control={control as Control}
            className="bg-grayscale-300 rounded-3xl text-sm font-medium text-black outline-hidden focus:border-none focus:shadow-none"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-10 flex flex-wrap justify-evenly gap-6">
        <AppointmentStatsCards
          stats={stats}
          trends={trends ? { thisMonth: trends.thisMonth, lastMonth: trends.lastMonth, percentage: trends.percentage } : undefined}
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="mt-8 flex gap-6 max-xl:flex-wrap">
        {/* Trends Chart */}
        <div className="w-full grow basis-1/2">
          <AppointmentTrendsChart data={trends?.rows || []} isLoading={isLoading} />
        </div>

        {/* Status Distribution Chart */}
        <div className="w-full grow basis-1/2">
          <Card className="rounded-2xl">
            <CardTitle className="p-8 text-grayscale-500 text-base font-medium">
              Appointment Status Distribution
            </CardTitle>
            <CardContent className="max-md:p-1">
              {isLoading || !statusChartData.length ? (
                <div className="flex h-[300px] items-center justify-center">
                  <p className="text-grayscale-500">Loading chart data...</p>
                </div>
              ) : (
                <ChartContainer config={chartConfig}>
                  <BarChart accessibilityLayer data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="status"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={(value) => value}
                    />
                    <YAxis
                      dataKey="value"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => String(value)}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="value" fill="#AD91D4" radius={8} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
            <div className="p-8">
              <div className="flex items-start gap-8">
                {statusChartData.map((item) => (
                  <div key={item.status} className="flex flex-col">
                    <span className="text-2xl font-bold text-black">{item.value}</span>
                    <span className="text-grayscale-500 text-xs 2xl:text-sm">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
