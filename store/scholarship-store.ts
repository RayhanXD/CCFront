// DISABLED ZUSTAND STORE - Using simple mock to prevent infinite loops
import { Scholarship } from '@/types/scholarship';

type FilterType = 'all' | 'merit' | 'need' | 'research' | 'international';

interface ScholarshipState {
  scholarships: Scholarship[];
  selectedFilter: FilterType;
  isLoading: boolean;
  error: string | null;
  setSelectedFilter: (filter: FilterType) => void;
  getFilteredScholarships: () => Scholarship[];
  filteredScholarships: Scholarship[];
  fetchScholarships: () => Promise<void>;
}

// Mock scholarship store
const mockScholarshipState: ScholarshipState = {
  scholarships: [],
  selectedFilter: 'all',
  isLoading: false,
  error: null,
  filteredScholarships: [],
  
  setSelectedFilter: (filter: FilterType) => {
    console.log('Mock setSelectedFilter called with:', filter);
  },
  
  getFilteredScholarships: () => {
    return [];
  },
  
  fetchScholarships: async () => {
    console.log('Mock fetchScholarships called');
  }
};

// Mock store hook
export const useScholarshipStore = () => mockScholarshipState;