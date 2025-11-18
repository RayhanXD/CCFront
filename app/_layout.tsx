import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { Platform, AppState, View } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/store/user-store";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/contexts/theme-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
import { DialogProvider } from "@/contexts/dialog-context";
import { ToastProvider } from "@/contexts/toast-context";
import CustomStatusBar from "@/components/CustomStatusBar";
import AppWithLoading from "@/components/AppWithLoading";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Create a client
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <DialogProvider>
                <RootLayoutNav />
              </DialogProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isOnboardingComplete, userProfile, clearUserData, loadUserProfile } = useUserStore();
  const { theme, isDarkMode } = useTheme();
  const [isFirebaseAuthChecked, setIsFirebaseAuthChecked] = React.useState(false);
  const [firebaseUser, setFirebaseUser] = React.useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(false);

  // Listen to Firebase auth state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Firebase Auth State Changed in Layout:', user ? user.email : 'No user');
      setFirebaseUser(user);
      
      if (!user) {
        // User is not authenticated, clear all cached data
        console.log('🗑️ Clearing all cached data - user not authenticated');
        try {
          await AsyncStorage.multiRemove([
            'auth_state',
            'user_profile', 
            'calendar_cache',
            'events_cache',
            'user-store-storage'
          ]);
          
          // Clear user store
          clearUserData();
        } catch (error) {
          console.error('Error clearing cache:', error);
        }
      } else if (user.email) {
        // User is authenticated - check if profile needs loading
        // This handles app reload with persisted auth (not fresh sign-in)
        const currentProfile = useUserStore.getState().userProfile;
        const needsProfile = !currentProfile || 
                            !currentProfile.name || 
                            currentProfile.name === 'Student Name' ||
                            currentProfile.email !== user.email; // Email mismatch means different user
        
        if (needsProfile) {
          console.log('🔄 Layout: Profile missing or invalid, loading for:', user.email);
          setIsLoadingProfile(true);
          try {
            const success = await loadUserProfile(user.email);
            if (!success) {
              console.warn('⚠️ Layout: Failed to load profile, user may need to sign in again');
            }
          } catch (error) {
            console.error('❌ Layout: Failed to load profile:', error);
          } finally {
            setIsLoadingProfile(false);
          }
        } else {
          console.log('✅ Layout: Profile already loaded for:', user.email, '- Name:', currentProfile.name);
        }
      }
      
      setIsFirebaseAuthChecked(true);
    });

    return () => unsubscribe();
  }, [clearUserData, loadUserProfile]);

  // Use a layout effect to handle auth redirects - this runs before regular effects
  React.useLayoutEffect(() => {
    // Don't redirect until Firebase auth state is checked and profile loading is complete
    if (!isFirebaseAuthChecked || isLoadingProfile) {
      return;
    }

    const inAuthGroup = segments[0] === "onboarding" || segments[0] === "auth";
    const hasFirebaseUser = !!firebaseUser;
    const hasUserProfile = !!userProfile;
    const isFullyAuthenticated = hasFirebaseUser && hasUserProfile && isOnboardingComplete;

    console.log('🔄 Auth Check:', {
      segments: segments[0],
      inAuthGroup,
      hasFirebaseUser,
      hasUserProfile,
      isOnboardingComplete,
      isFullyAuthenticated,
      isLoadingProfile
    });

    if (!hasFirebaseUser && !inAuthGroup) {
      // No Firebase user, redirect to auth
      console.log('➡️ Redirecting to auth - no Firebase user');
      router.replace("/auth/signin");
    } else if (hasFirebaseUser && !hasUserProfile && !inAuthGroup) {
      // Firebase user exists but no profile, redirect to auth to complete setup
      console.log('➡️ Redirecting to auth - Firebase user but no profile');
      router.replace("/auth/signin");
    } else if (isFullyAuthenticated && inAuthGroup) {
      // Fully authenticated, redirect to main app
      console.log('➡️ Redirecting to main app - fully authenticated');
      router.replace("/");
    }
  }, [isFirebaseAuthChecked, isLoadingProfile, firebaseUser, userProfile, isOnboardingComplete, segments, router]);
  
  // We're completely removing the data initialization logic from _layout.tsx
  // Each component will be responsible for fetching its own data when needed
  // This prevents infinite update loops caused by centralized data fetching
  // The events store will auto-initialize itself when imported

  // Apply theme to navigation container with enhanced dark mode support
  const getDefaultScreenOptions = () => ({
    headerShown: false,
    headerStyle: {
      backgroundColor: theme?.cardBackground || '#FFFFFF',
      borderBottomColor: theme?.border || '#E5E5E5',
      borderBottomWidth: 1,
      elevation: isDarkMode ? 4 : 2,
      shadowColor: theme?.shadow || '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: isDarkMode ? 3 : 2,
    },
    headerTintColor: theme?.text || '#1A1A1A',
    headerTitleStyle: {
      fontSize: 17,
      fontWeight: '600' as '600',
      fontFamily: Platform.OS === "ios" ? "System" : "normal",
      color: theme?.text || '#1A1A1A',
    },
    headerBackTitleStyle: {
      fontSize: 16,
      fontFamily: Platform.OS === "ios" ? "System" : "normal",
      color: theme?.textSecondary || '#666666',
    },
    contentStyle: {
      backgroundColor: theme?.background || '#F8F7FF',
    },
    animation: 'slide_from_right' as const,
    // For modals
    presentation: 'card' as 'card',
    cardStyle: {
      backgroundColor: theme?.background || '#F8F7FF',
    },
    // Enhanced dark mode support
    cardOverlayEnabled: true,
    cardShadowEnabled: true,
  });

  // isDarkMode is already declared above

  return (
    <AppWithLoading>
      <CustomStatusBar 
        style={isDarkMode ? 'light' : 'dark'} 
        backgroundColor={isDarkMode ? theme.background : 'transparent'}
      />
      <Stack
      screenOptions={getDefaultScreenOptions()}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="modals/add-event" options={{ presentation: "modal" }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="chatbot" options={{ headerShown: false }} />
    </Stack>
    </AppWithLoading>
  );
}