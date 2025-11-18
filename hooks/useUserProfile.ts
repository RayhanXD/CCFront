import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import apiService, { UserProfile } from '@/lib/api';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }
      
      const userProfile = await apiService.getUserProfile(user.email);
      setProfile(userProfile);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const updatedProfile = await apiService.updateUserProfile({
        ...profile!,
        ...updates
      });
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
    updateProfile
  };
}
