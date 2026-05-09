import { JSX } from 'react';
import AdminDoctorLeaderboard from './_components/AdminDoctorLeaderboard';

const AdminDoctorLeaderboardPage = (): JSX.Element => (
  <div className="space-y-4 p-6">
    <div className="flex flex-col">
      <span className="text-[32px] font-bold">Doctor Leaderboard</span>
      <span className="text-grayscale-500 text-sm">
        Full performance data for all accepted doctors
      </span>
    </div>
    <AdminDoctorLeaderboard />
  </div>
);

export default AdminDoctorLeaderboardPage;
