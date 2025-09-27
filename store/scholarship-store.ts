import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scholarships } from '@/mocks/scholarships';
import { Scholarship } from '@/types/scholarship';
import { apiService, ScholarshipData, ScholarshipRecommendation } from '@/lib/api';

interface ScholarshipState {
  scholarships: Scholarship[];
  selectedFilter: 'all' | 'merit' | 'need' | 'research' | 'international';
  personalizedRecommendations: ScholarshipRecommendation[];
  isLoadingRecommendations: boolean;
  recommendationsError: string | null;
  setSelectedFilter: (filter: 'all' | 'merit' | 'need' | 'research' | 'international') => void;
  filteredScholarships: Scholarship[];
  getPersonalizedRecommendations: (userEmail: string, scholarshipsData: ScholarshipData[]) => Promise<void>;
  clearRecommendations: () => void;
  clearError: () => void;
}

export const useScholarshipStore = create<ScholarshipState>()(
  persist(
    (set, get) => ({
      scholarships: scholarships,
      selectedFilter: 'all',
      personalizedRecommendations: [],
      isLoadingRecommendations: false,
      recommendationsError: null,
      setSelectedFilter: (filter) => set({ selectedFilter: filter }),
      get filteredScholarships() {
        const filter = get().selectedFilter;
        const scholarships = get().scholarships;
        
        if (filter === 'all') {
          return scholarships;
        }
        
        return scholarships.filter(scholarship => scholarship.type === filter);
      },
      getPersonalizedRecommendations: async (userEmail: string, scholarshipsData: ScholarshipData[]) => {
        set({ isLoadingRecommendations: true, recommendationsError: null });
        try {
          const response = await apiService.getScholarshipRecommendations(userEmail, scholarshipsData);
          set({ 
            personalizedRecommendations: response.recommendations, 
            isLoadingRecommendations: false 
          });
        } catch (error) {
          set({ 
            recommendationsError: error instanceof Error ? error.message : 'Failed to get recommendations',
            isLoadingRecommendations: false 
          });
        }
      },
      clearRecommendations: () => set({ 
        personalizedRecommendations: [], 
        recommendationsError: null 
      }),
      clearError: () => set({ recommendationsError: null }),
    }),
    {
      name: 'scholarship-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ selectedFilter: state.selectedFilter }),
    }
  )
);