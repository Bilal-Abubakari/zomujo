export interface ILeaderboardEntry {
  rank: number;
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  specializations: string[];
  rate: number;
  completedAppointments: number;
  isCurrentUser: boolean;
  totalEarnings?: number;
}

export interface IAdminLeaderboardEntry {
  rank: number;
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  specializations: string[];
  rate: number;
  fee: number;
  experience: number;
  completedAppointments: number;
  totalEarnings: number;
}

export interface IAdminLeaderboardResponse {
  rows: IAdminLeaderboardEntry[];
  nextCursor: string | null;
  hasMore: boolean;
}
