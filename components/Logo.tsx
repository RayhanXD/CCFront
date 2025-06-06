import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface LogoProps {
  size?: number;
  style?: ViewStyle;
  showText?: boolean;
  textColor?: string;
}

const Logo = ({ size = 70, style, showText = false, textColor }: LogoProps) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#5B6AF5', Colors.primary, '#C15AF5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
      >
        <Text style={[styles.letter, { fontSize: size * 0.6 }]}>C</Text>
      </LinearGradient>
      
      {showText && (
        <Text style={[
          styles.logoText, 
          textColor ? { color: textColor } : { color: Colors.white }
        ]}>CampusConnect</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white, // Changed from Colors.primary to Colors.white
    marginTop: 8,
  }
});

export default Logo;