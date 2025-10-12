import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, AppState } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/store/user-store";
import { useEventsStore } from "@/store/events-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { DialogProvider } from "@/context/DialogContext";
import { ToastProvider } from "@/context/ToastContext";

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
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <DialogProvider>
              <RootLayoutNav />
            </DialogProvider>
          </ToastProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isOnboardingComplete, userProfile } = useUserStore();
  const { checkAndUpdateEvents } = useEventsStore();

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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {
          fontSize: 17,
          fontFamily: Platform.OS === "ios" ? "System" : "normal",
        },
        headerBackTitleStyle: {
          fontSize: 17,
          fontFamily: Platform.OS === "ios" ? "System" : "normal",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="modals/add-event" options={{ presentation: "modal" }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: true }} />
    </Stack>
  );
}