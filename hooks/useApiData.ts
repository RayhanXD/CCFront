import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

// Simple hook for fetching data without Zustand complications
export function useApiData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks for different data types
export function useTodayEvents() {
  // Fetch today's events from API (will fall back to mock data if API unavailable)
  return useApiData(() => apiService.getTodayEvents());
}

export function useCalendarEvents(filters?: {
  start_date?: string;
  end_date?: string;
  categories?: string[];
  location?: string;
}) {
  // Fetch calendar events from API (will fall back to mock data if API unavailable)
  return useApiData(
    () => apiService.getCalendarEvents(filters),
    [filters?.start_date, filters?.end_date, filters?.categories?.join(','), filters?.location]
  );
}

export function useOrganizations() {
  // Use the organizations endpoint
  return useApiData(() => apiService.getOrganizations());
}
