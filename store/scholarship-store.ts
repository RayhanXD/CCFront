import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scholarships } from '@/mocks/scholarships';
import { Scholarship } from '@/types/scholarship';

interface ScholarshipState {
  scholarships: Scholarship[];
  selectedFilter: 'all' | 'merit' | 'need' | 'research' | 'international';
  setSelectedFilter: (filter: 'all' | 'merit' | 'need' | 'research' | 'international') => void;
  filteredScholarships: Scholarship[];
}

export const useScholarshipStore = create<ScholarshipState>()(
  persist(
    (set, get) => ({
      scholarships: scholarships,
      selectedFilter: 'all',
      setSelectedFilter: (filter) => set({ selectedFilter: filter }),
      get filteredScholarships() {
        const filter = get().selectedFilter;
        const scholarships = get().scholarships;
        
        if (filter === 'all') {
          return scholarships;
        }
        
        return scholarships.filter(scholarship => scholarship.type === filter);
      }
    }),
    {
      name: 'scholarship-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ selectedFilter: state.selectedFilter }),
    }
  )
);