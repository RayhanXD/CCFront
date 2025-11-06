import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

interface CustomStatusBarProps {
  style?: 'light' | 'dark';
  backgroundColor?: string;
}

/**
 * Enhanced CustomStatusBar component with improved dark mode support
 * This component handles status bar appearance across the app
 */
export default function CustomStatusBar({ style, backgroundColor }: CustomStatusBarProps) {
  const { isDarkMode, theme } = useTheme();
  
  // If style is provided, use it, otherwise determine based on theme
  const statusBarStyle = style || (isDarkMode ? 'light' : 'dark');
  
  // Convert to React Native's StatusBar style format
  const barStyle = statusBarStyle === 'light' ? 'light-content' : 'dark-content';
  
  // Set background color based on platform, theme, and props with enhanced dark mode support
  const bgColor = backgroundColor || 
                 (Platform.OS === 'ios' ? 'transparent' : 
                 isDarkMode ? theme.background : theme.white);
  
  // Update status bar on theme change
  useEffect(() => {
    // For iOS, we need to force the status bar update when theme changes
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle(barStyle, true);
    }
  }, [isDarkMode, barStyle]);
  
  return (
    <StatusBar 
      barStyle={barStyle} 
      backgroundColor={bgColor} 
      translucent={true}
    />
  );
}
