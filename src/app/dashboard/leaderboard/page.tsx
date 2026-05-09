import { JSX } from 'react';
import DoctorLeaderboard from './_components/DoctorLeaderboard';

const LeaderboardPage = (): JSX.Element => (
  <div className="space-y-4 p-6">
    <div className="flex flex-col">
      <span className="text-[32px] font-bold">Doctor Leaderboard</span>
      <span className="text-grayscale-500 text-sm">
        Top-performing doctors ranked by completed appointments
      </span>
    </div>
    <DoctorLeaderboard />
  </div>
);

export default LeaderboardPage;
