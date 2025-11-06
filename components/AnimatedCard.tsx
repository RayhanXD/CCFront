import React, { useRef, memo, useCallback, useMemo } from 'react';
import { 
  Animated, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle, 
  Platform
} from 'react-native';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  activeOpacity?: number;
  scaleValue?: number;
  disabled?: boolean;
}

// Pre-define animation configurations for better performance
const SPRING_CONFIG_NATIVE = {
  useNativeDriver: true,
  speed: 20,
  bounciness: 4,
};

const SPRING_CONFIG_WEB = {
  useNativeDriver: false,
  speed: 20,
  bounciness: 4,
};

const AnimatedCard = ({ 
  children, 
  onPress, 
  style, 
  activeOpacity = 0.95,
  scaleValue = 0.98,
  disabled = false
}: AnimatedCardProps) => {
  // Create animation value only once
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Memoize animation configurations
  const springConfigIn = useMemo(() => ({
    toValue: scaleValue,
    ...(Platform.OS === 'web' ? SPRING_CONFIG_WEB : SPRING_CONFIG_NATIVE)
  }), [scaleValue]);
  
  const springConfigOut = useMemo(() => ({
    toValue: 1,
    ...(Platform.OS === 'web' ? SPRING_CONFIG_WEB : SPRING_CONFIG_NATIVE)
  }), []);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handlePressIn = useCallback(() => {
    if (disabled) return;
    Animated.spring(scaleAnim, springConfigIn).start();
  }, [disabled, scaleAnim, springConfigIn]);
  
  const handlePressOut = useCallback(() => {
    if (disabled) return;
    Animated.spring(scaleAnim, springConfigOut).start();
  }, [disabled, scaleAnim, springConfigOut]);
  
  // Memoize styles to prevent unnecessary style object creation
  const animatedStyle = useMemo(() => ([
    styles.container,
    style,
    { transform: [{ scale: scaleAnim }] }
  ]), [style, scaleAnim]);
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={activeOpacity}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(AnimatedCard);