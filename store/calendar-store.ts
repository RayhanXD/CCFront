// DISABLED ZUSTAND STORE - Using simple mock to prevent infinite loops
import { CalendarEvent } from '@/types/calendar';

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  selectedDate: Date | null;
  isUsingFallbackData: boolean;
  retryCount: number;
  setSelectedDate: (date: Date) => void;
  fetchEvents: (filters?: {
    start_date?: string;
    end_date?: string;
    categories?: string[];
    location?: string;
  }) => Promise<void>;
  fetchTodayEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, "id">) => Promise<void>;
  updateEvent: (id: string, updatedEvent: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  retryFetch: () => Promise<void>;
}

// Mock calendar store
const mockCalendarState: CalendarState = {
  events: [],
  isLoading: false,
  error: null,
  selectedDate: new Date(),
  isUsingFallbackData: false,
  retryCount: 0,
  
  setSelectedDate: (date: Date) => {
    console.log('Mock setSelectedDate called with:', date);
  },
  
  fetchEvents: async (filters) => {
    console.log('Mock fetchEvents called with:', filters);
  },
  
  fetchTodayEvents: async () => {
    console.log('Mock fetchTodayEvents called');
  },
  
  addEvent: async (event) => {
    console.log('Mock addEvent called with:', event);
  },
  
  updateEvent: async (id, updatedEvent) => {
    console.log('Mock updateEvent called with:', id, updatedEvent);
  },
  
  deleteEvent: async (id) => {
    console.log('Mock deleteEvent called with:', id);
  },
  
  retryFetch: async () => {
    console.log('Mock retryFetch called');
  }
};

// Mock store hook
export const useCalendarStore = () => mockCalendarState;

// Mock initialization hook
export const useInitializeCalendar = () => {
  console.log('Mock useInitializeCalendar called');
};
