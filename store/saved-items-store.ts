// DISABLED ZUSTAND STORE - Using simple mock to prevent infinite loops

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

// Mock saved items store
const mockSavedItemsState: SavedItemsState = {
  savedItems: [],
  
  addSavedItem: (id: string, type: 'scholarship' | 'event' | 'organization') => {
    console.log('Mock addSavedItem called with:', id, type);
  },
  
  removeSavedItem: (id: string) => {
    console.log('Mock removeSavedItem called with:', id);
  },
  
  isSaved: (id: string) => {
    return false;
  },
  
  getSavedItemsByType: (type: 'scholarship' | 'event' | 'organization') => {
    return [];
  }
};

// Mock store hook
export const useSavedItemsStore = () => mockSavedItemsState;
