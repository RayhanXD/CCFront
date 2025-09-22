import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types/user';
import { apiService, UserProfile as ApiUserProfile } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User
} from 'firebase/auth';

interface UserState {
  userProfile: UserProfile | null;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  error: string | null;
  setUserProfile: (profile: UserProfile) => void;
  setUserInterests: (interests: string[]) => void;
  setOnboardingComplete: (complete: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  signUp: (userData: ApiUserProfile) => Promise<boolean>;
  signIn: (email: string) => Promise<boolean>;
  signUpWithEmailPassword: (email: string, password: string, profile: ApiUserProfile) => Promise<boolean>;
  signInWithEmailPassword: (email: string, password: string) => Promise<boolean>;
  signOutFirebase: () => Promise<void>;
  loadUserProfile: (email: string) => Promise<boolean>;
  updateUserProfileOnServer: (email: string, updates: Partial<ApiUserProfile>) => Promise<boolean>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userProfile: null,
      isOnboardingComplete: false,
      isLoading: false,
      error: null,
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      setUserInterests: (interests) => set((state) => ({
        userProfile: state.userProfile ? {
          ...state.userProfile,
          interests
        } : null
      })),
      
      setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
      
      updateUserProfile: (updates) => set((state) => ({
        userProfile: state.userProfile ? {
          ...state.userProfile,
          ...updates
        } : null
      })),
      
      signUp: async (userData: ApiUserProfile) => {
        set({ isLoading: true, error: null });
        try {
          await apiService.signUp(userData);
          // Convert API user profile to local user profile
          const localProfile: UserProfile = {
            name: userData.name,
            email: userData.email,
            major: userData.major,
            year: userData.year,
            interests: userData.interests,
            onboardingComplete: true
          };
          set({ 
            userProfile: localProfile, 
            isOnboardingComplete: true,
            isLoading: false 
          });
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign up failed',
            isLoading: false 
          });
          return false;
        }
      },
      
      signIn: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.signIn({ email });
          // Convert API user profile to local user profile
          const localProfile: UserProfile = {
            name: response.user.name,
            email: response.user.email,
            major: response.user.major,
            year: response.user.year,
            interests: response.user.interests,
            onboardingComplete: true
          };
          set({ 
            userProfile: localProfile, 
            isOnboardingComplete: true,
            isLoading: false 
          });
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign in failed',
            isLoading: false 
          });
          return false;
        }
      },

      signUpWithEmailPassword: async (email: string, password: string, profile: ApiUserProfile) => {
        set({ isLoading: true, error: null });
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          // Sync profile to backend
          await apiService.signUp({ ...profile, email });
          const localProfile: UserProfile = {
            name: profile.name,
            email,
            major: profile.major,
            year: profile.year,
            interests: profile.interests,
            onboardingComplete: true,
          };
          set({ userProfile: localProfile, isOnboardingComplete: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Sign up failed', isLoading: false });
          return false;
        }
      },

      signInWithEmailPassword: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await signInWithEmailAndPassword(auth, email, password);
          const response = await apiService.getProfile(email);
          const localProfile: UserProfile = {
            name: response.user.name,
            email: response.user.email,
            major: response.user.major,
            year: response.user.year,
            interests: response.user.interests,
            onboardingComplete: true,
          };
          set({ userProfile: localProfile, isOnboardingComplete: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Sign in failed', isLoading: false });
          return false;
        }
      },

      signOutFirebase: async () => {
        await signOut(auth);
        set({ userProfile: null, isOnboardingComplete: false });
      },
      
      loadUserProfile: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.getProfile(email);
          // Convert API user profile to local user profile
          const localProfile: UserProfile = {
            name: response.user.name,
            email: response.user.email,
            major: response.user.major,
            year: response.user.year,
            interests: response.user.interests,
            onboardingComplete: true
          };
          set({ 
            userProfile: localProfile, 
            isOnboardingComplete: true,
            isLoading: false 
          });
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load profile',
            isLoading: false 
          });
          return false;
        }
      },
      
      updateUserProfileOnServer: async (email: string, updates: Partial<ApiUserProfile>) => {
        set({ isLoading: true, error: null });
        try {
          const currentProfile = get().userProfile;
          if (!currentProfile) {
            throw new Error('No user profile found');
          }
          
          // Convert local profile to API profile format
          const apiProfile: ApiUserProfile = {
            name: currentProfile.name,
            surname: currentProfile.name.split(' ')[1] || '',
            school_name: 'University of Texas at Dallas',
            year: currentProfile.year,
            ftcs_status: 'No',
            gpa_range: '3.0 - 3.5',
            educational_goals: 'Graduate with honors',
            age: '20',
            gender: 'Prefer not to say',
            race_ethnicity: 'Prefer not to say',
            working_hours: '0-10',
            stress_level: 'Moderate',
            self_efficacy: 'High',
            major: currentProfile.major,
            interests: currentProfile.interests,
            email: currentProfile.email || email,
            ...updates
          };
          
          await apiService.updateProfile(email, apiProfile);
          
          // Update local profile with changes
          const updatedLocalProfile: UserProfile = {
            ...currentProfile,
            name: apiProfile.name,
            major: apiProfile.major,
            year: apiProfile.year,
            interests: apiProfile.interests
          };
          
          set({ 
            userProfile: updatedLocalProfile,
            isLoading: false 
          });
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false 
          });
          return false;
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);