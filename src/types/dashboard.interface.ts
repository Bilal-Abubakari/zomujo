export interface IPaymentStats {
  totalRevenue: number;
  platformRevenue: number;
  doctorPayouts: number;
  paystackFees: number;
  transactionsCount: number;
  refundsCount: number;
}

export interface IRecentTransactionPatient {
  fullName: string;
  email: string;
}

export interface IRecentTransaction {
  id: string;
  reference: string;
  amount: number;
  status: string;
  channel: string;
  createdAt: string;
  patient: IRecentTransactionPatient;
}

export interface IUserStats {
  allUsers: number;
  removedUsers: number;
  penndingUsers: number;
  doctors: number;
  patients: number;
  others: number;
}

export interface IActiveUsersRow {
  date: string;
  total: number;
}

export interface IActiveUsers {
  today: number;
  thisWeek: number;
  lastMonth: number;
  rows: IActiveUsersRow[];
}

export interface IAppointmentStatRow {
  date: string;
  total: number;
}

export interface IAppointmentStat {
  total: number;
  thisMonth: number;
  lastMonth: number;
  percentage: number;
  rows: IAppointmentStatRow[];
}

export interface IChartDataPoint {
  date: string;
  value: number;
}
