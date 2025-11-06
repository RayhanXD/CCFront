import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Platform } from 'react-native';
import { setStatusBarStyle } from 'expo-status-bar';

// Theme storage key
const THEME_STORAGE_KEY = '@theme_preference';

// Define light and dark theme colors
export const lightTheme = {
  // Primary colors
  primary: '#7B5CFF',
  primaryLight: '#E8E3FF',
  primaryDark: '#5E45CC',
  primaryGradient: ['#7B5CFF', '#5E45CC'],
  
  // Secondary colors
  secondary: '#FF7C7C',
  secondaryLight: '#FFE8E8',
  secondaryDark: '#E05252',
  
  // Neutral colors
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#E5E5E5',
  neutral300: '#D4D4D4',
  neutral400: '#A3A3A3',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral800: '#262626',
  neutral900: '#171717',
  
  // Background colors
  background: '#F8F7FF',
  white: '#FFFFFF',
  cardBackground: '#FFFFFF',
  inputBackground: '#F5F5F5',
  modalBackground: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  textInverted: '#FFFFFF',
  textLink: '#7B5CFF',
  
  // Border colors
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  
  // Status colors
  success: '#4CAF50',
  successLight: '#E8F5E9',
  successDark: '#388E3C',
  error: '#F44336',
  errorLight: '#FFEBEE',
  errorDark: '#D32F2F',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  warningDark: '#F57C00',
  info: '#2196F3',
  infoLight: '#E3F2FD',
  infoDark: '#1976D2',
  
  // UI elements
  matchBadge: '#7B5CFF',
  logoutButton: '#FF7276',
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowStrong: 'rgba(0, 0, 0, 0.2)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  divider: '#E5E5E5',
  icon: '#666666',
  iconActive: '#1A1A1A',
  
  // Tab bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E5E5',
  
  // Card elements
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  
  // Focus and selection
  focus: 'rgba(123, 92, 255, 0.4)',
  selection: 'rgba(123, 92, 255, 0.2)',
  
  // Elevation levels (for consistent shadows)
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    small: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 4,
      elevation: 2,
    },
    large: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const darkTheme = {
  // Primary colors - More vibrant purple for dark mode
  primary: '#A78BFF',
  primaryLight: '#3A3259',
  primaryDark: '#7B5CFF',
  primaryGradient: ['#A78BFF', '#7B5CFF'],
  
  // Secondary colors
  secondary: '#FF7C7C',
  secondaryLight: '#4A2626',
  secondaryDark: '#E05252',
  
  // Neutral colors - Carefully calibrated for dark mode
  neutral50: '#171717',
  neutral100: '#262626',
  neutral200: '#404040',
  neutral300: '#525252',
  neutral400: '#737373',
  neutral500: '#A3A3A3',
  neutral600: '#D4D4D4',
  neutral700: '#E5E5E5',
  neutral800: '#F5F5F5',
  neutral900: '#FAFAFA',
  
  // Background colors - Deeper, richer dark backgrounds with subtle contrast
  background: '#121212',
  white: '#1E1E1E',
  cardBackground: '#252525',
  inputBackground: '#2D2D2D',
  modalBackground: '#252525',
  surfaceElevated: '#2C2C2C',
  
  // Text colors - Improved contrast and readability
  text: '#F0F0F0',
  textSecondary: '#BDBDBD',
  textMuted: '#8A8A8A',
  textInverted: '#121212',
  textLink: '#A78BFF',
  
  // Border colors - Subtle but visible borders
  border: '#383838',
  borderLight: '#4A4A4A',
  borderDark: '#1E1E1E',
  
  // Status colors - More vibrant for dark mode with better contrast
  success: '#66BB6A',
  successLight: '#1E3320',
  successDark: '#388E3C',
  error: '#FF5252',
  errorLight: '#331C1A',
  errorDark: '#D32F2F',
  warning: '#FFB74D',
  warningLight: '#332815',
  warningDark: '#F57C00',
  info: '#42A5F5',
  infoLight: '#162A39',
  infoDark: '#1976D2',
  
  // UI elements - Enhanced contrast
  matchBadge: '#A78BFF',
  logoutButton: '#FF5252',
  shadow: 'rgba(0, 0, 0, 0.6)',
  shadowStrong: 'rgba(0, 0, 0, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.75)',
  divider: '#383838',
  icon: '#BDBDBD',
  iconActive: '#FFFFFF',
  
  // Tab bar - Slightly elevated
  tabBar: '#1A1A1A',
  tabBarBorder: '#383838',
  
  // Card elements - Better shadows
  cardShadow: 'rgba(0, 0, 0, 0.6)',
  
  // Focus and selection
  focus: 'rgba(167, 139, 255, 0.5)',
  selection: 'rgba(167, 139, 255, 0.3)',
  
  // Elevation levels (for consistent shadows)
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    small: {
      shadowColor: 'rgba(0, 0, 0, 0.9)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: 'rgba(0, 0, 0, 0.9)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 4,
    },
    large: {
      shadowColor: 'rgba(0, 0, 0, 0.9)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

type ThemeType = typeof lightTheme;

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState<boolean>(false);

  // Load theme preference from storage on mount - optimized with useCallback
  const loadThemePreference = useCallback(async () => {
    try {
      const themePreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      
      if (themePreference !== null) {
        setIsDarkMode(themePreference === 'dark');
      } else {
        // Use system preference as default if no saved preference
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fall back to system preference on error
      setIsDarkMode(systemColorScheme === 'dark');
    } finally {
      setIsThemeLoaded(true);
    }
  }, [systemColorScheme]);

  // Load theme on mount
  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);
  
  // Apply theme changes - optimized with useCallback
  const applyThemeChanges = useCallback((darkMode: boolean) => {
    // Update Expo StatusBar
    try {
      setStatusBarStyle(darkMode ? 'light' : 'dark');
    } catch (error) {
      if (__DEV__) console.log('Error setting status bar style:', error);
    }
    
    // Apply theme to document body for web
    if (Platform.OS === 'web') {
      document.body.style.backgroundColor = darkMode ? darkTheme.background : lightTheme.background;
      document.body.style.color = darkMode ? darkTheme.text : lightTheme.text;
    }
  }, []);
  
  // Update theme when loaded or changed
  useEffect(() => {
    if (isThemeLoaded) {
      applyThemeChanges(isDarkMode);
    }
  }, [isDarkMode, isThemeLoaded, applyThemeChanges]);

  // Toggle theme function - optimized with useCallback
  const toggleTheme = useCallback(async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      if (__DEV__) console.error('Error saving theme preference:', error);
    }
  }, [isDarkMode]);
  
  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(() => isDarkMode ? darkTheme : lightTheme, [isDarkMode]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    isDarkMode,
    toggleTheme
  }), [theme, isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};