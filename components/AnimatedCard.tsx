import React, { useRef } from 'react';
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
  style?: ViewStyle;
  activeOpacity?: number;
  scaleValue?: number;
  disabled?: boolean;
}

const AnimatedCard = ({ 
  children, 
  onPress, 
  style, 
  activeOpacity = 0.95,
  scaleValue = 0.98,
  disabled = false
}: AnimatedCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    if (disabled) return;
    
    if (Platform.OS === 'web') {
      // For web, use JS-driven animations
      Animated.spring(scaleAnim, {
        toValue: scaleValue,
        useNativeDriver: false,
        speed: 20,
        bounciness: 4,
      }).start();
    } else {
      // For native, use native driver
      Animated.spring(scaleAnim, {
        toValue: scaleValue,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }).start();
    }
  };
  
  const handlePressOut = () => {
    if (disabled) return;
    
    if (Platform.OS === 'web') {
      // For web, use JS-driven animations
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        speed: 20,
        bounciness: 4,
      }).start();
    } else {
      // For native, use native driver
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }).start();
    }
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={activeOpacity}
    >
      <Animated.View 
        style={[
          styles.container,
          style,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
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

export default AnimatedCard;