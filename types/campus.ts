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
  meetingTime: string;
  location: string;
  // Additional fields
  category?: string;
  memberCount?: number;
  meetingSchedule?: string;
  email?: string;
  website?: string;
  benefits?: string[];
  events?: OrganizationEvent[];
}

export interface OrganizationEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status?: string;
}