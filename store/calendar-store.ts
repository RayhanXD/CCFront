import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent } from '@/types/calendar';
import { apiService } from '@/lib/api';
import { useEffect } from 'react';

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  selectedDate: Date | null;
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
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      isLoading: false,
      error: null,
      selectedDate: new Date(),
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      fetchEvents: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.getCalendarEvents(filters);
          
          // Remove duplicate events before storing them
          const uniqueEvents = removeDuplicateEvents(response.events);
          
          set({ events: uniqueEvents, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch calendar events:", error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch calendar events", 
            isLoading: false 
          });
        }
      },
      
      fetchTodayEvents: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.getTodayEvents();
          
          // Remove duplicate events before storing them
          const uniqueEvents = removeDuplicateEvents(response.events);
          
          set({ events: uniqueEvents, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch today's events:", error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch today's events", 
            isLoading: false 
          });
        }
      },
      
      addEvent: async (event) => {
        set({ isLoading: true, error: null });
        try {
          const newEvent = await apiService.addCalendarEvent(event);
          set((state) => ({ 
            events: [...state.events, newEvent],
            isLoading: false
          }));
        } catch (error) {
          console.error("Failed to add event:", error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to add event", 
            isLoading: false 
          });
        }
      },
      
      updateEvent: async (id, updatedEvent) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await apiService.updateCalendarEvent(id, updatedEvent);
          set((state) => ({
            events: state.events.map(event => 
              event.id === id ? updated : event
            ),
            isLoading: false
          }));
        } catch (error) {
          console.error(`Failed to update event with ID ${id}:`, error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to update event", 
            isLoading: false 
          });
        }
      },
      
      deleteEvent: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await apiService.deleteCalendarEvent(id);
          set((state) => ({
            events: state.events.filter(event => event.id !== id),
            isLoading: false
          }));
        } catch (error) {
          console.error(`Failed to delete event with ID ${id}:`, error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to delete event", 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        events: state.events,
      }),
      // Don't persist the selectedDate as a serialized date
      // Instead, we'll handle it in the component
    }
  )
);

// Hook to initialize calendar data
// Helper function to remove duplicate events
const removeDuplicateEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  const uniqueEvents: CalendarEvent[] = [];
  const eventKeys = new Set<string>();
  
  events.forEach(event => {
    // Create a unique key for each event based on title, time, and location
    const eventKey = `${event.title}-${event.time}-${event.location}`;
    
    // Only add the event if we haven't seen this key before
    if (!eventKeys.has(eventKey)) {
      eventKeys.add(eventKey);
      uniqueEvents.push(event);
    }
  });
  
  return uniqueEvents;
};

export const useInitializeCalendar = () => {
  const fetchEvents = useCalendarStore((state) => state.fetchEvents);
  
  useEffect(() => {
    // Get the first and last day of the current month for filtering
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Format dates as YYYY-MM-DD
    const start_date = firstDay.toISOString().split('T')[0];
    const end_date = lastDay.toISOString().split('T')[0];
    
    // Fetch events for the current month
    fetchEvents({ start_date, end_date });
  }, [fetchEvents]);
};
