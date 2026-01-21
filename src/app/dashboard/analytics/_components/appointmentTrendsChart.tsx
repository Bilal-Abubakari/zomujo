'use client';

import { JSX } from 'react';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { IAnalyticsTrend } from '@/types/analytics.interface';
import moment from 'moment';

interface AppointmentTrendsChartProps {
  data: IAnalyticsTrend[];
  isLoading?: boolean;
}

const chartConfig = {
  appointments: {
    label: 'Appointments',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const AppointmentTrendsChart = ({ data, isLoading }: AppointmentTrendsChartProps): JSX.Element => {
  // Format data for chart
  const chartData = data.map((item) => ({
    date: moment(item.date).format('MMM DD'),
    value: item.total,
    fullDate: moment(item.date).format('LL'),
  }));

  if (isLoading || !chartData.length) {
    return (
      <Card className="rounded-2xl">
        <CardTitle className="p-8 text-grayscale-500 text-base font-medium">Appointment Trends</CardTitle>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-grayscale-500">Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardTitle className="p-8 text-grayscale-500 text-base font-medium">Appointment Trends</CardTitle>
      <CardContent className="max-md:p-1">
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
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
              tickFormatter={(value) => String(value)}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Appointments</span>
                          <span className="font-bold text-muted-foreground">{payload[0].value}</span>
                          {payload[0].payload?.fullDate && (
                            <span className="text-[0.70rem] text-muted-foreground">{payload[0].payload.fullDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
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
      </CardContent>
      <CardFooter className="items-start gap-8 p-8">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-black">
            {chartData.reduce((sum, item) => sum + item.value, 0)}
          </span>
          <span className="text-grayscale-500 text-xs 2xl:text-sm">Total Appointments</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AppointmentTrendsChart;
