import React from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { Home, BookOpen, Calendar, Search, User } from 'lucide-react-native';
import { useTheme } from "@/contexts/theme-context";
import Colors from "@/constants/colors";

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
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDarkMode ? 0.5 : 0.1,
          shadowRadius: 3,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
        // Enhanced dark mode support
        tabBarItemStyle: {
          backgroundColor: theme.tabBar,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: theme.tabBar }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={14} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scholarships"
        options={{
          title: "Scholarships",
          tabBarIcon: ({ color }) => <BookOpen size={14} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <Calendar size={14} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Search size={14} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={14} color={color} />,
        }}
      />
    </Tabs>
  );
}