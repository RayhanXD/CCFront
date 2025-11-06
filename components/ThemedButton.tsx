import React, { useState, useRef, memo, useMemo } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  Animated,
  Platform,
  Pressable,
  View
} from 'react-native';
import { useTheme } from '@/contexts/theme-context';
import ThemedIcon from './ThemedIcon';
import { createSpringAnimation } from '@/utils/animation';
import Haptics from 'expo-haptics';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger' | 'success' | 'gradient';
type ButtonSize = 'small' | 'medium' | 'large';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: {
    name: React.ComponentProps<typeof ThemedIcon>['name'];
    position?: 'left' | 'right';
  };
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  rounded?: boolean;
  elevated?: boolean;
  accessibilityLabel?: string;
  hapticFeedback?: boolean;
  animationDuration?: number;
}

/**
 * A themed button component with consistent styling
 * Supports multiple variants, sizes, and states
 * Enhanced with animations, haptic feedback, and accessibility
 */
function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
  rounded = false,
  elevated = true,
  accessibilityLabel,
  hapticFeedback = true,
  animationDuration = 150,
}: ThemedButtonProps) {
  const { theme, isDarkMode } = useTheme();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  // Touch state
  const [isPressed, setIsPressed] = useState(false);
  
  // Handle press in
  const handlePressIn = () => {
    setIsPressed(true);
    
    // Scale down animation
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
    
    // Haptic feedback
    if (hapticFeedback && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Handle press out
  const handlePressOut = () => {
    setIsPressed(false);
    
    // Scale back up animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  // Handle button press with haptic feedback
  const handlePress = () => {
    if (hapticFeedback && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };
  
  // Get button styles based on variant with enhanced dark mode support
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.primaryLight : theme.primary,
          borderColor: 'transparent',
          shadowColor: isDarkMode ? theme.primaryDark : theme.primary,
          shadowOpacity: isDarkMode ? 0.3 : 0.2,
          elevation: isDarkMode ? 4 : 2,
        };
      case 'secondary':
        return {
          backgroundColor: isDarkMode ? theme.cardBackground : theme.white,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          shadowOpacity: isDarkMode ? 0.2 : 0.1,
          elevation: isDarkMode ? 2 : 1,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: isDarkMode ? theme.primaryLight : theme.primary,
          shadowColor: 'transparent',
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          shadowColor: 'transparent',
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'danger':
        return {
          backgroundColor: disabled ? theme.errorLight : theme.error,
          borderColor: 'transparent',
          shadowColor: isDarkMode ? theme.error : 'rgba(244, 67, 54, 0.4)',
          shadowOpacity: isDarkMode ? 0.3 : 0.2,
          elevation: isDarkMode ? 4 : 2,
        };
      case 'success':
        return {
          backgroundColor: disabled ? theme.successLight : theme.success,
          borderColor: 'transparent',
          shadowColor: isDarkMode ? theme.success : 'rgba(76, 175, 80, 0.4)',
          shadowOpacity: isDarkMode ? 0.3 : 0.2,
          elevation: isDarkMode ? 4 : 2,
        };
      case 'gradient':
        // Gradient is handled separately with a gradient component
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          shadowColor: theme.primary,
          shadowOpacity: 0.3,
          elevation: 3,
        };
      default:
        return {
          backgroundColor: theme.primary,
          borderColor: 'transparent',
          shadowColor: theme.primary,
          shadowOpacity: 0.2,
          elevation: 2,
        };
    }
  };
  
  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return theme.textInverted;
      case 'secondary':
        return theme.text;
      case 'outline':
        return theme.primary;
      case 'text':
        return theme.primary;
      case 'danger':
        return theme.textInverted;
      case 'success':
        return theme.textInverted;
      case 'gradient':
        return theme.textInverted;
      default:
        return theme.textInverted;
    }
  };
  
  // Get button size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
        };
    }
  };
  
  // Memoize styles to prevent unnecessary recalculations
  const buttonStyles = useMemo(() => getButtonStyles(), [variant, disabled, isDarkMode, theme]);
  const textColor = useMemo(() => getTextColor(), [variant, theme]);
  const sizeStyles = useMemo(() => getSizeStyles(), [size]);
  
  // Calculate border radius based on size and rounded prop
  const borderRadius = useMemo(() => {
    if (rounded) {
      // Fully rounded corners based on height
      return sizeStyles.paddingVertical * 2 + sizeStyles.fontSize;
    }
    return size === 'small' ? 6 : size === 'large' ? 12 : 8;
  }, [rounded, size, sizeStyles]);
  
  // Calculate shadow styles based on elevated prop
  const shadowStyles = useMemo(() => {
    if (!elevated || variant === 'text' || variant === 'outline') {
      return {};
    }
    
    return {
      shadowColor: buttonStyles.shadowColor,
      shadowOffset: { width: 0, height: isPressed ? 1 : 2 },
      shadowOpacity: isPressed ? buttonStyles.shadowOpacity / 2 : buttonStyles.shadowOpacity,
      shadowRadius: isPressed ? 2 : 3,
      elevation: isPressed ? Math.max(1, buttonStyles.elevation - 1) : buttonStyles.elevation,
    };
  }, [elevated, variant, buttonStyles, isPressed]);
  
  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        style={[
          styles.button,
          { borderColor: buttonStyles.borderColor, backgroundColor: buttonStyles.backgroundColor },
          { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal },
          { borderRadius },
          shadowStyles,
          disabled && styles.disabled,
          isPressed && styles.pressed,
          fullWidth && styles.fullWidth,
          style,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        android_ripple={variant !== 'text' ? { color: 'rgba(0, 0, 0, 0.1)', borderless: false } : null}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: disabled || loading }}
      >
        <View style={styles.contentContainer}>
          {loading ? (
            <ActivityIndicator 
              size="small" 
              color={textColor} 
              style={styles.loader} 
            />
          ) : (
            <>
              {icon && icon.position !== 'right' && (
                <ThemedIcon 
                  name={icon.name} 
                  size={sizeStyles.fontSize + 4} 
                  color={textColor} 
                  style={styles.leftIcon} 
                />
              )}
              
              <Text 
                style={[
                  styles.text, 
                  { color: textColor, fontSize: sizeStyles.fontSize },
                  textStyle
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
              
              {icon && icon.position === 'right' && (
                <ThemedIcon 
                  name={icon.name} 
                  size={sizeStyles.fontSize + 4} 
                  color={textColor} 
                  style={styles.rightIcon} 
                />
              )}
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
        transitionProperty: 'transform, opacity, background-color',
        transitionDuration: '150ms',
      },
    }),
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.95,
  },
  loader: {
    marginHorizontal: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

// Export memoized component to prevent unnecessary re-renders
export default memo(ThemedButton);
