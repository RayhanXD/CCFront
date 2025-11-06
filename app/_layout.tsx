import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { Platform, AppState, View } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/store/user-store";
import { useTheme } from "@/contexts/theme-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
import { DialogProvider } from "@/contexts/dialog-context";
import { ToastProvider } from "@/contexts/toast-context";
import CustomStatusBar from "@/components/CustomStatusBar";

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
  const { isOnboardingComplete, userProfile } = useUserStore();
  const { theme, isDarkMode } = useTheme();

  // Use a layout effect to handle auth redirects - this runs before regular effects
  React.useLayoutEffect(() => {
    const inAuthGroup = segments[0] === "onboarding" || segments[0] === "auth";
    const isAuthenticated = userProfile && isOnboardingComplete;

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated
      router.replace("/auth/signin");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace("/");
    }
  }, [isOnboardingComplete, userProfile, segments]);
  
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
    <>
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
    </>
  );
}