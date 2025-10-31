import React from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/theme-context';

interface CustomStatusBarProps {
  style?: 'auto' | 'inverted' | 'light' | 'dark';
}

/**
 * Custom StatusBar component that uses Expo's StatusBar
 * This ensures consistent status bar behavior across the app
 */
export default function CustomStatusBar({ style }: CustomStatusBarProps) {
  const { isDarkMode } = useTheme();
  
  // If style is provided, use it, otherwise determine based on theme
  const statusBarStyle = style || (isDarkMode ? 'light' : 'dark');
  
  return <ExpoStatusBar style={statusBarStyle} />;
}
