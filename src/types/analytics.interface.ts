export interface IAnalyticsTrend {
	date: Date | string;
	total: number;
}

export interface IAppointmentTrends {
	total: number;
	thisMonth: number;
	lastMonth: number;
	percentage: number;
	rows: IAnalyticsTrend[];
}

export interface IAppointmentStats {
	total: number;
	pending: number;
	accepted: number;
	cancelled: number;
}

export interface IHospitalAnalytics {
	trends: IAppointmentTrends;
	stats: IAppointmentStats;
}

export type TimeRange = 'today' | 'week' | 'month' | 'year' | 'custom';
