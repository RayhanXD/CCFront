import React, { useEffect, useRef, useState } from 'react';
import { Animated, ViewStyle, StyleProp, View, Easing } from 'react-native';
import Haptics from 'expo-haptics';
import { durations, easings, createFadeAnimation, createScaleAnimation, createSpringAnimation } from './animation';

/**
 * Utility functions and hooks for micro-interactions and transitions
 */

// Haptic feedback wrapper
export const haptic = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

// Fade in animation hook
export function useFadeIn(
  initialValue = 0,
  finalValue = 1,
  duration = durations.normal,
  delay = 0,
  easing = easings.default
) {
  const opacity = useRef(new Animated.Value(initialValue)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: finalValue,
      duration,
      delay,
      easing,
      useNativeDriver: true,
    }).start();
  }, [opacity, finalValue, duration, delay, easing]);

  return opacity;
}

// Slide in animation hook
export function useSlideIn(
  direction: 'left' | 'right' | 'top' | 'bottom' = 'bottom',
  distance = 100,
  duration = durations.normal,
  delay = 0,
  easing = easings.default
) {
  const translateX = useRef(new Animated.Value(direction === 'right' ? distance : direction === 'left' ? -distance : 0)).current;
  const translateY = useRef(new Animated.Value(direction === 'bottom' ? distance : direction === 'top' ? -distance : 0)).current;

  useEffect(() => {
    Animated.timing(direction === 'left' || direction === 'right' ? translateX : translateY, {
      toValue: 0,
      duration,
      delay,
      easing,
      useNativeDriver: true,
    }).start();
  }, [translateX, translateY, direction, duration, delay, easing]);

  return {
    transform: [
      { translateX: direction === 'left' || direction === 'right' ? translateX : 0 },
      { translateY: direction === 'top' || direction === 'bottom' ? translateY : 0 },
    ],
  };
}

// Scale animation hook
export function useScale(
  initialValue = 0,
  finalValue = 1,
  duration = durations.normal,
  delay = 0,
  easing = easings.default
) {
  const scale = useRef(new Animated.Value(initialValue)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: finalValue,
      duration,
      delay,
      easing,
      useNativeDriver: true,
    }).start();
  }, [scale, finalValue, duration, delay, easing]);

  return { transform: [{ scale }] };
}

// Staggered animation for lists
export function useStaggeredAnimation(
  itemCount: number,
  animationType: 'fade' | 'slide' | 'scale' = 'fade',
  staggerDelay = 50,
  itemDuration = durations.normal,
  initialDelay = 0,
  direction: 'left' | 'right' | 'top' | 'bottom' = 'bottom'
) {
  const animations = Array.from({ length: itemCount }).map((_, i) => {
    const delay = initialDelay + i * staggerDelay;
    
    switch (animationType) {
      case 'fade':
        return useFadeIn(0, 1, itemDuration, delay);
      case 'slide':
        return useSlideIn(direction, 50, itemDuration, delay);
      case 'scale':
        return useScale(0.8, 1, itemDuration, delay);
      default:
        return useFadeIn(0, 1, itemDuration, delay);
    }
  });

  return animations;
}

// Pulse animation component
interface PulseProps {
  size?: number;
  color?: string;
  duration?: number;
  maxScale?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const Pulse = ({ 
  size = 100, 
  color = 'rgba(123, 92, 255, 0.2)', 
  duration = 1500, 
  maxScale = 1.2,
  style,
  children
}: PulseProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: maxScale,
            duration: duration / 2,
            easing: easings.easeOut,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: duration / 2,
            easing: easings.easeIn,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: duration / 2,
            easing: easings.easeOut,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration / 2,
            easing: easings.easeIn,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    
    animation.start();
    
    return () => {
      animation.stop();
    };
  }, [scale, opacity, duration, maxScale]);
  
  return (
    <View style={[{ position: 'relative' }, style]}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale }],
          opacity,
        }}
      />
      {children}
    </View>
  );
};

// Fade transition component
interface FadeProps {
  visible: boolean;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Fade = ({ visible, duration = durations.normal, style, children }: FadeProps) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity, duration]);
  
  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
};

// Slide transition component
interface SlideProps {
  visible: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Slide = ({ 
  visible, 
  direction = 'bottom', 
  distance = 50,
  duration = durations.normal,
  style, 
  children 
}: SlideProps) => {
  const [mounted, setMounted] = useState(visible);
  const translateX = useRef(new Animated.Value(direction === 'right' ? distance : direction === 'left' ? -distance : 0)).current;
  const translateY = useRef(new Animated.Value(direction === 'bottom' ? distance : direction === 'top' ? -distance : 0)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  
  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
    
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(direction === 'left' || direction === 'right' ? translateX : translateY, {
        toValue: visible ? 0 : direction === 'right' ? distance : direction === 'left' ? -distance : direction === 'bottom' ? distance : -distance,
        duration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!visible) {
        setMounted(false);
      }
    });
  }, [visible, opacity, translateX, translateY, direction, distance, duration]);
  
  if (!mounted) return null;
  
  return (
    <Animated.View 
      style={[
        { 
          opacity,
          transform: [
            { translateX: direction === 'left' || direction === 'right' ? translateX : 0 },
            { translateY: direction === 'top' || direction === 'bottom' ? translateY : 0 },
          ]
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default {
  durations,
  easings,
  haptic,
  useFadeIn,
  useSlideIn,
  useScale,
  useStaggeredAnimation,
  Pulse,
  Fade,
  Slide,
};
