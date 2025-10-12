import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayEvents as mockTodayEvents } from '@/mocks/today-events';
import { TodayEvent } from '@/types/events';
import { apiService } from '@/lib/api';
import { CalendarEvent } from '@/types/calendar';

interface EventsState {
  todayEvents: TodayEvent[];
  savedEvents: string[]; // Array of event IDs
  lastFetchDate: string | null; // Date when events were last fetched (YYYY-MM-DD format)
  isLoading: boolean;
  error: string | null;
  saveEvent: (id: string) => void;
  unsaveEvent: (id: string) => void;
  isEventSaved: (id: string) => boolean;
  fetchTodayEvents: () => Promise<void>;
  checkAndUpdateEvents: () => Promise<void>;
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
      savedEvents: [],
      lastFetchDate: null,
      isLoading: false,
      error: null,
      
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
          const todayEvents = response.events.map(get().convertCalendarToTodayEvent);
          
          set({ 
            todayEvents,
            lastFetchDate: getTodayDateString(),
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to fetch today\'s events:', error);
          set({ 
            error: 'Failed to load today\'s events. Please try again later.',
            isLoading: false
          });
        }
      },
      
      // Check if events need to be updated and fetch if necessary
      checkAndUpdateEvents: async () => {
        const { lastFetchDate } = get();
        const todayString = getTodayDateString();
        
        // If we haven't fetched today's events yet, fetch them
        if (!lastFetchDate || lastFetchDate !== todayString) {
          await get().fetchTodayEvents();
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
      }),
    }
  )
);