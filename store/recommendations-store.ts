import { create } from 'zustand';
import { apiService } from '@/lib/api';

interface RecommendationItem {
  id: string;
  name: string;
  description: string;
  score: number;
  recommendation_explanation: string;
  [key: string]: any; // For additional properties from different recommendation types
}

interface RecommendationsState {
  organizations: RecommendationItem[];
  events: RecommendationItem[];
  tutoring: RecommendationItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  fetchOrganizationRecommendations: (userEmail: string) => Promise<void>;
  fetchEventRecommendations: (userEmail: string) => Promise<void>;
  fetchTutoringRecommendations: (userEmail: string) => Promise<void>;
  fetchAllRecommendations: (userEmail: string) => Promise<void>;
  clearRecommendations: () => void;
  clearError: () => void;
}

export const useRecommendationsStore = create<RecommendationsState>((set, get) => ({
  organizations: [],
  events: [],
  tutoring: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchOrganizationRecommendations: async (userEmail: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getOrganizationRecommendations(userEmail);
      set({ 
        organizations: response.recommendations,
        isLoading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch organization recommendations',
        isLoading: false 
      });
    }
  },

  fetchEventRecommendations: async (userEmail: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getEventRecommendations(userEmail);
      set({ 
        events: response.recommendations,
        isLoading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch event recommendations',
        isLoading: false 
      });
    }
  },

  fetchTutoringRecommendations: async (userEmail: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getTutoringRecommendations(userEmail);
      set({ 
        tutoring: response.recommendations,
        isLoading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tutoring recommendations',
        isLoading: false 
      });
    }
  },

  fetchAllRecommendations: async (userEmail: string) => {
    set({ isLoading: true, error: null });
    try {
      const [orgResponse, eventResponse, tutoringResponse] = await Promise.all([
        apiService.getOrganizationRecommendations(userEmail),
        apiService.getEventRecommendations(userEmail),
        apiService.getTutoringRecommendations(userEmail)
      ]);

      set({ 
        organizations: orgResponse.recommendations,
        events: eventResponse.recommendations,
        tutoring: tutoringResponse.recommendations,
        isLoading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
        isLoading: false 
      });
    }
  },

  clearRecommendations: () => set({ 
    organizations: [], 
    events: [], 
    tutoring: [],
    lastUpdated: null 
  }),

  clearError: () => set({ error: null }),
}));
