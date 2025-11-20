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
