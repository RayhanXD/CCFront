import { create } from 'zustand';
import { Scholarship } from '@/types/scholarship';
import api from '@/lib/api';
import { getAuth } from 'firebase/auth';

type FilterType = string; // Dynamic filter type based on API response

// Categories are now used directly from the API response

interface ScholarshipState {
  scholarships: Scholarship[];
  selectedFilter: FilterType;
  availableCategories: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
  setSelectedFilter: (filter: FilterType) => void;
  getFilteredScholarships: () => Scholarship[];
  getAvailableFilters: () => { id: string; label: string }[];
  fetchScholarships: () => Promise<void>;
  refreshScholarships: () => Promise<void>;
  clearError: () => void;
}

export const useScholarshipStore = create<ScholarshipState>((set, get) => ({
  scholarships: [],
  selectedFilter: 'all',
  availableCategories: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,

  setSelectedFilter: (filter: FilterType) => {
    console.log('📚 Setting filter to:', filter);
    set({ selectedFilter: filter });
  },

  getFilteredScholarships: () => {
    const { scholarships, selectedFilter } = get();
    console.log('📚 getFilteredScholarships called:', {
      totalScholarships: scholarships?.length || 0,
      selectedFilter,
      scholarshipsArray: Array.isArray(scholarships)
    });
    
    if (!scholarships || !Array.isArray(scholarships)) {
      console.log('📚 No scholarships or not an array');
      return [];
    }
    
    if (selectedFilter === 'all') {
      console.log('📚 Returning all scholarships:', scholarships.length);
      return scholarships;
    }
    
    const filtered = scholarships.filter((scholarship) => {
      // Handle case where scholarship might be undefined or null
      if (!scholarship || typeof scholarship !== 'object') return false;
      const matches = scholarship.category === selectedFilter;
      if (!matches) {
        console.log('📚 Scholarship category mismatch:', {
          scholarshipCategory: scholarship.category,
          selectedFilter: selectedFilter,
          scholarshipName: scholarship.name
        });
      }
      return matches;
    });
    
    console.log('📚 Filtered scholarships for', selectedFilter, ':', filtered.length);
    console.log('📚 Available categories in data:', [...new Set(scholarships.map(s => s.category))]);
    return filtered;
  },

  getAvailableFilters: () => {
    const { availableCategories } = get();
    
    console.log('📚 getAvailableFilters called with availableCategories:', availableCategories);
    
    // Helper function to create shorter labels
    const createLabel = (category: string): string => {
      if (category === 'No Essay Scholarships') return 'No Essay';
      if (category === 'Top 25 for College Freshmen') return 'Freshmen';
      if (category === 'For all College Students') return 'All Students';
      if (category === 'Scholarships for Girls') return 'For Girls';
      if (category === 'High to Low Award') return 'High Awards';
      return category; // fallback to original name
    };

    const filters = [{ id: 'all', label: 'All' }];
    
    // Add dynamic categories from API
    availableCategories.forEach(category => {
      filters.push({
        id: category,
        label: createLabel(category)
      });
    });
    
    console.log('📚 Generated filters:', filters);
    return filters;
  },

  fetchScholarships: async () => {
    const { lastFetched, isRefreshing } = get();
    
    // Don't fetch if already loading or recently fetched (unless refreshing)
    if ((lastFetched && Date.now() - lastFetched < 5 * 60 * 1000) && !isRefreshing) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const auth = getAuth();
      const userEmail = auth.currentUser?.email || undefined;
      
      console.log('📚 Fetching scholarships for user:', userEmail);
      const response = await api.getScholarships(userEmail);
      console.log('📚 Raw scholarship response type:', typeof response);
      console.log('📚 Raw scholarship response:', JSON.stringify(response, null, 2));
      console.log('📚 Response structure analysis:', {
        isArray: Array.isArray(response),
        hasScholarships: response?.scholarships,
        scholarshipsIsArray: Array.isArray(response?.scholarships),
        isObject: typeof response === 'object' && response !== null,
        responseKeys: typeof response === 'object' ? Object.keys(response || {}) : 'not object'
      });
      
      // First, extract available categories from the response
      let extractedCategories: string[] = [];
      let scholarshipData: any[] = [];
      
      if (Array.isArray(response)) {
        console.log('📚 Detected direct array, extracting categories first');
        scholarshipData = response;
        console.log('📚 Sample items from direct array:', response.slice(0, 2));
        const categories = response.map(item => {
          console.log('📚 Item category field:', item.category, 'Full item keys:', Object.keys(item));
          return item.category;
        }).filter(Boolean);
        extractedCategories = [...new Set(categories)];
      } else if (response?.scholarships && Array.isArray(response.scholarships)) {
        if (response.scholarships.length > 0 && Array.isArray(response.scholarships[0])) {
          console.log('📚 Detected nested array structure, flattening and extracting categories');
          scholarshipData = response.scholarships.flat();
        } else {
          console.log('📚 Detected simple scholarships array, extracting categories');
          scholarshipData = response.scholarships;
        }
        console.log('📚 Sample items from scholarships array:', scholarshipData.slice(0, 2));
        const categories = scholarshipData.map(item => {
          console.log('📚 Scholarship item category field:', item.category, 'Full item keys:', Object.keys(item));
          return item.category;
        }).filter(Boolean);
        extractedCategories = [...new Set(categories)];
      } else if (typeof response === 'object' && response !== null) {
        // Check if response has a nested scholarships object
        if (response.scholarships && typeof response.scholarships === 'object') {
          console.log('📚 Detected nested category-based structure');
          const scholarshipsObj = response.scholarships;
          extractedCategories = Object.keys(scholarshipsObj).filter(key => Array.isArray(scholarshipsObj[key]));
          scholarshipData = [];
          Object.entries(scholarshipsObj).forEach(([categoryName, scholarshipArray]) => {
            if (Array.isArray(scholarshipArray)) {
              scholarshipArray.forEach((scholarship: any) => {
                scholarshipData.push({ ...scholarship, category: categoryName });
              });
            }
          });
        } else {
          // Direct category-based structure
          console.log('📚 Detected direct category-based structure');
          extractedCategories = Object.keys(response).filter(key => Array.isArray((response as any)[key]));
          scholarshipData = [];
          Object.entries(response).forEach(([categoryName, scholarshipArray]) => {
            if (Array.isArray(scholarshipArray)) {
              scholarshipArray.forEach((scholarship: any) => {
                scholarshipData.push({ ...scholarship, category: categoryName });
              });
            }
          });
        }
      } else {
        console.warn('Unexpected scholarship response format:', response);
        scholarshipData = [];
      }
      
      console.log('📚 Extracted categories from response:', extractedCategories);
      console.log('📚 Sample scholarship data:', scholarshipData[0]);
      
      // Store available categories immediately
      if (extractedCategories.length > 0) {
        set({ availableCategories: extractedCategories });
      }
      
      // Now transform the scholarship data
      let rawScholarships: { scholarship: any; category: string }[] = [];
      rawScholarships = scholarshipData.map(item => ({
        scholarship: item,
        category: item.category || 'General'
      }));
      
      console.log('📚 Raw scholarships array:', rawScholarships.length, 'items');
      
      // Transform each scholarship to match our Scholarship interface
      const scholarships: Scholarship[] = rawScholarships.map(({ scholarship: item, category }, index: number) => {
        try {
          return {
            id: item.id || item._id || `scholarship_${index}`,
            name: item['Scholarship Title'] || item['Scholarship Name'] || item.name || item.title || item.scholarship_name || 'Unknown Scholarship',
            provider: item.provider || item.organization || item.sponsor || 'Scholarship Provider',
            amount: typeof item['Amount'] === 'number' ? item['Amount'] : 
                   typeof item['Award Amount'] === 'string' ? parseFloat(item['Award Amount'].replace(/[^0-9.]/g, '')) || 0 :
                   typeof item.amount === 'number' ? item.amount : 
                   typeof item.award_amount === 'number' ? item.award_amount :
                   typeof item.value === 'number' ? item.value : 0,
            deadline: (() => {
              const deadlineValue = item['Scholarship Deadline'] || item['Application Deadline'] || item.deadline || item.due_date || item.application_deadline || new Date().toISOString();
              if (index < 3) { // Log first 3 scholarships for debugging
                console.log(`📚 Scholarship ${index} deadline:`, {
                  'Scholarship Deadline': item['Scholarship Deadline'],
                  'Application Deadline': item['Application Deadline'],
                  'deadline': item.deadline,
                  'due_date': item.due_date,
                  'final_value': deadlineValue,
                  'scholarship_name': item['Scholarship Title']
                });
              }
              return deadlineValue;
            })(),
            description: item['Description'] || item.description || item.details || item.summary || 'No description available',
            matchPercentage: typeof item.match_percentage === 'number' ? item.match_percentage :
                            typeof item.compatibility === 'number' ? item.compatibility :
                            typeof item.score === 'number' ? item.score : 
                            Math.floor(Math.random() * 30) + 70, // Random match percentage 70-100%
            category: category || item.category || 'General', // Use API category, fallback to item's category, then 'General'
            renewable: Boolean(item.renewable || item.is_renewable || item.multi_year),
            tags: Array.isArray(item.tags) ? item.tags :
                  Array.isArray(item.categories) ? item.categories :
                  typeof item.keywords === 'string' ? item.keywords.split(',').map((t: string) => t.trim()) :
                  item['Which Major'] || item['Major'] || item['Majors'] ? [item['Which Major'] || item['Major'] || item['Majors']] :
                  ['General']
          };
        } catch (error) {
          console.error('Error transforming scholarship item:', item, error);
          return {
            id: `error_${index}`,
            name: 'Error Loading Scholarship',
            provider: 'Unknown',
            amount: 0,
            deadline: new Date().toISOString(),
            description: 'Failed to load scholarship data',
            matchPercentage: 0,
            category: category || item?.category || 'General',
            renewable: false,
            tags: []
          };
        }
      });
      
      console.log('📚 Transformed scholarships:', scholarships.length, 'items');
      if (scholarships.length > 0) {
        console.log('📚 Sample transformed scholarship:', {
          id: scholarships[0].id,
          name: scholarships[0].name,
          amount: scholarships[0].amount,
          category: scholarships[0].category,
          provider: scholarships[0].provider
        });
        console.log('📚 All scholarship categories:', [...new Set(scholarships.map(s => s.category))]);
      
      // Extract unique categories from scholarships if not already set
      const { availableCategories } = get();
      if (availableCategories.length === 0 && scholarships.length > 0) {
        const extractedCategories = [...new Set(scholarships.map(s => s.category))];
        console.log('📚 Extracting categories from scholarships:', extractedCategories);
        set({ availableCategories: extractedCategories });
      }
    } else {
      console.log('📚 No scholarships after transformation');
    }
      
      set({ 
        scholarships,
        isLoading: false,
        isRefreshing: false,
        lastFetched: Date.now(),
        error: null
      });
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch scholarships',
        isLoading: false,
        isRefreshing: false
      });
    }
  },

  refreshScholarships: async () => {
    // Set refreshing state to true to force a refresh
    set({ isRefreshing: true, lastFetched: null });
    return get().fetchScholarships();
  },

  clearError: () => {
    set({ error: null });
  },
}));