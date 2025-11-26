import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types/user';
import apiService, { UserProfile as ApiUserProfile } from '@/lib/api';
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
  isLoading: boolean;
  error: string | null;
  isOnboardingComplete: boolean;
  savedOrganizations: string[];
  loadingSteps: string[];
  currentLoadingStep: number;
  showLoadingScreen: boolean;
  setUserProfile: (profile: UserProfile | null) => void;
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
  clearUserData: () => void;
  setLoadingSteps: (steps: string[]) => void;
  setCurrentLoadingStep: (step: number) => void;
  setShowLoadingScreen: (show: boolean) => void;
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
      loadingSteps: [],
      currentLoadingStep: 0,
      showLoadingScreen: false,
      
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
          
          // Fetch user profile data (backend uses UID from JWT token)
          const profileResponse = await apiService.getProfile();
          
          // Fetch event recommendations (backend uses UID from JWT token)
          const eventsResponse = await apiService.getEventRecommendations();
          
          // Fetch calendar events
          const calendarResponse = await apiService.getCalendarEvents();
          
          // Fetch today's events
          const todayEventsResponse = await apiService.getTodayEvents();
          
          // Convert API user profile to local user profile with real data
          const localProfile: UserProfile = {
            name: profileResponse.user.name || 'Unknown User',
            email: profileResponse.user.email,
            major: profileResponse.user.major || 'Computer Science',
            year: profileResponse.user.year || 'Sophomore',
            interests: profileResponse.user.interests || [],
            onboardingComplete: true,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileResponse.user.name || 'User')}&background=7B5CFF&color=fff&size=200`,
            // Map event recommendations to event history
            eventHistory: (eventsResponse.recommendations || []).map((event: any, index: number) => ({
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
          const response = await apiService.signIn({ email }) as { user: any };
          
          // Fetch event recommendations (backend uses UID from JWT token)
          const eventsResponse = await apiService.getEventRecommendations();
          
          // Fetch organization recommendations for scholarship generation (backend uses UID from JWT token)
          const orgsResponse = await apiService.getOrganizationRecommendations();
          
          // Fetch calendar events
          const calendarResponse = await apiService.getCalendarEvents();
          
          // Fetch today's events
          const todayEventsResponse = await apiService.getTodayEvents();
          
          // Convert API user profile to local user profile with real data
          const localProfile: UserProfile = {
            name: response.user?.name || 'Student Name',
            email: response.user?.email || email,
            major: response.user?.major || 'Computer Science',
            year: response.user?.year || 'Sophomore',
            interests: response.user?.interests || [],
            onboardingComplete: true,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user?.name || 'Student')}&background=7B5CFF&color=fff&size=200`,
            // Map event recommendations to event history
            eventHistory: (eventsResponse.recommendations || []).map((event: any, index: number) => ({
              id: event.id || `e${index}`,
              name: event.name || event.title || `Event ${index + 1}`,
              date: event.date || new Date().toISOString().split('T')[0],
              attended: Math.random() > 0.5 // Random attendance status
            })),
            // Generate scholarships based on organizations
            scholarships: ((orgsResponse as any)?.recommendations || []).slice(0, 3).map((org: any, index: number) => ({
              id: `s${index + 1}`,
              name: `${org.name || org.title || response.user?.major || 'General'} Scholarship`,
              amount: Math.floor(Math.random() * 5000) + 1000,
              status: ['pending', 'awarded', 'applied'][Math.floor(Math.random() * 3)] as any
            })),
            // Add calendar events
            calendarEvents: (calendarResponse.events || []) as any,
            // Add upcoming events (today's events)
            upcomingEvents: (todayEventsResponse.events || []) as any,
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
        let firebaseUser: any = null;
        
        try {
          // Validate required fields before attempting signup
          if (!profile.name || !profile.major || !profile.year) {
            throw new Error('Missing required profile information: name, major, and year are required');
          }
          
          console.log('🔐 Step 1: Creating Firebase user...');
          // Step 1: Create Firebase user
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          firebaseUser = userCredential.user;
          console.log('✅ Firebase user created:', firebaseUser.uid);
          
          console.log('🔐 Step 2: Syncing profile to backend...');
          // Step 2: Sync profile to backend with UID
          // Filter out null values for optional fields
          const profileData = { ...profile, email, uid: firebaseUser.uid };
          const cleanedProfile = Object.fromEntries(
            Object.entries(profileData).filter(([_, value]) => value !== null)
          ) as ApiUserProfile;
          const backendResponse = await apiService.signUp(cleanedProfile);
          console.log('✅ Backend user created:', backendResponse);
          
          console.log('🔐 Step 3: Setting up local profile...');
          // Step 3: Set up local profile
          const localProfile: UserProfile = {
            name: profile.name,
            surname: profile.surname,
            email,
            major: profile.major,
            year: profile.year,
            interests: profile.interests || [],
            onboardingComplete: true,
          };
          
          set({ userProfile: localProfile, isOnboardingComplete: true, isLoading: false });
          console.log('✅ Signup completed successfully');
          return true;
          
        } catch (error) {
          console.error('❌ Signup error:', error);
          
          // If backend sync failed but Firebase user was created, delete the Firebase user
          if (firebaseUser) {
            console.log('⚠️ Rolling back Firebase user creation...');
            try {
              await firebaseUser.delete();
              console.log('✅ Firebase user rolled back successfully');
            } catch (deleteError) {
              console.error('❌ Failed to rollback Firebase user:', deleteError);
              // If rollback fails, sign out to clean up
              try {
                await signOut(auth);
              } catch (signOutError) {
                console.error('❌ Failed to sign out:', signOutError);
              }
            }
          }
          
          const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Final signup error:', errorMessage);
          return false;
        }
      },

      signInWithEmailPassword: async (email: string, password: string) => {
        // Set up loading screen
        const loadingSteps = [
          'Authenticating with Firebase...',
          'Loading your profile...',
          'Fetching event recommendations...',
          'Getting organization data...',
          'Loading calendar events...',
          'Finalizing setup...'
        ];
        
        set({ 
          isLoading: true, 
          error: null,
          showLoadingScreen: true,
          loadingSteps,
          currentLoadingStep: 0
        });
        
        try {
          // Step 1: Firebase authentication
          console.log('🔐 signInWithEmailPassword: Authenticating with Firebase...');
          await signInWithEmailAndPassword(auth, email, password);
          set({ currentLoadingStep: 1 });
          
          // Step 2: Fetch user profile data (backend uses UID from JWT token)
          console.log('🔄 signInWithEmailPassword: Fetching profile...');
          const response = await apiService.getProfile();
          set({ currentLoadingStep: 2 });
          
          // Validate profile data - handle both wrapped and unwrapped responses
          const userData = response?.user || response;
          
          if (!userData || !userData.name || !userData.major || !userData.year) {
            console.error('❌ signInWithEmailPassword: Invalid profile data received');
            throw new Error('Failed to load user profile. Required profile information is missing.');
          }
          
          // Step 3: Fetch event recommendations (backend uses UID from JWT token)
          console.log('🔄 signInWithEmailPassword: Fetching events...');
          const eventsResponse = await apiService.getEventRecommendations();
          set({ currentLoadingStep: 3 });
          
          // Step 4: Fetch organization recommendations for scholarship generation (backend uses UID from JWT token)
          console.log('🔄 signInWithEmailPassword: Fetching organizations...');
          const orgsResponse = await apiService.getOrganizationRecommendations();
          set({ currentLoadingStep: 4 });
          
          // Step 5: Fetch calendar events
          const calendarResponse = await apiService.getCalendarEvents();
          const todayEventsResponse = await apiService.getTodayEvents();
          set({ currentLoadingStep: 5 });
          
          // Convert API user profile to local user profile with real data
          // Type assertion is safe here because we validated required fields above
          const localProfile: UserProfile = {
            name: userData.name as string,
            email: userData.email || email,
            major: userData.major as string,
            year: userData.year as string,
            interests: userData.interests || [],
            onboardingComplete: true,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name as string)}&background=7B5CFF&color=fff&size=200`,
            // Map event recommendations to event history
            eventHistory: (eventsResponse.recommendations || []).map((event: any, index: number) => ({
              id: event.id || `e${index}`,
              name: event.name || event.title || `Event ${index + 1}`,
              date: event.date || new Date().toISOString().split('T')[0],
              attended: Math.random() > 0.5 // Random attendance status
            })),
            // Generate scholarships based on organizations
            scholarships: ((orgsResponse as any)?.recommendations || []).slice(0, 3).map((org: any, index: number) => ({
              id: `s${index + 1}`,
              name: `${org.name || org.title || userData.major || 'General'} Scholarship`,
              amount: Math.floor(Math.random() * 5000) + 1000,
              status: ['pending', 'awarded', 'applied'][Math.floor(Math.random() * 3)] as any
            })),
            // Add calendar events
            calendarEvents: (calendarResponse.events || []),
            // Add upcoming events (today's events)
            upcomingEvents: (todayEventsResponse.events || []),
          };
          
          console.log('✅ signInWithEmailPassword: Profile loaded successfully');
          
          // Complete loading
          set({ 
            userProfile: localProfile, 
            isOnboardingComplete: true, 
            isLoading: false,
            showLoadingScreen: false,
            currentLoadingStep: 0,
            loadingSteps: []
          });
          return true;
        } catch (error) {
          console.error('❌ signInWithEmailPassword: Error during sign in:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Sign in failed', 
            isLoading: false,
            showLoadingScreen: false,
            currentLoadingStep: 0,
            loadingSteps: []
          });
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
          console.log('🔄 loadUserProfile: Starting profile load (backend uses UID from JWT token)');
          
          // Fetch user profile data (backend uses UID from JWT token)
          const response = await apiService.getProfile() as { user: any };
          
          // Fetch event recommendations (backend uses UID from JWT token)
          const eventsResponse = await apiService.getEventRecommendations();
          
          // Fetch organization recommendations for scholarship generation (backend uses UID from JWT token)
          const orgsResponse = await apiService.getOrganizationRecommendations();
          
          // Fetch calendar events
          const calendarResponse = await apiService.getCalendarEvents();
          
          // Fetch today's events
          const todayEventsResponse = await apiService.getTodayEvents();
          
          // Convert API user profile to local user profile with real data
          const userData = response.user?.user || response.user || {};
          
          // Check if we have valid user data
          if (!userData || !userData.name) {
            console.warn('⚠️ loadUserProfile: No valid user data received, keeping existing profile');
            set({ isLoading: false });
            return false;
          }
          
          const localProfile: UserProfile = {
            name: userData.name,
            email: userData.email || email,
            major: userData.major || 'Computer Science',
            year: userData.year || 'Sophomore',
            interests: userData.interests || [],
            onboardingComplete: true,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=7B5CFF&color=fff&size=200`,
            // Map event recommendations to event history
            eventHistory: (eventsResponse.recommendations || []).map((event: any, index: number) => ({
              id: event.id || `e${index}`,
              name: event.name || event.title || `Event ${index + 1}`,
              date: event.date || new Date().toISOString().split('T')[0],
              attended: Math.random() > 0.5 // Random attendance status
            })),
            // Generate scholarships based on organizations
            scholarships: ((orgsResponse as any)?.recommendations || []).slice(0, 3).map((org: any, index: number) => ({
              id: `s${index + 1}`,
              name: `${org.name || org.title || userData.major || 'General'} Scholarship`,
              amount: Math.floor(Math.random() * 5000) + 1000,
              status: ['pending', 'awarded', 'applied'][Math.floor(Math.random() * 3)] as any
            })),
            // Add calendar events
            calendarEvents: (calendarResponse.events || []) as any,
            // Add upcoming events (today's events)
            upcomingEvents: (todayEventsResponse.events || []) as any,
          };
          
          console.log('✅ loadUserProfile: Profile loaded successfully');
          set({ 
            userProfile: localProfile, 
            isOnboardingComplete: true,
            isLoading: false 
          });
          return true;
        } catch (error) {
          console.error('❌ loadUserProfile: Failed to load profile:', error);
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
          
          await apiService.updateProfile(apiProfile);
          
          // Update local profile with changes
          const updatedLocalProfile: UserProfile = {
            ...currentProfile,
            name: apiProfile.name || currentProfile.name,
            major: apiProfile.major || currentProfile.major,
            year: apiProfile.year || currentProfile.year,
            interests: apiProfile.interests || currentProfile.interests
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
      
      clearUserData: () => set({
        userProfile: null,
        isOnboardingComplete: false,
        error: null,
        savedOrganizations: [],
        loadingSteps: [],
        currentLoadingStep: 0,
        showLoadingScreen: false
      }),
      
      // Loading screen methods
      setLoadingSteps: (steps: string[]) => set({ loadingSteps: steps, currentLoadingStep: 0 }),
      setCurrentLoadingStep: (step: number) => set({ currentLoadingStep: step }),
      setShowLoadingScreen: (show: boolean) => set({ showLoadingScreen: show }),
      
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
