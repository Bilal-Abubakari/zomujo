import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { IStatsCard } from '@/types/stats.interface';
import { JSX } from 'react';

export type StatsCardsProps = {
  statsData: IStatsCard[];
  numberOfCards?: number;
  isLoading?: boolean;
};

const StatsCards = ({ statsData, numberOfCards = 3, isLoading }: StatsCardsProps): JSX.Element =>
  isLoading ? (
    <>
      {Array.from({ length: numberOfCards }).map((_, index) => (
        <Skeleton key={index} className="h-40 w-[380px] grow bg-gray-300" />
      ))}
    </>
  ) : (
    <>
      {statsData?.map(({ title, trend, value, percentage }) => (
        <Card key={title} className="w-[380px] grow rounded-2xl">
          <div className="flex flex-row justify-between p-5">
            <CardTitle className="text-base text-grayscale-500">{title}</CardTitle>
            <div>
              <CardTitle
                className={cn('text-sm', {
                  'text-success-500': trend === 'up',
                  'text-error-500': trend === 'down',
                })}
              >
                {percentage}%
              </CardTitle>
              <CardDescription className="text-xs text-grayscale-500">vs last week</CardDescription>
            </div>
          </div>
          <CardContent>
            <span className="text-3xl font-bold">{value}</span>
          </CardContent>
        </Card>
      ))}
    </>
  );

export { StatsCards };
