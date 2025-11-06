// DISABLED ZUSTAND STORE - Using simple mock to prevent infinite loops
import { Organization } from '@/types/campus';

type FilterType = 'all' | 'organization' | 'event' | 'tutoring';

interface CampusState {
  organizations: Organization[];
  selectedFilter: FilterType;
  isLoading: boolean;
  error: string | null;
  setSelectedFilter: (filter: FilterType) => void;
  getFilteredOrganizations: () => Organization[];
  fetchOrganizations: () => Promise<void>;
}

// Simple mock store to prevent infinite loops
const mockCampusState: CampusState = {
  organizations: [],
  selectedFilter: 'all',
  isLoading: false,
  error: null,
  
  setSelectedFilter: (filter: FilterType) => {
    console.log('Mock setSelectedFilter called with:', filter);
  },
  
  getFilteredOrganizations: () => {
    return [];
  },
  
  fetchOrganizations: async () => {
    console.log('Mock fetchOrganizations called');
  }
};

// Mock store and hooks
export const useCampusStore = () => mockCampusState;

// Mock selector hooks
export const useOrganizations = () => [];
export const useSelectedFilter = () => 'all' as FilterType;
export const useFilteredOrganizations = () => [];

// Disabled auto-initialization to prevent infinite update loops
// Each component will be responsible for fetching its own data when needed