import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calendarEvents } from '@/mocks/calendar-events';
import { CalendarEvent } from '@/types/calendar';

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updatedEvent: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: calendarEvents,
      selectedDate: new Date(),
      setSelectedDate: (date) => set({ selectedDate: date }),
      addEvent: (event) => set((state) => ({ 
        events: [...state.events, event] 
      })),
      updateEvent: (id, updatedEvent) => set((state) => ({
        events: state.events.map(event => 
          event.id === id ? { ...event, ...updatedEvent } : event
        )
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(event => event.id !== id)
      })),
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