export interface ICommunicationSkill {
  isProfessional: number;
  isClear: number;
  isAttentive: number;
  isComfortable: number;
}

export interface IExpertise {
  knowledge: number;
  thorough: number;
  confidence: number;
  helpful: number;
}

export interface IReviewRequest {
  rating: number;
  comment: string;
  communicationSkill?: ICommunicationSkill;
  expertise?: IExpertise;
  doctorId: string;
  appointmentId?: string;
}

export interface IReviewUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

export interface IReview {
  id: string;
  status: string;
  rating: number;
  comment: string;
  communicationSkill: ICommunicationSkill;
  expertise: IExpertise;
  patientId: string | null;
  doctorId: string;
  appointmentId: string | null;
  doctor: IReviewUser;
  patient: IReviewUser | null;
}

export interface ILandingPageReview {
  rating: number;
  comment: string;
  doctor: Pick<IReviewUser, 'firstName' | 'lastName'> | null;
  patient: Pick<IReviewUser, 'firstName' | 'lastName'> | null;
}
