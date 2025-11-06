import { Animated, Platform, Easing } from 'react-native';

/**
 * Animation utility functions for optimized animations
 * Handles platform-specific optimizations and provides consistent API
 */

// Duration presets
export const durations = {
  veryFast: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Easing presets
export const easings = {
  default: Easing.inOut(Easing.ease),
  linear: Easing.linear,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  elastic: Easing.elastic(1),
  bounce: Easing.bounce,
};

interface AnimationConfig {
  useNativeDriver?: boolean;
  duration?: number;
  easing?: (value: number) => number;
  delay?: number;
}

/**
 * Create a generic timing animation with consistent defaults
 * @param value Animated value to animate
 * @param toValue Target value
 * @param config Animation configuration
 * @returns Animated.CompositeAnimation
 */
export const createTimingAnimation = (
  value: Animated.Value,
  toValue: number,
  config?: AnimationConfig
): Animated.CompositeAnimation => {
  const { 
    useNativeDriver = Platform.OS !== 'web', 
    duration = durations.normal, 
    easing = easings.default,
    delay = 0
  } = config || {};
  
  return Animated.timing(value, {
    toValue,
    duration,
    easing,
    delay,
    useNativeDriver,
  });
};

/**
 * Create a fade animation
 * @param value Animated value to animate
 * @param toValue Target value (0 to 1)
 * @param config Animation configuration
 * @returns Animated.CompositeAnimation
 */
export const createFadeAnimation = (
  value: Animated.Value,
  toValue: number,
  config?: AnimationConfig
): Animated.CompositeAnimation => {
  return createTimingAnimation(value, toValue, config);
};

/**
 * Create a scale animation
 * @param value Animated value to animate
 * @param toValue Target value
 * @param config Animation configuration
 * @returns Animated.CompositeAnimation
 */
export const createScaleAnimation = (
  value: Animated.Value,
  toValue: number,
  config?: AnimationConfig
): Animated.CompositeAnimation => {
  return createTimingAnimation(value, toValue, config);
};

/**
 * Create a spring animation
 * @param value Animated value to animate
 * @param toValue Target value
 * @param config Spring configuration
 * @returns Animated.CompositeAnimation
 */
export const createSpringAnimation = (
  value: Animated.Value,
  toValue: number,
  config?: {
    useNativeDriver?: boolean;
    friction?: number;
    tension?: number;
    speed?: number;
    bounciness?: number;
    delay?: number;
  }
): Animated.CompositeAnimation => {
  const { 
    useNativeDriver = Platform.OS !== 'web', 
    friction,
    tension,
    speed,
    bounciness,
    delay = 0
  } = config || {};
  
  // React Native only allows one configuration set:
  // Either tension/friction OR speed/bounciness, not both
  const springConfig: any = {
    toValue,
    delay,
    useNativeDriver,
  };
  
  // Use speed/bounciness if provided, otherwise use tension/friction
  if (speed !== undefined || bounciness !== undefined) {
    if (speed !== undefined) springConfig.speed = speed;
    if (bounciness !== undefined) springConfig.bounciness = bounciness;
  } else {
    // Default to tension/friction (most common)
    springConfig.friction = friction ?? 7;
    springConfig.tension = tension ?? 40;
  }
  
  return Animated.spring(value, springConfig);
};

/**
 * Create a sequence of animations
 * @param animations Array of animations to run in sequence
 * @returns Animated.CompositeAnimation
 */
export const createSequence = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

/**
 * Create a parallel animation
 * @param animations Array of animations to run in parallel
 * @returns Animated.CompositeAnimation
 */
export const createParallel = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.parallel(animations);
};

/**
 * Create a loop animation
 * @param animation Animation to loop
 * @param iterations Number of iterations (default: -1 for infinite)
 * @returns Animated.CompositeAnimation
 */
export const createLoop = (
  animation: Animated.CompositeAnimation,
  iterations: number = -1
): Animated.CompositeAnimation => {
  return Animated.loop(animation, { iterations });
};

/**
 * Create a stagger animation
 * @param animations Array of animations to stagger
 * @param staggerDelay Delay between each animation
 * @returns Animated.CompositeAnimation
 */
export const createStagger = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 100
): Animated.CompositeAnimation => {
  return Animated.stagger(staggerDelay, animations);
};

/**
 * Optimized animation presets
 */
export const AnimationPresets = {
  /**
   * Fade in animation
   * @param value Animated value
   * @param duration Duration in ms
   * @returns Animated.CompositeAnimation
   */
  fadeIn: (value: Animated.Value, duration: number = durations.normal) => 
    createFadeAnimation(value, 1, { duration }),
  
  /**
   * Fade out animation
   * @param value Animated value
   * @param duration Duration in ms
   * @returns Animated.CompositeAnimation
   */
  fadeOut: (value: Animated.Value, duration: number = durations.normal) => 
    createFadeAnimation(value, 0, { duration }),
  
  /**
   * Scale in animation
   * @param value Animated value
   * @param duration Duration in ms
   * @returns Animated.CompositeAnimation
   */
  scaleIn: (value: Animated.Value, duration: number = durations.normal) => 
    createScaleAnimation(value, 1, { duration }),
  
  /**
   * Scale out animation
   * @param value Animated value
   * @param duration Duration in ms
   * @returns Animated.CompositeAnimation
   */
  scaleOut: (value: Animated.Value, duration: number = durations.normal) => 
    createScaleAnimation(value, 0, { duration }),
  
  /**
   * Bounce animation
   * @param value Animated value
   * @returns Animated.CompositeAnimation
   */
  bounce: (value: Animated.Value) => 
    createSpringAnimation(value, 1, { bounciness: 12 }),
  
  /**
   * Pulse animation
   * @param value Animated value
   * @returns Animated.CompositeAnimation
   */
  pulse: (value: Animated.Value) => 
    createLoop(
      createSequence([
        createScaleAnimation(value, 1.1, { duration: durations.normal }),
        createScaleAnimation(value, 1, { duration: durations.normal })
      ])
    ),
};
