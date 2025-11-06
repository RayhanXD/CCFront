import React, { useMemo } from "react";
import { Tabs } from "expo-router";
import { View, Platform } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import ThemedIcon from "@/components/ThemedIcon";
import Colors from "@/constants/colors";
import { lazyLoad } from "@/utils/lazy-load";

// Lazy load tab screens for better performance
const LazyHomeScreen = lazyLoad(() => import('./index'));
const LazyScholarshipsScreen = lazyLoad(() => import('./scholarships'));
const LazyCalendarScreen = lazyLoad(() => import('./calendar'));
const LazyExploreScreen = lazyLoad(() => import('./explore'));
const LazyProfileScreen = lazyLoad(() => import('./profile'));

export default function TabLayout() {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          borderTopColor: theme.border,
          backgroundColor: theme.tabBar,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
          shadowColor: isDarkMode ? '#000' : theme.shadow,
          shadowOffset: { width: 0, height: isDarkMode ? -3 : -2 },
          shadowOpacity: isDarkMode ? 0.6 : 0.1,
          shadowRadius: isDarkMode ? 5 : 3,
          elevation: isDarkMode ? 12 : 10,
          borderTopWidth: isDarkMode ? 0.5 : 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
          textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
          textShadowOffset: { width: 0, height: isDarkMode ? 0.5 : 0 },
          textShadowRadius: isDarkMode ? 1 : 0,
        },
        headerShown: false,
        // Enhanced dark mode support
        tabBarItemStyle: {
          backgroundColor: theme.tabBar,
        },
        tabBarBackground: () => (
          <View style={{ 
            flex: 1, 
            backgroundColor: theme.tabBar,
            borderTopColor: theme.border,
            borderTopWidth: isDarkMode ? 0.5 : 1,
          }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <ThemedIcon 
              name="Home" 
              size={20} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scholarships"
        options={{
          title: "Scholarships",
          tabBarIcon: ({ color, focused }) => (
            <ThemedIcon 
              name="BookOpen" 
              size={20} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => (
            <ThemedIcon 
              name="Calendar" 
              size={20} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <ThemedIcon 
              name="Search" 
              size={20} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <ThemedIcon 
              name="User" 
              size={20} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}