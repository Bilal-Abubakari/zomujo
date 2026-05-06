'use client';

import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { getAdminDoctorLeaderboard } from '@/lib/features/leaderboard/leaderboardThunk';
import { IAdminLeaderboardEntry, IAdminLeaderboardResponse } from '@/types/leaderboard.interface';
import { pesewasToGhc, showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { AvatarComp } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Loader2 } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const PAGE_LIMIT = 20;

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
  return <span className="text-sm font-semibold text-gray-600">#{rank}</span>;
};

const RowSkeleton = (): JSX.Element => (
  <tr className="border-b">
    {Array.from({ length: 8 }).map((value) => (
      <td key={value as number} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

const AdminDoctorLeaderboard = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<IAdminLeaderboardEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const initialFetched = useRef(false);

  const fetchPage = useCallback(
    async (cursor?: string): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getAdminDoctorLeaderboard({ cursor, limit: PAGE_LIMIT }));
      setIsLoading(false);
      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }
      const data = payload as IAdminLeaderboardResponse;
      setRows((prev) => (cursor ? [...prev, ...data.rows] : data.rows));
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    },
    [dispatch],
  );

  useEffect(() => {
    if (initialFetched.current) {
      return;
    }
    initialFetched.current = true;
    void fetchPage();
  }, [fetchPage]);

  const lastRowRef = useInfiniteScroll({
    isLoading,
    hasMore,
    onLoadMore: () => {
      if (nextCursor) {
        void fetchPage(nextCursor);
      }
    },
  });

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Specializations</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Appointments</th>
              <th className="px-4 py-3">Total Earnings</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                  No leaderboard data available yet.
                </td>
              </tr>
            )}

            {rows.length === 0 &&
              isLoading &&
              Array.from({ length: 8 }).map((value) => <RowSkeleton key={value as number} />)}

            {rows.map((entry, index) => {
              const isLast = index === rows.length - 1;
              return (
                <tr
                  key={entry.id}
                  ref={isLast ? lastRowRef : undefined}
                  className="border-b transition-colors hover:bg-gray-50"
                >
                  <td className="w-14 px-4 py-3">
                    <RankBadge rank={entry.rank} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarComp
                        name={`${entry.firstName} ${entry.lastName}`}
                        imageSrc={entry.profilePicture ?? undefined}
                        className="h-9 w-9 shrink-0"
                      />
                      <span className="font-medium text-gray-900">
                        {entry.firstName} {entry.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {entry.specializations?.length > 0 ? (
                      <span className="text-gray-600">
                        {entry.specializations[0]}
                        {entry.specializations.length > 1 &&
                          ` +${entry.specializations.length - 1}`}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{entry.rate.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    GHS {pesewasToGhc(entry.fee).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {entry.experience} {entry.experience === 1 ? 'yr' : 'yrs'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {entry.completedAppointments}
                  </td>
                  <td className="px-4 py-3 font-medium text-green-700">
                    GHS {pesewasToGhc(entry.totalEarnings).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Loading more spinner */}
      {isLoading && rows.length > 0 && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
        </div>
      )}

      {!hasMore && rows.length > 0 && (
        <p className="py-4 text-center text-sm text-gray-400">All doctors loaded</p>
      )}
    </div>
  );
};

export default AdminDoctorLeaderboard;
