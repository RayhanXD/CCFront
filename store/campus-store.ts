import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { organizations } from '@/mocks/organizations';
import { Organization } from '@/types/campus';

interface CampusState {
  organizations: Organization[];
  selectedFilter: 'all' | 'organization' | 'event' | 'tutoring';
  setSelectedFilter: (filter: 'all' | 'organization' | 'event' | 'tutoring') => void;
  filteredOrganizations: Organization[];
}

export const useCampusStore = create<CampusState>()(
  persist(
    (set, get) => ({
      organizations: organizations,
      selectedFilter: 'all',
      setSelectedFilter: (filter) => set({ selectedFilter: filter }),
      get filteredOrganizations() {
        const filter = get().selectedFilter;
        const orgs = get().organizations;
        
        if (filter === 'all') {
          return orgs;
        }
        
        return orgs.filter(org => org.type === filter);
      }
    }),
    {
      name: 'campus-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ selectedFilter: state.selectedFilter }),
    }
  )
);