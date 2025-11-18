import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useTheme } from '@/contexts/theme-context';
import { useUserStore } from '@/store/user-store';

interface LoadingScreenProps {
  visible: boolean;
  onComplete: () => void;
  steps?: string[];
}

export default function LoadingScreen({ visible, onComplete, steps = [] }: LoadingScreenProps) {
  const { theme } = useTheme();
  const { currentLoadingStep } = useUserStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    // Auto-complete when all steps are done
    if (visible && steps.length > 0 && currentLoadingStep >= steps.length - 1) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [visible, steps, currentLoadingStep, onComplete]);

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: theme.background + 'F0' }]}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: theme.cardBackground },
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.iconText, { color: theme.primary }]}>CC</Text>
          </View>

          {/* Loading Spinner */}
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={styles.spinner}
          />

          {/* Loading Text */}
          <Text style={[styles.title, { color: theme.text }]}>
            Setting up your profile...
          </Text>

          {/* Current Step */}
          {steps.length > 0 && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                {steps[currentLoadingStep] || 'Loading...'}
              </Text>
              
              {/* Progress Bar */}
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: theme.primary },
                    { width: `${((currentLoadingStep + 1) / steps.length) * 100}%` },
                  ]}
                />
              </View>
              
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {currentLoadingStep + 1} of {steps.length}
              </Text>
            </View>
          )}

          {/* Tip */}
          <Text style={[styles.tip, { color: theme.textSecondary }]}>
            This may take a few moments...
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    borderRadius: 20,
    padding: 40,
    margin: 20,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  spinner: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    minHeight: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
  tip: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
