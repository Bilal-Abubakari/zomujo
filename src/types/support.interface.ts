export interface ISupport {
  description: string;
  name?: string;
  doctorId: string;
  patientId: string;
}

export interface IFeedback {
  type: string;
  comment: string;
}
