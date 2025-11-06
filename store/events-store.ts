// DISABLED ZUSTAND STORE - Using simple mock to prevent infinite loops
import { TodayEvent } from '@/types/events';
import { CalendarEvent } from '@/types/calendar';

interface EventsState {
  todayEvents: TodayEvent[];
  futureEvents: TodayEvent[];
  savedEvents: string[];
  lastFetchDate: string | null;
  isLoading: boolean;
  error: string | null;
  isUsingFallbackData: boolean;
  retryCount: number;
  checkAndUpdateEvents: () => Promise<void>;
  fetchTodayEvents: () => Promise<void>;
  fetchFutureEvents: () => Promise<void>;
  saveEvent: (id: string) => void;
  unsaveEvent: (id: string) => void;
  isEventSaved: (id: string) => boolean;
  retryFetch: () => Promise<void>;
  convertCalendarToTodayEvent: (event: CalendarEvent) => TodayEvent;
}

// Simple mock store to prevent infinite loops
const mockEventsState: EventsState = {
  todayEvents: [],
  futureEvents: [],
  savedEvents: [],
  lastFetchDate: null,
  isLoading: false,
  error: null,
  isUsingFallbackData: false,
  retryCount: 0,
  
  saveEvent: (id: string) => {
    console.log('Mock saveEvent called with:', id);
  },
  
  unsaveEvent: (id: string) => {
    console.log('Mock unsaveEvent called with:', id);
  },
  
  isEventSaved: (id: string) => {
    return false;
  },
  
  convertCalendarToTodayEvent: (event: CalendarEvent): TodayEvent => ({
    id: event.id,
    title: event.title,
    description: event.description || '',
    date: event.date,
    startTime: event.time || '12:00 PM',
    endTime: '1:00 PM',
    location: event.location,
    imageUrl: event.img || '',
    relevanceScore: 90,
    organizer: 'University',
    tags: ['Event']
  }),
  
  fetchTodayEvents: async () => {
    console.log('Mock fetchTodayEvents called');
  },
  
  fetchFutureEvents: async () => {
    console.log('Mock fetchFutureEvents called');
  },
  
  checkAndUpdateEvents: async () => {
    console.log('Mock checkAndUpdateEvents called');
  },
  
  retryFetch: async () => {
    console.log('Mock retryFetch called');
  }
};

// Mock hook that returns the static state
export const useEventsStore = () => mockEventsState;

// Mock selector hooks
export const useTodayEvents = () => [];
export const useFutureEvents = () => [];
export const useEventsLoading = () => false;
export const useEventsError = () => null;
export const useSavedEvents = () => [];