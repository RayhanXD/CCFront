import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/theme-context';
import { createThemedStyles, conditionalStyle } from '@/utils/theme-utils';

interface ThemedCardProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function ThemedCard({
  title,
  subtitle,
  onPress,
  children,
  style,
  disabled = false,
}: ThemedCardProps) {
  const { theme, isDarkMode } = useTheme();
  
  const styles = getStyles(theme, isDarkMode);
  
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={[
        styles.card,
        conditionalStyle(disabled, styles.disabledCard),
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      
      {children}
    </CardComponent>
  );
}

// Create themed styles using our utility
const getStyles = createThemedStyles((theme, isDarkMode) => 
  StyleSheet.create({
    card: {
      backgroundColor: theme.white,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    disabledCard: {
      opacity: 0.6,
    },
    header: {
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
  })
);
