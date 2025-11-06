import { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { lightTheme, darkTheme } from '@/contexts/theme-context';

type ThemeType = typeof lightTheme;

/**
 * Creates themed styles based on the current theme
 * @param styleCreator Function that takes a theme and returns styles
 * @returns A function that takes a theme and returns the created styles
 */
export function createThemedStyles<T extends Record<string, StyleProp<ViewStyle> | StyleProp<TextStyle>>>(
  styleCreator: (theme: ThemeType, isDarkMode: boolean) => T
): (theme: ThemeType, isDarkMode: boolean) => T {
  return styleCreator;
}

/**
 * Helper to create conditional styles
 * @param condition Condition to evaluate
 * @param trueStyle Style to apply if condition is true
 * @param falseStyle Style to apply if condition is false
 * @returns The appropriate style based on the condition
 */
export function conditionalStyle<T>(
  condition: boolean,
  trueStyle: StyleProp<T>,
  falseStyle?: StyleProp<T>
): StyleProp<T> {
  return condition ? trueStyle : (falseStyle || null as unknown as StyleProp<T>);
}

/**
 * Helper to apply theme colors to text
 * @param theme Current theme
 * @param isDarkMode Whether dark mode is enabled
 * @param variant Text variant (primary, secondary, etc.)
 * @returns Text style with appropriate color
 */
export function getTextColor(
  theme: ThemeType,
  isDarkMode: boolean,
  variant: 'primary' | 'secondary' | 'error' | 'success' | 'warning' = 'primary'
): { color: string } {
  switch (variant) {
    case 'primary':
      return { color: theme.text };
    case 'secondary':
      return { color: theme.textSecondary };
    case 'error':
      return { color: theme.error };
    case 'success':
      return { color: theme.success };
    case 'warning':
      return { color: theme.warning };
    default:
      return { color: theme.text };
  }
}

/**
 * Helper to apply theme colors to backgrounds
 * @param theme Current theme
 * @param isDarkMode Whether dark mode is enabled
 * @param variant Background variant (primary, card, etc.)
 * @returns Background style with appropriate color
 */
export function getBackgroundColor(
  theme: ThemeType,
  isDarkMode: boolean,
  variant: 'primary' | 'card' | 'screen' = 'screen'
): { backgroundColor: string } {
  switch (variant) {
    case 'primary':
      return { backgroundColor: theme.primary };
    case 'card':
      return { backgroundColor: theme.white };
    case 'screen':
      return { backgroundColor: theme.background };
    default:
      return { backgroundColor: theme.background };
  }
}

export default {
  createThemedStyles,
  conditionalStyle,
  getTextColor,
  getBackgroundColor,
};
