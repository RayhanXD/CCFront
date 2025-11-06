import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
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
  savedOrganizations?: string[];
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
  // Organization saving functionality
  saveOrganization?: (id: string) => void;
  unsaveOrganization?: (id: string) => void;
  isOrganizationSaved?: (id: string) => boolean;
}

// Helper function to create a selector for specific state slices
export const createSelector = <T,>(selector: (state: UserState) => T) => {
  return () => useUserStore(selector);
};

// Create selectors for commonly used state slices
export const useUserProfile = createSelector((state) => state.userProfile);
export const useUserLoading = createSelector((state) => state.isLoading);
export const useUserError = createSelector((state) => state.error);
export const useOnboardingStatus = createSelector((state) => state.isOnboardingComplete);
export const useSavedOrganizations = createSelector((state) => state.savedOrganizations);
// Removed useCalendarEvents and useUpcomingEvents selectors to prevent infinite update loops
// These should be accessed directly from userProfile instead

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userProfile: null,
      isOnboardingComplete: false,
      isLoading: false,
      error: null,
      savedOrganizations: [],
      
      // Optimized setters that only update specific state slices
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
          const signUpResponse = await apiService.signUp(userData);
          
          // Fetch user profile data
          const profileResponse = await apiService.getProfile(userData.email);
          
          // Fetch event recommendations
          const eventsResponse = await apiService.getEventRecommendations(userData.email);
          
          // Fetch calendar events
          const calendarResponse = await apiService.getCalendarEvents();
          
          // Fetch today's events
          const todayEventsResponse = await apiService.getTodayEvents();
          
          // Convert API user profile to local user profile with real data
          const localProfile: UserProfile = {
            name: profileResponse.user.name,
            email: profileResponse.user.email,
            major: profileResponse.user.major,
            year: profileResponse.user.year,
            interests: profileResponse.user.interests,
            onboardingComplete: true,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileResponse.user.name)}&background=7B5CFF&color=fff&size=200`,
            // Map event recommendations to event history
            eventHistory: eventsResponse.recommendations.map((event, index) => ({
              id: event.id || `e${index}`,
              name: event.name || event.title || `Event ${index + 1}`,
              date: event.date || new Date().toISOString().split('T')[0],
              attended: Math.random() > 0.5 // Random attendance for new users
            })),
            // Create scholarships based on user's major
            scholarships: [
              { 
                id: 's1', 
                name: `${profileResponse.user.major} Merit Scholarship`, 
                amount: Math.floor(Math.random() * 5000) + 1000, 
                status: 'pending' 
              },
            ],
            // Add calendar events
            calendarEvents: calendarResponse.events,
            // Add upcoming events (today's events)
            upcomingEvents: todayEventsResponse.events,
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
          // Sign in to get user data
          const response = await apiService.signIn({ email });
          
          // Fetch event recommendations
          const eventsResponse = await apiService.getEventRecommendations(email);
          
          // Fetch organization recommendations for scholarship generation
          const orgsResponse = await apiService.getOrganizationRecommendations(email);
          
          // Fetch calendar events
          const calendarResponse = await apiService.getCalendarEvents();
          
          // Fetch today's events
          const todayEventsResponse = await apiService.getTodayEvents();
          
          // Convert API user profile to local user profile with real data
          const localProfile: UserProfile = {
            name: response.user.name,
            email: response.user.email,
            major: response.user.major,
            year: response.user.year,
            interests: response.user.interests,
            onboardingComplete: true,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.name)}&background=7B5CFF&color=fff&size=200`,
            // Map event recommendations to event history
            eventHistory: eventsResponse.recommendations.map((event, index) => ({
              id: event.id || `e${index}`,
              name: event.name || event.title || `Event ${index + 1}`,
              date: event.date || new Date().toISOString().split('T')[0],
              attended: Math.random() > 0.5 // Random attendance status
            })),
            // Generate scholarships based on organizations
            scholarships: orgsResponse.recommendations.slice(0, 3).map((org, index) => ({
              id: `s${index + 1}`,
              name: `${org.name || org.title || response.user.major} Scholarship`,
              amount: Math.floor(Math.random() * 5000) + 1000,
              status: ['pending', 'awarded', 'applied'][Math.floor(Math.random() * 3)] as any
            })),
            // Add calendar events
            calendarEvents: calendarResponse.events,
            // Add upcoming events (today's events)
            upcomingEvents: todayEventsResponse.events,
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
          // Firebase authentication
          await signInWithEmailAndPassword(auth, email, password);
          
          // Fetch user profile data
          const response = await apiService.getProfile(email);
          
          // Fetch event recommendations
          const eventsResponse = await apiService.getEventRecommendations(email);
          
          // Fetch organization recommendations for scholarship generation
          const orgsResponse = await apiService.getOrganizationRecommendations(email);
          
          // Fetch calendar events
          const calendarResponse = await apiService.getCalendarEvents();
          
          // Fetch today's events
          const todayEventsResponse = await apiService.getTodayEvents();
          
          // Convert API user profile to local user profile with real data
          const localProfile: UserProfile = {
            name: response.user.name,
            email: response.user.email,
            major: response.user.major,
            year: response.user.year,
            interests: response.user.interests,
            onboardingComplete: true,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.name)}&background=7B5CFF&color=fff&size=200`,
            // Map event recommendations to event history
            eventHistory: eventsResponse.recommendations.map((event, index) => ({
              id: event.id || `e${index}`,
              name: event.name || event.title || `Event ${index + 1}`,
              date: event.date || new Date().toISOString().split('T')[0],
              attended: Math.random() > 0.5 // Random attendance status
            })),
            // Generate scholarships based on organizations
            scholarships: orgsResponse.recommendations.slice(0, 3).map((org, index) => ({
              id: `s${index + 1}`,
              name: `${org.name || org.title || response.user.major} Scholarship`,
              amount: Math.floor(Math.random() * 5000) + 1000,
              status: ['pending', 'awarded', 'applied'][Math.floor(Math.random() * 3)] as any
            })),
            // Add calendar events
            calendarEvents: calendarResponse.events,
            // Add upcoming events (today's events)
            upcomingEvents: todayEventsResponse.events,
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
          // Fetch user profile data
          const response = await apiService.getProfile(email);
          
          // Fetch event recommendations
          const eventsResponse = await apiService.getEventRecommendations(email);
          
          // Fetch organization recommendations for scholarship generation
          const orgsResponse = await apiService.getOrganizationRecommendations(email);
          
          // Fetch calendar events
          const calendarResponse = await apiService.getCalendarEvents();
          
          // Fetch today's events
          const todayEventsResponse = await apiService.getTodayEvents();
          
          // Convert API user profile to local user profile with real data
          const localProfile: UserProfile = {
            name: response.user.name,
            email: response.user.email,
            major: response.user.major,
            year: response.user.year,
            interests: response.user.interests,
            onboardingComplete: true,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.name)}&background=7B5CFF&color=fff&size=200`,
            // Map event recommendations to event history
            eventHistory: eventsResponse.recommendations.map((event, index) => ({
              id: event.id || `e${index}`,
              name: event.name || event.title || `Event ${index + 1}`,
              date: event.date || new Date().toISOString().split('T')[0],
              attended: Math.random() > 0.5 // Random attendance status
            })),
            // Generate scholarships based on organizations
            scholarships: orgsResponse.recommendations.slice(0, 3).map((org, index) => ({
              id: `s${index + 1}`,
              name: `${org.name || org.title || response.user.major} Scholarship`,
              amount: Math.floor(Math.random() * 5000) + 1000,
              status: ['pending', 'awarded', 'applied'][Math.floor(Math.random() * 3)] as any
            })),
            // Add calendar events
            calendarEvents: calendarResponse.events,
            // Add upcoming events (today's events)
            upcomingEvents: todayEventsResponse.events,
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
      
      // Organization saving functionality
      // Optimized organization saving
      saveOrganization: (id: string) => set((state) => ({
        savedOrganizations: [
          ...(state.savedOrganizations || []),
          ...(state.savedOrganizations?.includes(id) ? [] : [id])
        ]
      })),
      
      unsaveOrganization: (id: string) => set((state) => ({
        savedOrganizations: (state.savedOrganizations || []).filter(orgId => orgId !== id)
      })),
      
      isOrganizationSaved: (id: string) => {
        const state = get();
        return Boolean(state.savedOrganizations?.includes(id));
      },
    }), {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
)
);
