import React, { memo, useMemo } from 'react';
import { Text, StyleSheet, TextProps, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'button';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type TextColor = 'primary' | 'secondary' | 'muted' | 'inverted' | 'accent' | 'error' | 'success' | 'warning';

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

// Pre-compute variant styles outside the component for better performance
const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  h1: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.25,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0.15,
  },
  h4: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  button: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
};

// Pre-compute weight styles
const WEIGHT_STYLES: Record<TextWeight, TextStyle> = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
};

/**
 * A themed text component with consistent styling
 * Supports various text variants, weights, and colors
 */
function ThemedText({
  variant = 'body',
  weight = 'regular',
  color = 'primary',
  style,
  children,
  ...props
}: ThemedTextProps) {
  const { theme, isDarkMode } = useTheme();
  
  // Get color style - must be computed at runtime due to theme dependency
  const colorStyle = useMemo(() => {
    switch (color) {
      case 'primary':
        return { color: theme.text };
      case 'secondary':
        return { color: theme.textSecondary };
      case 'muted':
        return { color: theme.textMuted };
      case 'inverted':
        return { color: theme.textInverted };
      case 'accent':
        return { color: theme.primary };
      case 'error':
        return { color: theme.error };
      case 'success':
        return { color: theme.success };
      case 'warning':
        return { color: theme.warning };
      default:
        return { color: theme.text };
    }
  }, [color, theme]);
  
  // Combine all styles - memoized to prevent unnecessary recalculations
  const textStyle = useMemo(() => [
    VARIANT_STYLES[variant] || VARIANT_STYLES.body,
    WEIGHT_STYLES[weight] || WEIGHT_STYLES.regular,
    colorStyle,
    isDarkMode && styles.darkModeText,
    style,
  ], [variant, weight, colorStyle, isDarkMode, style]);
  
  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  darkModeText: {
    // Improve text rendering in dark mode
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 0.5,
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(ThemedText);