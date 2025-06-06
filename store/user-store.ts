import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types/user';

interface UserState {
  userProfile: UserProfile | null;
  isOnboardingComplete: boolean;
  setUserProfile: (profile: UserProfile) => void;
  setUserInterests: (interests: string[]) => void;
  setOnboardingComplete: (complete: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userProfile: null,
      isOnboardingComplete: false,
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
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);