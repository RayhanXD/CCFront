import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Animated,
  Platform,
  Keyboard,
  NativeSyntheticEvent,
  TextInputFocusEventData
} from 'react-native';
import { useTheme } from '@/contexts/theme-context';
import ThemedIcon from './ThemedIcon';
import Haptics from 'expo-haptics';
import { spacing } from '@/utils/spacing';

type InputVariant = 'outlined' | 'filled' | 'underlined';

interface ThemedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ComponentProps<typeof ThemedIcon>['name'];
  rightIcon?: React.ComponentProps<typeof ThemedIcon>['name'];
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  helperStyle?: StyleProp<TextStyle>;
  variant?: InputVariant;
  animateLabel?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  success?: boolean;
  hapticFeedback?: boolean;
  accessibilityHint?: string;
}

/**
 * A themed input component with consistent styling
 * Supports labels, icons, animations, and error messages
 * Enhanced with accessibility features and haptic feedback
 */
function ThemedInput({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  variant = 'outlined',
  animateLabel = true,
  fullWidth = false,
  disabled = false,
  success = false,
  hapticFeedback = true,
  accessibilityHint,
  ...props
}: ThemedInputProps) {
  const { theme, isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(props.value || props.defaultValue));
  
  // Animation values
  const labelPositionAnim = useRef(new Animated.Value(hasValue || isFocused ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  
  // Update hasValue when value prop changes
  useEffect(() => {
    setHasValue(Boolean(props.value));
  }, [props.value]);
  
  // Animate label position when focus or value changes
  useEffect(() => {
    if (animateLabel) {
      Animated.timing(labelPositionAnim, {
        toValue: (isFocused || hasValue) ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, hasValue, animateLabel, labelPositionAnim]);
  
  // Animate border when focus changes
  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, borderAnim]);
  
  // Handle focus event
  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (props.onFocus) {
      props.onFocus(e);
    }
  };
  
  // Handle blur event
  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };
  
  // Handle change text
  const handleChangeText = (text: string) => {
    setHasValue(text.length > 0);
    if (props.onChangeText) {
      props.onChangeText(text);
    }
  };
  
  // Focus input when label is pressed
  const handleLabelPress = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Determine input container styles based on variant and state
  const getInputContainerStyles = useMemo(() => {
    const baseStyles: any = {
      borderColor: error ? theme.error : success ? theme.success : isFocused ? theme.primary : theme.border,
    };
    
    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: disabled ? theme.borderLight : theme.inputBackground,
          borderWidth: 0,
          borderBottomWidth: 2,
          borderRadius: spacing.xs,
        };
      case 'underlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderBottomWidth: 2,
          borderRadius: 0,
          paddingHorizontal: 0,
        };
      case 'outlined':
      default:
        return {
          ...baseStyles,
          backgroundColor: disabled ? theme.borderLight : theme.inputBackground,
          borderWidth: 1,
          borderRadius: spacing.xs,
          shadowColor: isFocused ? theme.primary : theme.shadow,
          shadowOpacity: isDarkMode ? (isFocused ? 0.3 : 0.1) : (isFocused ? 0.2 : 0.05),
          elevation: isDarkMode && !disabled ? (isFocused ? 4 : 1) : (isFocused ? 2 : 0),
        };
    }
  }, [variant, isFocused, error, success, disabled, theme, isDarkMode]);
  
  // Animated label styles
  const labelAnimatedStyle = useMemo(() => {
    if (!animateLabel || !label) return {};
    
    const topPosition = labelPositionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [variant === 'underlined' ? 14 : 12, -10],
    });
    
    const fontSize = labelPositionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    });
    
    const color = borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.textSecondary, error ? theme.error : success ? theme.success : theme.primary],
    });
    
    return {
      position: 'absolute' as 'absolute',
      left: variant === 'underlined' ? 0 : spacing.sm,
      top: topPosition,
      fontSize,
      color,
      backgroundColor: variant === 'outlined' ? theme.inputBackground : 'transparent',
      paddingHorizontal: variant === 'outlined' ? 4 : 0,
      zIndex: 1,
    };
  }, [animateLabel, label, labelPositionAnim, borderAnim, variant, theme, error, success]);
  
  return (
    <View style={[
      styles.container, 
      fullWidth && styles.fullWidth,
      containerStyle
    ]}>
      {/* Animated floating label */}
      {label && animateLabel && (
        <Animated.Text 
          style={[styles.animatedLabel, labelAnimatedStyle, labelStyle]}
          onPress={handleLabelPress}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>
      )}
      
      {/* Static label (when animation is disabled) */}
      {label && !animateLabel && (
        <Text 
          style={[
            styles.label, 
            { color: error ? theme.error : success ? theme.success : theme.text },
            labelStyle
          ]}
          onPress={handleLabelPress}
        >
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        getInputContainerStyles,
        disabled && styles.disabledInput
      ]}>
        {leftIcon && (
          <ThemedIcon 
            name={leftIcon} 
            size={20} 
            color={theme.icon} 
            style={styles.leftIcon} 
          />
        )}
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { 
              color: disabled ? theme.textMuted : theme.text,
              backgroundColor: 'transparent',
              paddingTop: (animateLabel && label) ? spacing.sm : 0
            },
            inputStyle
          ]}
          placeholderTextColor={theme.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          editable={!disabled}
          accessibilityState={{ disabled }}
          accessibilityHint={accessibilityHint}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIcon}
          >
            <ThemedIcon name={rightIcon} size={20} color={theme.icon} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Helper text or error message */}
      {(error || helper) && (
        <Text style={[
          styles.helperText,
          { color: error ? theme.error : success ? theme.success : theme.textSecondary },
          error ? errorStyle : helperStyle
        ]}>
          {error || helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    marginBottom: spacing.xs,
    fontSize: 14,
    fontWeight: '500',
  },
  animatedLabel: {
    fontWeight: '500',
    position: 'absolute',
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    minHeight: 56,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    position: 'relative',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    paddingVertical: spacing.sm,
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific styles
      outlineStyle: 'none',
      outlineWidth: 0,
    } : {}),
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
    padding: 4,
  },
  helperText: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 16,
  },
  disabledInput: {
    opacity: 0.7,
  },
});

// Export memoized component to prevent unnecessary re-renders
export default memo(ThemedInput);
