'use client';

import { getGreeting, getFormattedDate } from '@/lib/date';
import { Card, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { JSX, ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TooltipComp } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { StatsCards } from '@/app/dashboard/_components/statsCards';
import { IStatsCard } from '@/types/stats.interface';
import { cn, pesewasToGhc } from '@/lib/utils';
import moment from 'moment';
import {
  getPaymentStats,
  getRecentTransactions,
  getRecentPayments,
  getUserStats,
  getActiveUsers,
  getAppointmentStat,
} from '@/lib/features/dashboard/dashboardThunk';
import {
  selectPaymentStats,
  selectRecentTransactions,
  selectRecentPayments,
  selectUserStats,
  selectActiveUsers,
  selectAppointmentStat,
  selectIsLoadingUserStats,
  selectIsLoadingActiveUsers,
  selectIsLoadingAppointmentStat,
  selectIsLoadingPaymentStats,
  selectIsLoadingRecentTransactions,
  selectIsLoadingRecentPayments,
} from '@/lib/features/dashboard/dashboardSelector';
import { IChartDataPoint } from '@/types/dashboard.interface';
import { PaymentStatus, TransactionStatus } from '@/types/shared.enum';

const activeUsersChartConfig = {
  value: {
    label: 'Active Users',
    color: '#FF891C',
  },
} satisfies ChartConfig;

const appointmentsChartConfig = {
  value: {
    label: 'Appointments',
    color: '#AD91D4',
  },
} satisfies ChartConfig;

const getTransactionBadgeVariant = (
  status: string,
): 'default' | 'destructive' | 'brown' | 'gray' => {
  if (status === TransactionStatus.Success) {
    return 'default';
  }
  if (status === TransactionStatus.Pending) {
    return 'brown';
  }
  if (status === TransactionStatus.Failed || status === TransactionStatus.Reversed) {
    return 'destructive';
  }
  return 'gray';
};

const getPaymentBadgeVariant = (
  status: PaymentStatus,
): 'default' | 'destructive' | 'brown' | 'gray' => {
  if (status === PaymentStatus.Success) {
    return 'default';
  }
  if (status === PaymentStatus.Pending) {
    return 'brown';
  }
  if (status === PaymentStatus.Failed || status === PaymentStatus.Abandoned) {
    return 'destructive';
  }
  return 'gray';
};

const AdminHome = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const userStats = useAppSelector(selectUserStats);
  const activeUsers = useAppSelector(selectActiveUsers);
  const appointmentStat = useAppSelector(selectAppointmentStat);
  const paymentStats = useAppSelector(selectPaymentStats);
  const recentTransactions = useAppSelector(selectRecentTransactions);
  const recentPayments = useAppSelector(selectRecentPayments);

  const isLoadingUserStats = useAppSelector(selectIsLoadingUserStats);
  const isLoadingActiveUsers = useAppSelector(selectIsLoadingActiveUsers);
  const isLoadingAppointmentStat = useAppSelector(selectIsLoadingAppointmentStat);
  const isLoadingPaymentStats = useAppSelector(selectIsLoadingPaymentStats);
  const isLoadingRecentTransactions = useAppSelector(selectIsLoadingRecentTransactions);
  const isLoadingRecentPayments = useAppSelector(selectIsLoadingRecentPayments);

  useEffect(() => {
    void dispatch(getUserStats());
    void dispatch(getActiveUsers());
    void dispatch(getAppointmentStat());
    void dispatch(getPaymentStats());
    void dispatch(getRecentTransactions());
    void dispatch(getRecentPayments());
  }, [dispatch]);

  const userStatsCards: IStatsCard[] = userStats
    ? [
        { title: 'Total Users', value: userStats.allUsers.toLocaleString() },
        { title: 'Total Doctors', value: userStats.doctors.toLocaleString() },
        { title: 'Total Patients', value: userStats.patients.toLocaleString() },
      ]
    : [];

  const activeUsersChartData: IChartDataPoint[] = (activeUsers?.rows ?? []).map(
    ({ date, total }) => ({
      date: moment(date).format('DD MMM'),
      value: total,
    }),
  );

  const appointmentChartData: IChartDataPoint[] = (appointmentStat?.rows ?? []).map(
    ({ date, total }) => ({
      date: moment(date).format('DD MMM'),
      value: total,
    }),
  );

  let appointmentTrend: 'up' | 'down' | undefined;
  if (appointmentStat) {
    appointmentTrend = appointmentStat.percentage >= 0 ? 'up' : 'down';
  }

  return (
    <div className="pb-20">
      <div className="flex flex-col">
        <span className="text-[38px] font-bold">{getGreeting()}</span>
        <span className="text-grayscale-500">Track everything here</span>
      </div>

      {/* User Stats Cards */}
      <div className="mt-10 flex flex-wrap justify-evenly gap-6">
        <StatsCards statsData={userStatsCards} numberOfCards={3} isLoading={isLoadingUserStats} />
        {appointmentStat && (
          <StatsCards
            statsData={[
              {
                title: 'Total Appointments',
                value: appointmentStat.total.toLocaleString(),
                percentage: Math.abs(appointmentStat.percentage).toFixed(1),
                trend: appointmentTrend,
              },
            ]}
            numberOfCards={1}
            isLoading={isLoadingAppointmentStat}
          />
        )}
        {isLoadingAppointmentStat && !appointmentStat && (
          <Skeleton className="h-40 w-95 grow bg-gray-300" />
        )}
      </div>

      {/* Charts Section */}
      <div className="mt-8 flex gap-6 max-xl:flex-wrap">
        <ChartCard
          title="Daily Active Users"
          isLoading={isLoadingActiveUsers}
          statistics={[
            { title: 'Today', value: (activeUsers?.today ?? 0).toLocaleString() },
            { title: 'This Week', value: (activeUsers?.thisWeek ?? 0).toLocaleString() },
            { title: 'Last Month', value: (activeUsers?.lastMonth ?? 0).toLocaleString() },
          ]}
        >
          <ChartContainer config={activeUsersChartConfig}>
            <AreaChart accessibilityLayer data={activeUsersChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) => value}
              />
              <YAxis
                dataKey="value"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: number) => value.toLocaleString()}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area
                dataKey="value"
                type="linear"
                fill="#FF8B371D"
                fillOpacity={0.4}
                stroke="#FF891C"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard
          title="Appointments"
          isLoading={isLoadingAppointmentStat}
          statistics={[
            {
              title: 'Total',
              value: (appointmentStat?.total ?? 0).toLocaleString(),
            },
            {
              title: 'This Month',
              value: (appointmentStat?.thisMonth ?? 0).toLocaleString(),
            },
            {
              title: 'Last Month',
              value: (appointmentStat?.lastMonth ?? 0).toLocaleString(),
            },
          ]}
        >
          <ChartContainer config={appointmentsChartConfig}>
            <BarChart accessibilityLayer data={appointmentChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value: string) => value}
              />
              <YAxis
                dataKey="value"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value: number) => value.toLocaleString()}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="value" fill="#AD91D4" radius={8} />
            </BarChart>
          </ChartContainer>
        </ChartCard>
      </div>

      {/* Payment Stats Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Payment Overview</h2>
        {isLoadingPaymentStats ? (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 4 }).map((value, i) => (
              <Skeleton key={`${i}-${value}`} className="h-32 w-60 grow bg-gray-300" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            <PaymentStatCard
              label="Total Revenue"
              value={`GH₵ ${pesewasToGhc(paymentStats?.totalRevenue ?? 0).toLocaleString()}`}
              className="border-primary-100"
            />
            <PaymentStatCard
              label="Platform Revenue"
              value={`GH₵ ${pesewasToGhc(paymentStats?.platformRevenue ?? 0).toLocaleString()}`}
              className="border-blue-200"
            />
            <PaymentStatCard
              label="Doctor Payouts"
              value={`GH₵ ${pesewasToGhc(paymentStats?.doctorPayouts ?? 0).toLocaleString()}`}
              className="border-purple-200"
            />
            <PaymentStatCard
              label="Transactions"
              value={(paymentStats?.transactionsCount ?? 0).toLocaleString()}
              className="border-success-200"
            />
            <PaymentStatCard
              label="Refunds"
              value={(paymentStats?.refundsCount ?? 0).toLocaleString()}
              className="border-error-200"
            />
            <PaymentStatCard
              label="Paystack Fees"
              value={`GH₵ ${pesewasToGhc(paymentStats?.paystackFees ?? 0).toLocaleString()}`}
              className="border-yellow-200"
            />
          </div>
        )}
      </div>

      {/* Recent Payments Section */}
      <div className="mt-8">
        <h2 className="mb-1 text-xl font-bold">Recent Payments</h2>
        <p className="text-grayscale-500 mb-4 text-sm">
          The 10 most recent payments received from patients, showing the total amount charged,
          payment channel, and current status.
        </p>
        <Card className="rounded-2xl">
          <RecentPaymentsContent isLoading={isLoadingRecentPayments} payments={recentPayments} />
        </Card>
      </div>

      {/* Recent Transactions Section */}
      <div className="mt-8">
        <h2 className="mb-1 text-xl font-bold">Recent Transactions</h2>
        <p className="text-grayscale-500 mb-4 text-sm">
          The 10 most recent internal transactions generated from patient payments, including
          platform fees, doctor shares, taxes, and payouts.
        </p>
        <Card className="rounded-2xl">
          <RecentTransactionsContent
            isLoading={isLoadingRecentTransactions}
            transactions={recentTransactions}
          />
        </Card>
      </div>
    </div>
  );
};

