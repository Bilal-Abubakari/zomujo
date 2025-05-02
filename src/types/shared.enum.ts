export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum RequestStatus {
  Completed = 'completed',
}

export enum Status {
  Verified = 'verified',
  Unverified = 'unverified',
  Pending = 'pending',
  Incomplete = 'incomplete',
}

export enum ApproveDeclineStatus {
  Approved = 'approved',
  Declined = 'declined',
  Pending = 'pending',
  Idle = 'idle',
}

export enum AcceptDeclineStatus {
  Accepted = 'accepted',
  Declined = 'declined',
  Pending = 'pending',
  Deactivated = 'deactivated',
}

export enum AppointmentStatus {
  Completed = 'completed',
  Accepted = 'accepted',
  Declined = 'declined',
  Pending = 'pending',
}

export enum Role {
  Admin = 'admin',
  SuperAdmin = 'superadmin',
  Doctor = 'doctor',
  Patient = 'patient',
}

export enum CalendarType {
  Week = 'week',
  Month = 'month',
}

export enum ToastStatus {
  Success = 'Success',
  Error = 'Error',
  Info = 'Info',
}

export enum SidebarType {
  Settings = 'settings',
  PatientRecord = 'patientRecord',
}

export enum MaritalStatus {
  Single = 'single',
  Married = 'married',
  Divorced = 'divorced',
  Widowed = 'widowed',
}

export enum Denomination {
  Christian = 'christian',
  Muslim = 'muslim',
  Traditional = 'traditional',
  Other = 'other',
}

export enum BloodGroup {
  APositive = 'A+',
  ANegative = 'A-',
  BPositive = 'B+',
  BNegative = 'B-',
  ABPositive = 'AB+',
  ABNegative = 'AB-',
  OPositive = 'O+',
  ONegative = '0-',
}

export enum OrderDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export enum DurationType {
  Days = 'days',
  Weeks = 'weeks',
  Months = 'months',
}
