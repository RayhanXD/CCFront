import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, AppState, View } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/store/user-store";
import { useEventsStore } from "@/store/events-store";
import { useTheme } from "@/contexts/theme-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DialogProvider } from "@/context/DialogContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
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
  const { checkAndUpdateEvents } = useEventsStore();
  const { theme } = useTheme();

  // Authentication effect
  useEffect(() => {
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
  
  // Daily events update effect
  useEffect(() => {
    // Check for events update when app starts
    if (userProfile) {
      checkAndUpdateEvents();
    }
    
    // Set up app state listener to check for updates when app comes to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && userProfile) {
        // App has come to the foreground
        checkAndUpdateEvents();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [userProfile]);

  // Apply theme to navigation container
  const getDefaultScreenOptions = () => ({
    headerShown: false,
    headerStyle: {
      backgroundColor: theme?.white || '#FFFFFF',
      borderBottomColor: theme?.border || '#E5E5E5',
      borderBottomWidth: 1,
    },
    headerTintColor: theme?.text || '#1A1A1A',
    headerTitleStyle: {
      fontSize: 17,
      fontWeight: '700' as '700',
      fontFamily: Platform.OS === "ios" ? "System" : "normal",
      color: theme?.text || '#1A1A1A',
    },
    headerBackTitleStyle: {
      fontSize: 17,
      fontFamily: Platform.OS === "ios" ? "System" : "normal",
    },
    contentStyle: {
      backgroundColor: theme?.background || '#F8F7FF',
    },
    animation: 'slide_from_right' as const,
    // Add these properties for better dark mode support
    statusBarStyle: (theme?.text === '#FFFFFF' ? 'light' : 'dark') as 'light' | 'dark',
    statusBarColor: theme?.background || '#F8F7FF',
    navigationBarColor: theme?.background || '#F8F7FF',
    // For modals
    presentation: 'card' as 'card',
    cardStyle: {
      backgroundColor: theme?.background || '#F8F7FF',
    },
  });

  return (
    <>
      <CustomStatusBar />
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