type ChartCardProps = {
  title: string;
  children: ReactNode;
  statistics: { title: string; value: string }[];
  isLoading?: boolean;
};

const ChartCard = ({ title, children, statistics, isLoading }: ChartCardProps): JSX.Element => (
  <div className="w-full grow basis-1/2">
    <Card className="rounded-2xl">
      <div className="flex items-center justify-between p-8">
        <CardTitle className="text-grayscale-500 text-base font-medium">{title}</CardTitle>
      </div>
      <CardContent className="max-md:p-1">
        {isLoading ? <Skeleton className="h-48 w-full bg-gray-300" /> : children}
      </CardContent>
      <CardFooter className="items-start gap-8">
        {statistics.map(({ value, title: statTitle }) => (
          <div key={statTitle} className="flex flex-col">
            <span className="text-2xl font-bold text-black">{value}</span>
            <span className="text-grayscale-500 text-xs 2xl:text-sm">{statTitle}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  </div>
);

type PaymentStatCardProps = {
  label: string;
  value: string;
  className?: string;
};

const PaymentStatCard = ({ label, value, className }: PaymentStatCardProps): JSX.Element => (
  <Card className={cn('w-55 grow rounded-2xl border-l-4', className)}>
    <CardContent className="p-5">
      <p className="text-grayscale-500 mb-1 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

type RecentTransactionsContentProps = {
  isLoading: boolean;
  transactions: ReturnType<typeof selectRecentTransactions>;
};

const RecentTransactionsContent = ({
  isLoading,
  transactions,
}: RecentTransactionsContentProps): JSX.Element => {
  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((value, i) => (
          <Skeleton key={`${i}-${value}`} className="h-12 w-full bg-gray-300" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <span className="text-grayscale-400 text-sm">No recent transactions found</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Type</th>
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Reference</th>
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Amount</th>
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Status</th>
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(
            ({ id, type, reference, amount, currency, description, status, createdAt }) => (
              <tr key={id} className="border-b transition-colors last:border-0 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 capitalize">
                    {type.replaceAll('_', ' ')}
                    {description && (
                      <TooltipComp tip={description}>
                        <Info className="text-grayscale-400 h-3.5 w-3.5 shrink-0 cursor-pointer" />
                      </TooltipComp>
                    )}
                  </div>
                </td>
                <td className="text-grayscale-500 px-6 py-4 font-mono text-xs">{reference}</td>
                <td className="px-6 py-4 font-semibold">
                  {currency} {pesewasToGhc(amount).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getTransactionBadgeVariant(status)} className="capitalize">
                    {status}
                  </Badge>
                </td>
                <td className="text-grayscale-500 px-6 py-4">{getFormattedDate(createdAt)}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};

type RecentPaymentsContentProps = {
  isLoading: boolean;
  payments: ReturnType<typeof selectRecentPayments>;
};

const RecentPaymentsContent = ({
  isLoading,
  payments,
}: RecentPaymentsContentProps): JSX.Element => {
  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((value, i) => (
          <Skeleton key={`${i}-${value}`} className="h-12 w-full bg-gray-300" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <span className="text-grayscale-400 text-sm">No recent payments found</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Patient</th>
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Reference</th>
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Amount</th>
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Channel</th>
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Status</th>
            <th className="text-grayscale-500 px-6 py-4 text-left font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(
            ({ id, reference, amount, status, channel, paidAt, createdAt, patient }) => (
              <tr key={id} className="border-b transition-colors last:border-0 hover:bg-gray-50">
                <td className="px-6 py-4">
                  {patient ? (
                    <span className="font-medium">{patient.fullName}</span>
                  ) : (
                    <span className="text-grayscale-400">—</span>
                  )}
                </td>
                <td className="text-grayscale-500 px-6 py-4 font-mono text-xs">{reference}</td>
                <td className="px-6 py-4 font-semibold">
                  {'GHC'} {pesewasToGhc(amount).toLocaleString()}
                </td>
                <td className="text-grayscale-500 px-6 py-4 capitalize">
                  {channel.replaceAll('_', ' ')}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getPaymentBadgeVariant(status)} className="capitalize">
                    {status.replaceAll('_', ' ')}
                  </Badge>
                </td>
                <td className="text-grayscale-500 px-6 py-4">
                  {getFormattedDate(paidAt ?? createdAt)}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminHome;
