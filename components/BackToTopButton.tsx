import React, { useEffect, useState, useRef, memo, useMemo, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/theme-context';
import { createFadeAnimation, createSpringAnimation } from '@/utils/animation';

interface BackToTopButtonProps {
  scrollY: Animated.Value;
  onPress: () => void;
  threshold?: number;
}

// Pre-define animation configurations
const FADE_IN_CONFIG = {
  toValue: 1,
  duration: 200,
  useNativeDriver: true,
};

const FADE_OUT_CONFIG = {
  toValue: 0,
  duration: 200,
  useNativeDriver: true,
};

const SCALE_CONFIG = {
  toValue: 1,
  friction: 7,
  tension: 40,
  useNativeDriver: true,
};

const BackToTopButton = ({ 
  scrollY, 
  onPress, 
  threshold = 200 
}: BackToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme, isDarkMode } = useTheme();
  
  // Animation values - use refs to persist between renders
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  
  // Memoize the scroll handler to prevent unnecessary re-renders
  const handleScroll = useCallback(({ value }: { value: number }) => {
    if (value > threshold && !isVisible) {
      setIsVisible(true);
      Animated.parallel([
        createFadeAnimation(opacity, 1, { duration: 200 }),
        createSpringAnimation(scale, 1, { friction: 7, tension: 40 })
      ]).start();
    } else if (value <= threshold && isVisible) {
      setIsVisible(false);
      createFadeAnimation(opacity, 0, { duration: 200 }).start();
    }
  }, [threshold, isVisible, opacity, scale]);
  
  useEffect(() => {
    const listenerId = scrollY.addListener(handleScroll);
    
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY, handleScroll]);
  
  // Early return for web to improve performance
  if (Platform.OS === 'web' && !isVisible) {
    return null;
  }
  
  // Memoize styles to prevent unnecessary style object creation
  const containerStyle = useMemo(() => ({
    ...styles.container,
    opacity,
    transform: [{ scale }],
    // Type-safe display property
    display: (Platform.OS !== 'web' || isVisible ? 'flex' : 'none') as 'flex' | 'none'
  }), [opacity, scale, isVisible]);
  
  const buttonStyle = useMemo(() => ([
    styles.button,
    { 
      backgroundColor: theme.primary,
      shadowColor: isDarkMode ? theme.primary : '#000',
      shadowOpacity: isDarkMode ? 0.4 : 0.2,
      elevation: isDarkMode ? 8 : 5,
    }
  ]), [theme.primary, isDarkMode]);
  
  return (
    <Animated.View style={containerStyle}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <ArrowUp 
          size={20} 
          color={theme.white || '#FFFFFF'} 
          strokeWidth={isDarkMode ? 2.5 : 2}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(BackToTopButton);