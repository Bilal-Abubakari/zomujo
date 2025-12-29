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
  communicationSkill: ICommunicationSkill;
  expertise: IExpertise;
  doctorId: string;
  recordId: string;
}

export interface IReviewDoctor {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

export interface IReview {
  id: string;
  status: string;
  rating: number;
  doctorId: IReviewDoctor;
  recordId: string;
  comment: string;
  communicationSkill: ICommunicationSkill;
  expertise: IExpertise;
}