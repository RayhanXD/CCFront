import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayEvents as mockTodayEvents } from '@/mocks/today-events';
import { futureEvents as mockFutureEvents } from '@/mocks/future-events';
import { TodayEvent } from '@/types/events';
import { apiService } from '@/lib/api';
import { CalendarEvent } from '@/types/calendar';

interface EventsState {
  todayEvents: TodayEvent[];
  futureEvents: TodayEvent[];
  savedEvents: string[]; // Array of event IDs
  lastFetchDate: string | null; // Date when events were last fetched (YYYY-MM-DD format)
  isLoading: boolean;
  error: string | null;
  isUsingFallbackData: boolean; // Flag to indicate if using fallback data
  retryCount: number; // Number of retry attempts
  saveEvent: (id: string) => void;
  unsaveEvent: (id: string) => void;
  isEventSaved: (id: string) => boolean;
  fetchTodayEvents: () => Promise<void>;
  fetchFutureEvents: () => Promise<void>;
  checkAndUpdateEvents: () => Promise<void>;
  retryFetch: () => Promise<void>; // Retry fetching events
  convertCalendarToTodayEvent: (event: CalendarEvent) => TodayEvent;
}

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      todayEvents: mockTodayEvents,
      futureEvents: mockFutureEvents,
      savedEvents: [],
      lastFetchDate: null,
      isLoading: false,
      error: null,
      isUsingFallbackData: false,
      retryCount: 0,
      
      saveEvent: (id) => set((state) => ({ 
        savedEvents: [...state.savedEvents, id] 
      })),
      
      unsaveEvent: (id) => set((state) => ({
        savedEvents: state.savedEvents.filter(eventId => eventId !== id)
      })),
      
      isEventSaved: (id) => get().savedEvents.includes(id),
      
      // Convert a CalendarEvent to TodayEvent format
      convertCalendarToTodayEvent: (event: CalendarEvent): TodayEvent => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: event.date,
        startTime: event.time || '12:00 PM',
        endTime: event.duration ? 
          (() => {
            // Calculate end time based on duration
            const [hours, minutes, period] = (event.time || '12:00 PM')
              .match(/([0-9]+):([0-9]+)\s*(AM|PM)/i)
              ?.slice(1) || ['12', '00', 'PM'];
            
            let startHour = parseInt(hours);
            const startMinute = parseInt(minutes);
            const isPM = period.toUpperCase() === 'PM';
            
            // Convert to 24-hour format for calculation
            if (isPM && startHour < 12) startHour += 12;
            if (!isPM && startHour === 12) startHour = 0;
            
            // Calculate end time
            let endMinutes = startMinute + (event.duration % 60);
            let endHour = startHour + Math.floor(event.duration / 60) + Math.floor(endMinutes / 60);
            endMinutes = endMinutes % 60;
            
            // Convert back to 12-hour format
            const endPeriod = endHour >= 12 ? 'PM' : 'AM';
            endHour = endHour % 12;
            if (endHour === 0) endHour = 12;
            
            return `${endHour}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
          })() : 
          '1:00 PM', // Default end time if duration not provided
        location: event.location,
        imageUrl: event.img || '', // Ensure imageUrl is always a string
        relevanceScore: 90, // Default relevance score
        organizer: 'University', // Default organizer
        tags: event.description ? 
          event.description
            .split(' ')
            .filter(word => word.length > 4)
            .slice(0, 3)
            .map(word => word.replace(/[^a-zA-Z]/g, '')) : 
          ['Event']
      }),
      
      // Fetch today's events from API
      fetchTodayEvents: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.getTodayEvents();
          
          // Filter events to only include today's events
          const todayString = getTodayDateString();
          const filteredEvents = response.events.filter(event => {
            const eventDate = new Date(event.date);
            const eventDateString = eventDate.toISOString().split('T')[0];
            return eventDateString === todayString;
          });
          
          const todayEvents = filteredEvents.map(get().convertCalendarToTodayEvent);
          
          set({ 
            todayEvents,
            lastFetchDate: todayString,
            isLoading: false,
            isUsingFallbackData: false,
            retryCount: 0, // Reset retry count on successful fetch
            error: null
          });
        } catch (error) {
          console.error('Failed to fetch today\'s events:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to load today\'s events';
          const isNetworkError = errorMessage.includes('Network error');
          
          set(state => ({ 
            error: `${errorMessage}. ${isNetworkError ? 'Using cached data.' : 'Please try again later.'}`,
            isLoading: false,
            isUsingFallbackData: true,
            retryCount: state.retryCount + 1
          }));
        }
      },
      
      // Fetch future events (events after today)
      fetchFutureEvents: async () => {
        console.log('Fetching future events');
        set(state => ({ ...state, isLoading: true, error: null }));
        try {
          // In a real app, you would fetch from API
          // For now, we'll use mock data
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('Future events loaded:', mockFutureEvents.length);
          
          set(state => ({
            ...state,
            futureEvents: mockFutureEvents,
            isLoading: false,
            isUsingFallbackData: false,
            retryCount: 0 // Reset retry count on successful fetch
          }));
        } catch (error) {
          console.error('Failed to fetch future events:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to load future events';
          const isNetworkError = errorMessage.includes('Network error');
          
          set(state => ({
            ...state,
            error: `${errorMessage}. ${isNetworkError ? 'Using cached data.' : 'Please try again later.'}`,
            isLoading: false,
            isUsingFallbackData: true,
            retryCount: state.retryCount + 1
          }));
        }
      },
      
      // Check if events need to be updated and fetch if necessary
      checkAndUpdateEvents: async () => {
        const { lastFetchDate, retryCount } = get();
        const todayString = getTodayDateString();
        
        // If we've already tried too many times, don't keep retrying
        // This prevents excessive API calls when the server is down
        if (retryCount > 5) {
          console.log('Too many retry attempts, using cached data');
          return;
        }
        
        // Always fetch future events
        await get().fetchFutureEvents();
        
        // If we haven't fetched today's events yet, fetch them
        if (!lastFetchDate || lastFetchDate !== todayString) {
          await get().fetchTodayEvents();
        }
      },
      
      // Retry fetching events
      retryFetch: async () => {
        // Reset retry count and try again
        set(state => ({ ...state, retryCount: 0, isLoading: true, error: null }));
        
        try {
          // Fetch both types of events
          await get().fetchFutureEvents();
          await get().fetchTodayEvents();
          
          // Update success state
          set({
            isUsingFallbackData: false,
            error: null,
            isLoading: false
          });
        } catch (error) {
          console.error('Retry fetch failed:', error);
          set(state => ({
            ...state,
            error: 'Retry failed. Please check your connection and try again.',
            isLoading: false,
            retryCount: state.retryCount + 1
          }));
        }
      },
    }),
    {
      name: 'events-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        savedEvents: state.savedEvents,
        lastFetchDate: state.lastFetchDate,
        todayEvents: state.todayEvents,
        futureEvents: state.futureEvents,
      }),
    }
  )
);