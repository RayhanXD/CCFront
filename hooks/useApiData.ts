import { useState, useEffect } from "react";
import api from "@/lib/api"; // ✅ use default export (not { apiService })
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic hook to fetch data from the API without Zustand.
 * Now waits for auth state to be determined before making API calls.
 */
export function useApiData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
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
          // Clear user profile when logging out
          await AsyncStorage.removeItem('user_profile');
          console.log('🗑️ Cleared user profile cache');
        }
      } catch (error) {
        console.log('⚠️ Failed to cache auth state:', error);
      }
      
      setIsAuthenticated(isAuth);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    console.log('🔐 useApiData fetchData called:', { authLoading, isAuthenticated });
    
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
    
    console.log('✅ User authenticated, proceeding with API call');

    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      
      // Log more details in development
      if (__DEV__) {
        console.error("API fetch error:", {
          error: errorMessage,
          isAuthenticated,
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
 */
export function useTodayEvents() {
  return useApiData(() => api.getTodayEvents());
}

export function useCalendarEvents(filters?: {
  start_date?: string;
  end_date?: string;
  categories?: string[];
  location?: string;
}) {
  return useApiData(
    () => api.getCalendarEvents(filters),
    [filters?.start_date, filters?.end_date, filters?.categories?.join(','), filters?.location]
  );
}

/**
 * Fetch calendar events using the POST /calendar endpoint with 3-month pagination
 */
export function useCalendar(userEmail: string, currentDate?: Date) {
  console.log('🔄 useCalendar called with email:', userEmail);
  
  // Calculate 3-month date range (current month + 2 months ahead)
  const baseDate = currentDate || new Date();
  const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 3, 0);
  
  const dateRange = {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0]
  };
  
  console.log('📅 Calendar date range:', dateRange);
  
  return useApiData(
    () => {
      console.log('📡 Making API call to getCalendar with:', userEmail, dateRange);
      return api.getCalendar(userEmail, {
        ...dateRange,
        limit: 100 // Reasonable limit per 3-month chunk
      });
    },
    [userEmail, dateRange.start_date, dateRange.end_date]
  );
}

/**
 * Fetch calendar events for a specific date range (for navigation between months)
 */
export function useCalendarRange(userEmail: string, startDate: string, endDate: string) {
  console.log('🔄 useCalendarRange called:', { userEmail, startDate, endDate });
  
  return useApiData(
    () => {
      console.log('📡 Making API call to getCalendar with range:', { userEmail, startDate, endDate });
      return api.getCalendar(userEmail, {
        start_date: startDate,
        end_date: endDate,
        limit: 100
      });
    },
    [userEmail, startDate, endDate]
  );
}


/**
 * Fetch organization data from the API.
 */
export function useOrganizations() {
  return useApiData(() => api.getOrganizations());
}
