import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedItem {
  id: string;
  type: 'scholarship' | 'event' | 'organization';
  savedAt: number;
}

interface SavedItemsState {
  savedItems: SavedItem[];
  addSavedItem: (id: string, type: 'scholarship' | 'event' | 'organization') => void;
  removeSavedItem: (id: string) => void;
  isSaved: (id: string) => boolean;
  getSavedItemsByType: (type: 'scholarship' | 'event' | 'organization') => SavedItem[];
}

export const useSavedItemsStore = create<SavedItemsState>()(
  persist(
    (set, get) => ({
      savedItems: [],
      
      addSavedItem: (id, type) => {
        set((state) => {
          // Check if item is already saved
          if (state.savedItems.some(item => item.id === id)) {
            return state;
          }
          
          // Add new saved item
          return {
            savedItems: [
              ...state.savedItems,
              {
                id,
                type,
                savedAt: Date.now()
              }
            ]
          };
        });
      },
      
      removeSavedItem: (id) => {
        set((state) => ({
          savedItems: state.savedItems.filter(item => item.id !== id)
        }));
      },
      
      isSaved: (id) => {
        return get().savedItems.some(item => item.id === id);
      },
      
      getSavedItemsByType: (type) => {
        return get().savedItems.filter(item => item.type === type);
      }
    }),
    {
      name: 'saved-items-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
