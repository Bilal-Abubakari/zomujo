'use client';

import { JSX, useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { getDoctorLeaderboard } from '@/lib/features/leaderboard/leaderboardThunk';
import { ILeaderboardEntry } from '@/types/leaderboard.interface';
import { cn, pesewasToGhc, showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { AvatarComp } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

const RankBadge = ({ rank }: { rank: number }): JSX.Element => {
  if (rank === 1) {
    return <span className="text-2xl leading-none">🥇</span>;
  }
  if (rank === 2) {
    return <span className="text-2xl leading-none">🥈</span>;
  }
  if (rank === 3) {
    return <span className="text-2xl leading-none">🥉</span>;
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
      #{rank}
    </span>
  );
};

const LeaderboardRowSkeleton = (): JSX.Element => (
  <div className="flex items-center gap-4 rounded-lg border bg-white p-4">
    <Skeleton className="h-8 w-8 rounded-full" />
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-4 w-20" />
  </div>
);

const DoctorLeaderboard = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [entries, setEntries] = useState<ILeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUserRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getDoctorLeaderboard());
      setIsLoading(false);
      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }
      if (payload) {
        setEntries(payload as ILeaderboardEntry[]);
      }
    };
    void fetchLeaderboard();
  }, [dispatch]);

  useEffect(() => {
    if (entries.length > 0 && currentUserRef.current) {
      currentUserRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [entries]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((value) => (
          <LeaderboardRowSkeleton key={value as number} />
        ))}
      </div>
    );
  }

  if (!isLoading && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-16 text-center">
        <span className="mb-3 text-5xl">🏆</span>
        <p className="text-lg font-semibold text-gray-700">No leaderboard data yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Check back once doctors have completed appointments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          ref={entry.isCurrentUser ? currentUserRef : undefined}
          className={cn(
            'flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4 transition-colors sm:flex-nowrap sm:gap-4',
            entry.isCurrentUser && 'border-primary bg-primary/5 ring-primary/20 ring-1',
          )}
        >
          {/* Rank */}
          <div className="flex w-10 shrink-0 items-center justify-center">
            <RankBadge rank={entry.rank} />
          </div>

          {/* Avatar + Name (blurred for other users) */}
          <div
            className={cn(
              'flex min-w-0 items-center gap-3',
              !entry.isCurrentUser && 'pointer-events-none blur-[6px] select-none',
            )}
          >
            <AvatarComp
              name={`${entry.firstName} ${entry.lastName}`}
              imageSrc={entry.profilePicture ?? undefined}
              className="h-10 w-10 shrink-0"
            />
            <span className="truncate font-medium text-gray-900">
              {entry.firstName} {entry.lastName}
            </span>
          </div>

          {/* Specializations */}
          {entry.specializations?.length > 0 && (
            <span className="hidden truncate text-xs text-gray-500 sm:block sm:max-w-40">
              {entry.specializations[0]}
              {entry.specializations.length > 1 && ` +${entry.specializations.length - 1}`}
            </span>
          )}

          {/* Stats (right-aligned) */}
          <div className="ml-auto flex shrink-0 items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{entry.rate.toFixed(1)}</span>
            </div>

            <div className="text-center">
              <div className="font-semibold text-gray-900">{entry.completedAppointments}</div>
              <div className="text-xs text-gray-400">appointments</div>
            </div>

            {entry.isCurrentUser && entry.totalEarnings !== undefined && (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-center">
                <div className="text-xs font-medium text-green-600">Your Earnings</div>
                <div className="font-semibold text-green-700">
                  GHS {pesewasToGhc(entry.totalEarnings).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoctorLeaderboard;
