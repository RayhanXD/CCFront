import { useApiData } from './useApiData';
import api from '@/lib/api';
import { Scholarship } from '@/types/scholarship';

interface ScholarshipsResponse {
  scholarships: Scholarship[];
}

/**
 * Hook to fetch scholarships from the API
 * @param userEmail - User email for personalized scholarships
 * @returns Scholarships data, loading state, error, and refetch function
 */
export function useScholarships(userEmail?: string) {
  return useApiData<ScholarshipsResponse>(
    () => api.getScholarships(userEmail),
    [userEmail]
  );
}
