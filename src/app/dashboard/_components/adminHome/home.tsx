import { getGreeting } from '@/lib/date';
import { Card, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { SelectInput, SelectOption } from '@/components/ui/select';
import { Control, useForm } from 'react-hook-form';
import { StatsCards } from '@/app/dashboard/_components/statsCards';
import { JSX, ReactNode } from 'react';
import { IStatsCard } from '@/types/stats.interface';

const mockStatsData: IStatsCard[] = [
  { title: 'Total users', value: '560', percentage: '4.4', trend: 'up' },
  { title: 'Total doctors', value: '60', percentage: '2', trend: 'down' },
  { title: 'Total patients', value: '500', percentage: '3.1', trend: 'up' },
];

const mockDailyActiveData = [
  { date: '12 Oct', value: 55 },
  { date: '13 Oct', value: 90 },
  { date: '14 Oct', value: 70 },
  { date: '15 Oct', value: 73 },
  { date: '16 Oct', value: 80 },
  { date: '17 Oct', value: 96 },
  { date: '18 Oct', value: 60 },
];

const dailyActiveFilterOptions: SelectOption[] = [
  { value: 'daily', label: 'This Year' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
];

const mockNewUsersChartData = [
  { date: '12 Oct', value: 60 },
  { date: '13 Oct', value: 80 },
  { date: '14 Oct', value: 28 },
  { date: '15 Oct', value: 10 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const AdminHome = (): JSX.Element => {
  const { control } = useForm();
  return (
    <div className="pb-20">
      <div className="flex flex-col">
        <span className="text-[38px] font-bold">{getGreeting()}</span>
        <span className="text-grayscale-500">Track everything here</span>
      </div>
      <div className="mt-10 flex flex-wrap justify-evenly gap-6">
        <StatsCards statsData={mockStatsData} />
      </div>
      <div className="mt-8 flex gap-6 max-xl:flex-wrap">
        <Chart
          title="Daily active"
          control={control}
          statistics={[
            { title: 'Active users today', value: '0' },
            { title: 'Active users this week', value: '40' },
            { title: 'Active users this month', value: '30' },
          ]}
        >
          <ChartContainer config={chartConfig}>
            <AreaChart accessibilityLayer data={mockDailyActiveData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />
              <YAxis
                dataKey="value"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
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
        </Chart>
        <Chart
          title="New Users"
          control={control}
          statistics={[
            { title: 'New users today', value: '10' },
            { title: 'New users this week', value: '300' },
          ]}
        >
          <ChartContainer config={chartConfig}>
            <BarChart width={1000} height={3000} accessibilityLayer data={mockNewUsersChartData}>
              <CartesianGrid height={2000} vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <YAxis
                dataKey="value"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar className="h-full w-full" dataKey="value" fill="#AD91D4" radius={8} />
            </BarChart>
          </ChartContainer>
        </Chart>
      </div>
    </div>
  );
};

type ChartProps = {
  title: string;
  control: Control;
  children: ReactNode;
  statistics: { title: string; value: string }[];
};
const Chart = ({ title, control, children, statistics }: ChartProps): JSX.Element => (
  <div className="w-full grow basis-1/2">
    <Card className="rounded-2xl">
      <div className="flex justify-between p-8">
        <CardTitle className="text-grayscale-500 text-base font-medium">{title}</CardTitle>
        <SelectInput
          name={'dailyActiveFilterOptions'}
          options={dailyActiveFilterOptions}
          ref={null}
          control={control}
          className="bg-grayscale-300 max-w-[120px] rounded-3xl text-sm font-medium text-black outline-hidden focus:border-none focus:shadow-none"
        />
      </div>
      <CardContent className="max-md:p-1">{children}</CardContent>
      <CardFooter className="items-start gap-8">
        {statistics.map(({ value, title }) => (
          <div key={title} className="flex flex-col">
            <span className="text-2xl font-bold text-black">{value}</span>
            <span className="text-grayscale-500 text-xs 2xl:text-sm">{title}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  </div>
);

export default AdminHome;
