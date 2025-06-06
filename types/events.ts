export interface TodayEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  startTime: string; // Formatted time string (e.g., "10:00 AM")
  endTime: string; // Formatted time string (e.g., "12:00 PM")
  location: string;
  imageUrl: string;
  relevanceScore: number; // 0-100
  organizer: string;
  tags: string[];
}