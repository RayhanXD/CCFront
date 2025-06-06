import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface BackToTopButtonProps {
  scrollY: Animated.Value;
  onPress: () => void;
  threshold?: number;
}

const BackToTopButton = ({ 
  scrollY, 
  onPress, 
  threshold = 200 
}: BackToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation values
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8);
  
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value > threshold && !isVisible) {
        setIsVisible(true);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          })
        ]).start();
      } else if (value <= threshold && isVisible) {
        setIsVisible(false);
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });
    
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY, threshold, isVisible]);
  
  if (Platform.OS === 'web' && !isVisible) {
    return null;
  }
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }],
          display: Platform.OS !== 'web' || isVisible ? 'flex' : 'none'
        }
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <ArrowUp size={20} color={Colors.white} />
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default BackToTopButton;