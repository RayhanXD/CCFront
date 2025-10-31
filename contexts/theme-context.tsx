import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Platform } from 'react-native';
import { setStatusBarStyle } from 'expo-status-bar';

// Define light and dark theme colors
export const lightTheme = {
  // Primary colors
  primary: '#7B5CFF',
  primaryLight: '#E8E3FF',
  primaryDark: '#5E45CC',
  
  // Background colors
  background: '#F8F7FF',
  white: '#FFFFFF',
  cardBackground: '#FFFFFF',
  inputBackground: '#F5F5F5',
  modalBackground: '#FFFFFF',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  textInverted: '#FFFFFF',
  
  // Border colors
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  
  // Status colors
  success: '#4CAF50',
  successLight: '#E8F5E9',
  error: '#F44336',
  errorLight: '#FFEBEE',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  info: '#2196F3',
  infoLight: '#E3F2FD',
  
  // UI elements
  matchBadge: '#7B5CFF',
  logoutButton: '#FF7276',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  divider: '#E5E5E5',
  icon: '#666666',
  iconActive: '#1A1A1A',
  
  // Tab bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E5E5',
  
  // Card elements
  cardShadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme = {
  // Primary colors
  primary: '#9F85FF',
  primaryLight: '#322A4C',
  primaryDark: '#6B4EE0',
  
  // Background colors
  background: '#121212',
  white: '#1E1E1E',
  cardBackground: '#2A2A2A',
  inputBackground: '#2A2A2A',
  modalBackground: '#2A2A2A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#777777',
  textInverted: '#121212',
  
  // Border colors
  border: '#333333',
  borderLight: '#444444',
  borderDark: '#222222',
  
  // Status colors
  success: '#4CAF50',
  successLight: '#1E3320',
  error: '#F44336',
  errorLight: '#331C1A',
  warning: '#FF9800',
  warningLight: '#332815',
  info: '#2196F3',
  infoLight: '#162A39',
  
  // UI elements
  matchBadge: '#9F85FF',
  logoutButton: '#FF7276',
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  divider: '#333333',
  icon: '#AAAAAA',
  iconActive: '#FFFFFF',
  
  // Tab bar
  tabBar: '#1E1E1E',
  tabBarBorder: '#333333',
  
  // Card elements
  cardShadow: 'rgba(0, 0, 0, 0.5)',
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

  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem('@theme_preference');
        
        if (themePreference !== null) {
          setIsDarkMode(themePreference === 'dark');
        } else {
          // Use system preference as default if no saved preference
          setIsDarkMode(systemColorScheme === 'dark');
        }
        setIsThemeLoaded(true);
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setIsThemeLoaded(true);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);
  
  // Update theme when loaded or changed
  useEffect(() => {
    if (isThemeLoaded) {
      applyThemeChanges(isDarkMode);
    }
  }, [isDarkMode, isThemeLoaded]);

  // Toggle theme function
  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('@theme_preference', newMode ? 'dark' : 'light');
      
      // Apply theme changes immediately
      applyThemeChanges(newMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  // Apply theme changes to the app
  const applyThemeChanges = (darkMode: boolean) => {
    // Update Expo StatusBar
    try {
      // This will update the status bar style globally
      setStatusBarStyle(darkMode ? 'light' : 'dark');
    } catch (error) {
      console.log('Error setting status bar style:', error);
    }
    
    // Apply theme to document body for web
    if (Platform.OS === 'web') {
      document.body.style.backgroundColor = darkMode ? darkTheme.background : lightTheme.background;
      document.body.style.color = darkMode ? darkTheme.text : lightTheme.text;
    }
  };

  // Get current theme based on mode
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
