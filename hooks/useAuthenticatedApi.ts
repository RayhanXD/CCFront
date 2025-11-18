import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/**
 * Hook that waits for authentication state to be determined before making API calls
 */
export function useAuthenticatedApi<T>(
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    if (authLoading) {
      // Still waiting for auth state
      return;
    }

    if (!isAuthenticated) {
      // User is not authenticated, don't make API calls
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      
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
 * Authenticated versions of the API hooks
 */
export function useAuthenticatedTodayEvents() {
  const { default: api } = require('@/lib/api');
  return useAuthenticatedApi(() => api.getTodayEvents());
}

export function useAuthenticatedOrganizations() {
  const { default: api } = require('@/lib/api');
  return useAuthenticatedApi(() => api.getOrganizations());
}

export function useAuthenticatedCalendarEvents(filters?: {
  start_date?: string;
  end_date?: string;
  categories?: string[];
  location?: string;
}) {
  const { default: api } = require('@/lib/api');
  return useAuthenticatedApi(
    () => api.getCalendarEvents(filters),
    [filters?.start_date, filters?.end_date, filters?.categories?.join(','), filters?.location]
  );
}
