import React, { useRef, memo, useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
  Platform,
  Animated,
} from 'react-native';
import { useTheme } from '@/contexts/theme-context';
import Haptics from 'expo-haptics';

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardElevation = 'none' | 'low' | 'medium' | 'high';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  elevation?: CardElevation;
  onPress?: () => void;
  disabled?: boolean;
  hapticFeedback?: boolean;
  borderRadius?: number;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * A modern card component with enhanced shadows, animations, and haptic feedback
 */
function Card({
  children,
  style,
  variant = 'elevated',
  elevation = 'medium',
  onPress,
  disabled = false,
  hapticFeedback = true,
  borderRadius = 12,
  fullWidth = false,
  accessibilityLabel,
  testID,
}: CardProps) {
  const { theme, isDarkMode } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(1)).current;
  
  // Handle press in
  const handlePressIn = useCallback(() => {
    if (disabled || !onPress) return;
    
    setIsPressed(true);
    
    // Scale down animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(elevationAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
    
    // Haptic feedback
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [disabled, onPress, hapticFeedback, scaleAnim, elevationAnim]);
  
  // Handle press out
  const handlePressOut = useCallback(() => {
    if (disabled || !onPress) return;
    
    setIsPressed(false);
    
    // Scale back up animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(elevationAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [disabled, onPress, scaleAnim, elevationAnim]);
  
  // Handle press
  const handlePress = useCallback(() => {
    if (disabled || !onPress) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onPress();
  }, [disabled, onPress, hapticFeedback]);
  
  // Get elevation styles based on variant and elevation level
  const getElevationStyle = useCallback(() => {
    if (variant !== 'elevated') return {};
    
    const baseElevation = {
      none: { shadowRadius: 0, elevation: 0 },
      low: { shadowRadius: isDarkMode ? 3 : 2, elevation: isDarkMode ? 2 : 1 },
      medium: { shadowRadius: isDarkMode ? 6 : 4, elevation: isDarkMode ? 4 : 2 },
      high: { shadowRadius: isDarkMode ? 12 : 8, elevation: isDarkMode ? 8 : 4 },
    }[elevation];
    
    return {
      shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.2)',
      shadowOffset: { 
        width: 0, 
        height: isPressed ? baseElevation.elevation / 2 : baseElevation.elevation / 1.5 
      },
      shadowOpacity: isDarkMode ? 0.5 : 0.25,
      shadowRadius: isPressed ? baseElevation.shadowRadius / 1.5 : baseElevation.shadowRadius,
      elevation: isPressed ? baseElevation.elevation / 1.5 : baseElevation.elevation,
    };
  }, [variant, elevation, isDarkMode, isPressed]);
  
  // Get background color based on variant
  const getBackgroundColor = useCallback(() => {
    switch (variant) {
      case 'elevated':
        return isDarkMode ? theme.cardBackground : theme.white;
      case 'outlined':
        return 'transparent';
      case 'filled':
        return isDarkMode ? theme.primaryDark : theme.primaryLight;
      default:
        return isDarkMode ? theme.cardBackground : theme.white;
    }
  }, [variant, theme, isDarkMode]);
  
  // Get border styles based on variant
  const getBorderStyle = useCallback(() => {
    if (variant === 'outlined') {
      return {
        borderWidth: 1,
        borderColor: isDarkMode ? theme.borderLight : theme.border,
      };
    }
    return { borderWidth: 0 };
  }, [variant, theme, isDarkMode]);
  
  // Memoize styles to prevent unnecessary recalculations
  const containerStyle = useMemo(() => [
    styles.container,
    {
      backgroundColor: getBackgroundColor(),
      borderRadius,
      ...getBorderStyle(),
    },
    getElevationStyle(),
    fullWidth && styles.fullWidth,
    style,
  ], [getBackgroundColor, borderRadius, getBorderStyle, getElevationStyle, fullWidth, style]);
  
  // Memoize animated styles
  const animatedStyle = useMemo(() => ({
    transform: [{ scale: onPress ? scaleAnim : 1 }],
  }), [onPress, scaleAnim]);
  
  // Render as touchable or plain view
  const content = (
    <Animated.View style={[containerStyle, animatedStyle]}>
      {children}
    </Animated.View>
  );
  
  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        testID={testID}
        style={styles.pressable}
        android_ripple={variant !== 'outlined' ? { color: 'rgba(0, 0, 0, 0.1)', borderless: false } : null}
      >
        {content}
      </Pressable>
    );
  }
  
  return content;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transitionProperty: 'box-shadow, transform, opacity',
        transitionDuration: '200ms',
      },
    }),
  },
  pressable: {
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
});

export default memo(Card);
