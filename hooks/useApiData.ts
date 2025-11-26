import { useState, useEffect } from "react";
import api from "@/lib/api"; // ✅ use default export (not { apiService })
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache durations in milliseconds
const CACHE_DURATIONS = {
  userProfile: 24 * 60 * 60 * 1000,      // 24 hours
  calendarEvents: 60 * 60 * 1000,        // 1 hour
  todayEvents: 30 * 60 * 1000,           // 30 minutes
  savedEvents: 15 * 60 * 1000,           // 15 minutes
  userEvents: 15 * 60 * 1000,            // 15 minutes
  recommendations: 6 * 60 * 60 * 1000,   // 6 hours
  organizations: 6 * 60 * 60 * 1000,     // 6 hours
};

// Helper to get cached data
async function getCachedData<T>(key: string): Promise<{ data: T; timestamp: number } | null> {
  try {
    const cached = await AsyncStorage.getItem(`cache_${key}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.log('⚠️ Failed to read cache:', key, error);
  }
  return null;
}

// Helper to set cached data
async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    console.log('💾 Cached data:', key);
  } catch (error) {
    console.log('⚠️ Failed to cache data:', key, error);
  }
}

// Helper to check if cache is expired
function isCacheExpired(cachedItem: { timestamp: number }, duration: number): boolean {
  return Date.now() - cachedItem.timestamp > duration;
}

/**
 * Generic hook to fetch data from the API without Zustand.
 * Now waits for auth state to be determined before making API calls.
 * Includes caching to reduce API calls.
 */
export function useApiData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  cacheKey?: string,
  cacheDuration?: number
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Wait for auth state to be determined
  useEffect(() => {
    const auth = getAuth();
    
    // Load cached auth state immediately and check Firebase persistence
    const loadCachedAuthState = async () => {
      try {
        // First check if Firebase has a persisted user
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log('🔐 Firebase has persisted user:', currentUser.email);
          setIsAuthenticated(true);
          setAuthLoading(false);
          return;
        }
        
        // Fallback to our local cache
        const cachedAuthState = await AsyncStorage.getItem('auth_state');
        if (cachedAuthState) {
          const { isAuthenticated: cached, timestamp } = JSON.parse(cachedAuthState);
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
          
          if (!isExpired) {
            console.log('🔐 Loaded cached auth state:', cached);
            setIsAuthenticated(cached);
          } else {
            console.log('🔐 Cached auth state expired, clearing');
            await AsyncStorage.removeItem('auth_state');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.log('⚠️ Failed to load cached auth state:', error);
        setIsAuthenticated(false);
      }
    };
    
    loadCachedAuthState();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const isAuth = !!user;
      console.log('🔐 Firebase Auth State Changed:', {
        user: user ? {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        } : null,
        isAuthenticated: isAuth
      });
      
      // Cache the authentication state with user info
      try {
        const authData = {
          isAuthenticated: isAuth,
          timestamp: Date.now(),
          userEmail: user?.email || null,
          userId: user?.uid || null
        };
        
        await AsyncStorage.setItem('auth_state', JSON.stringify(authData));
        console.log('💾 Cached auth state:', { isAuth, email: user?.email });
        
        // Also cache user profile data if available
        if (user) {
          await AsyncStorage.setItem('user_profile', JSON.stringify({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            timestamp: Date.now()
          }));
          console.log('💾 Cached user profile:', user.email);
        } else {
          // User not authenticated - preserve cache
          console.log('🔐 User not authenticated - profile cache preserved');
        }
      } catch (error) {
        console.log('⚠️ Failed to cache auth state:', error);
      }
      
      setIsAuthenticated(isAuth);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchData = async (force = false) => {
    console.log('🔐 useApiData fetchData called:', { authLoading, isAuthenticated, cacheKey, force });
    
    if (authLoading) {
      // Still waiting for auth state
      console.log('⏳ Still waiting for auth state');
      return;
    }

    if (!isAuthenticated) {
      // User is not authenticated, don't make API calls
      console.log('❌ User not authenticated, skipping API call');
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }
    
    // Check cache first if cacheKey is provided and not forcing refresh
    if (cacheKey && cacheDuration && !force) {
      const cached = await getCachedData<T>(cacheKey);
      if (cached && !isCacheExpired(cached, cacheDuration)) {
        console.log('📦 Using cached data for:', cacheKey);
        setData(cached.data);
        setLoading(false);
        return;
      }
    }
    
    console.log('✅ User authenticated, fetching fresh data:', cacheKey || 'no-cache');

    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
      
      // Cache the result if cacheKey is provided
      if (cacheKey) {
        await setCachedData(cacheKey, result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      
      // Log more details in development
      if (__DEV__) {
        console.error("API fetch error:", {
          error: errorMessage,
          isAuthenticated,
          cacheKey,
          endpoint: fetchFunction.toString().substring(0, 50),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, ...dependencies]);

  return { 
    data, 
    loading: loading || authLoading, 
    error, 
    isAuthenticated, 
    refetch: fetchData 
  };
}

/**
 * Fetch today's events from the API.
 * Falls back to mock data if API unavailable.
 * Cached for 30 minutes.
 */
export function useTodayEvents() {
  return useApiData(
    () => api.getTodayEvents(),
    [],
    'todayEvents',
    CACHE_DURATIONS.todayEvents
  );
}

export function useCalendarEvents(filters?: {
  start_date?: string;
  end_date?: string;
  categories?: string[];
  location?: string;
}) {
  const cacheKey = `calendarEvents_${filters?.start_date || 'all'}_${filters?.end_date || 'all'}`;
  return useApiData(
    () => api.getCalendarEvents(filters),
    [filters?.start_date, filters?.end_date, filters?.categories?.join(','), filters?.location],
    cacheKey,
    CACHE_DURATIONS.calendarEvents
  );
}

/**
 * Fetch calendar events using the POST /calendar endpoint with 3-month pagination
 * Backend uses UID from JWT token, no need to pass userEmail
 */
export function useCalendar(currentDate?: Date) {
  // Calculate 3-month date range (current month + 2 months ahead)
  const baseDate = currentDate || new Date();
  const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 3, 0);
  
  const dateRange = {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0]
  };
  
  const cacheKey = `calendar_${dateRange.start_date}_${dateRange.end_date}`;
  return useApiData(
    () => {
      return api.getCalendar({
        ...dateRange,
        limit: 100 // Reasonable limit per 3-month chunk
      });
    },
    [dateRange.start_date, dateRange.end_date],
    cacheKey,
    CACHE_DURATIONS.calendarEvents
  );
}

/**
 * Fetch calendar events for a specific date range (for navigation between months)
 * Backend uses UID from JWT token, no need to pass userEmail
 */
export function useCalendarRange(startDate: string, endDate: string) {
  const cacheKey = `calendarRange_${startDate}_${endDate}`;
  return useApiData(
    () => {
      return api.getCalendar({
        start_date: startDate,
        end_date: endDate,
        limit: 100
      });
    },
    [startDate, endDate],
    cacheKey,
    CACHE_DURATIONS.calendarEvents
  );
}


/**
 * Fetch organization data from the API.
 * Cached for 6 hours.
 */
export function useOrganizations() {
  return useApiData(
    () => api.getOrganizations(),
    [],
    'organizations',
    CACHE_DURATIONS.organizations
  );
}

/**
 * Fetch saved events from the API.
 * Requires authentication.
 * Cached for 15 minutes.
 */
export function useSavedEvents() {
  return useApiData(
    () => api.getSavedEvents(),
    [],
    'savedEvents',
    CACHE_DURATIONS.savedEvents
  );
}

/**
 * Fetch user-created events from the API.
 * Requires authentication.
 * Cached for 15 minutes.
 */
export function useUserEvents() {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  
  const [data, setData] = useState<{ events: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cacheKey = `userEvents_${userId}`;
        const cached = await getCachedData<{ events: any[] }>(cacheKey);
        if (cached && !isCacheExpired(cached, CACHE_DURATIONS.userEvents)) {
          console.log('Using cached user events');
          setData(cached.data);
          setLoading(false);
          return;
        }
        
        // Fetch fresh data
        console.log('Fetching fresh user events');
        const result = await api.getUserEvents(userId);
        setData(result);
        setError(null);
        
        // Cache the result
        await setCachedData(cacheKey, result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user events');
        console.error('Error fetching user events:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);
  
  return { data, loading, error, refetch: () => {} };
}
