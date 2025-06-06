import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayEvents } from '@/mocks/today-events';
import { TodayEvent } from '@/types/events';

interface EventsState {
  todayEvents: TodayEvent[];
  savedEvents: string[]; // Array of event IDs
  saveEvent: (id: string) => void;
  unsaveEvent: (id: string) => void;
  isEventSaved: (id: string) => boolean;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      todayEvents: todayEvents,
      savedEvents: [],
      saveEvent: (id) => set((state) => ({ 
        savedEvents: [...state.savedEvents, id] 
      })),
      unsaveEvent: (id) => set((state) => ({
        savedEvents: state.savedEvents.filter(eventId => eventId !== id)
      })),
      isEventSaved: (id) => get().savedEvents.includes(id),
    }),
    {
      name: 'events-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        savedEvents: state.savedEvents,
      }),
    }
  )
);