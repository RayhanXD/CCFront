import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';

/**
 * Hook to access all app settings in one place
 * This makes it easy to get theme and language settings together
 */
export function useAppSettings() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  
  return {
    // Theme settings
    theme,
    isDarkMode,
    toggleTheme,
    
    // Language settings
    language,
    setLanguage,
    t,
    availableLanguages,
    
    // Helper functions
    isRTL: false, // Currently no RTL languages supported, add logic here when needed
  };
}

export default useAppSettings;
