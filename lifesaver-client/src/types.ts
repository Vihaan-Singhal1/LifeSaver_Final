export type Urgency = 'low' | 'medium' | 'high' | 'critical';

export type Status = 'new' | 'ack' | 'enroute' | 'resolved';

export interface Answers {
  breathing: boolean;
  bleeding: boolean;
  trapped: boolean;
  water: boolean;
  fire: boolean;
  vulnerable: boolean;
  alone: boolean;
}

export interface Report {
  id: string;
  createdAt: string;
  updatedAt: string;
  lat: number;
  lng: number;
  geohash: string;
  categories: string[];
  answers: Answers;
  text: string | null;
  photoUrl: string | null;
  contact: string | null;
  score: number;
  urgency: Urgency;
  status: Status;
  assignedTo: string | null;
  duplicateOf: string | null;
}
