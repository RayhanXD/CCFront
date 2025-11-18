import { create } from 'zustand';
import { CalendarEvent } from '@/types/calendar';
import apiService from '@/lib/api';
import { getAuth } from 'firebase/auth';

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

// Helper to get current user ID
const getCurrentUserId = (): string | null => {
  const auth = getAuth();
  return auth.currentUser?.uid || null;
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  selectedDate: new Date(),
  isUsingFallbackData: false,
  retryCount: 0,
  
  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
  },
  
  fetchEvents: async (filters) => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No user ID available for fetching events');
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getUserEvents(userId, {
        category: filters?.categories?.[0],
        start_date: filters?.start_date,
        end_date: filters?.end_date,
      });
      set({ 
        events: response.events as CalendarEvent[], 
        isLoading: false,
        isUsingFallbackData: false 
      });
    } catch (error) {
      console.error('Failed to fetch events:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch events',
        isLoading: false,
        isUsingFallbackData: true
      });
    }
  },
  
  fetchTodayEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getTodayEvents();
      set({ 
        events: response.events as CalendarEvent[], 
        isLoading: false,
        isUsingFallbackData: false 
      });
    } catch (error) {
      console.error('Failed to fetch today events:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch today events',
        isLoading: false,
        isUsingFallbackData: true
      });
    }
  },
  
  addEvent: async (event) => {
    const userId = getCurrentUserId();
    if (!userId) {
      const errorMsg = 'No user ID available for creating event. Please sign in.';
      console.error('❌ addEvent:', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('📝 addEvent: Creating event for user:', userId);
    console.log('📝 addEvent: Event data:', JSON.stringify(event, null, 2));
    
    set({ isLoading: true, error: null });
    try {
      const newEvent = await apiService.createUserEvent(userId, event as any);
      console.log('✅ addEvent: Event created successfully:', newEvent);
      set((state) => ({ 
        events: [...state.events, newEvent as CalendarEvent],
        isLoading: false 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ addEvent: Failed to add event');
      console.error('   Error type:', error?.constructor?.name);
      console.error('   Error message:', errorMessage);
      console.error('   Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(`Failed to add event: ${errorMessage}`);
    }
  },
  
  updateEvent: async (id, updatedEvent) => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('No user ID available for updating event');
    }

    set({ isLoading: true, error: null });
    try {
      const updated = await apiService.updateUserEvent(userId, id, updatedEvent as any);
      set((state) => ({ 
        events: state.events.map(e => e.id === id ? { ...e, ...updated } : e),
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to update event:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update event',
        isLoading: false 
      });
      throw error;
    }
  },
  
  deleteEvent: async (id) => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('No user ID available for deleting event');
    }

    set({ isLoading: true, error: null });
    try {
      await apiService.deleteUserEvent(userId, id);
      set((state) => ({ 
        events: state.events.filter(e => e.id !== id),
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to delete event:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete event',
        isLoading: false 
      });
      throw error;
    }
  },
  
  retryFetch: async () => {
    const { fetchEvents } = get();
    await fetchEvents();
  }
}));

// Initialization hook
export const useInitializeCalendar = () => {
  // Can be used for any initialization logic if needed
  console.log('Calendar store initialized');
};
