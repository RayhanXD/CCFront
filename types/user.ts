import { CalendarEvent } from './calendar';

export interface UserPreferences {
  notifications?: boolean;
  privacyMode?: boolean;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface EventHistoryItem {
  id: string;
  name: string;
  date: string;
  attended: boolean;
}

export interface ScholarshipItem {
  id: string;
  name: string;
  amount: number;
  status: 'applied' | 'awarded' | 'rejected' | 'pending';
}

export interface UserProfile {
  name: string;
  email?: string;
  major: string;
  year: string;
  interests: string[];
  onboardingComplete?: boolean;
  preferences?: UserPreferences;
  photoUrl?: string;
  eventHistory?: EventHistoryItem[];
  scholarships?: ScholarshipItem[];
  calendarEvents?: CalendarEvent[];
  upcomingEvents?: CalendarEvent[];
}