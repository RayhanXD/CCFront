import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scholarships } from '@/mocks/scholarships';
import { Scholarship } from '@/types/scholarship';

type FilterType = 'all' | 'merit' | 'need' | 'research' | 'international';

interface ScholarshipState {
  scholarships: Scholarship[];
  selectedFilter: FilterType;
  setSelectedFilter: (filter: FilterType) => void;
  getFilteredScholarships: () => Scholarship[];
  filteredScholarships: Scholarship[];
}

export const useScholarshipStore = create<ScholarshipState>()(
  persist(
    (set, get) => ({
      scholarships: scholarships,
      selectedFilter: 'all',
      filteredScholarships: scholarships, // Initialize with all scholarships
      
      setSelectedFilter: (filter) => {
        set((state) => {
          // Update both selectedFilter and filteredScholarships
          const filtered = filter === 'all' 
            ? state.scholarships 
            : state.scholarships.filter(scholarship => scholarship.type === filter);
          
          return { 
            selectedFilter: filter,
            filteredScholarships: filtered 
          };
        });
      },
      
      getFilteredScholarships: () => {
        const { selectedFilter, scholarships } = get();
        
        if (selectedFilter === 'all') {
          return scholarships;
        }
        
        return scholarships.filter(scholarship => scholarship.type === selectedFilter);
      }
    }),
    {
      name: 'scholarship-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ selectedFilter: state.selectedFilter }),
    }
  )
);