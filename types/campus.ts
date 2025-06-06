export interface Organization {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  matchPercentage: number;
  president: {
    name: string;
    role: string;
  };
  type: 'organization' | 'event' | 'tutoring';
}