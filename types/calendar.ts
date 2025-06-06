export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  time: string; // Formatted time string (e.g., "1:00 PM")
  duration: number; // in minutes
  location: string;
  description?: string;
  color?: string;
}