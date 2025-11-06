import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/theme-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

interface ThemedHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
}

/**
 * A consistent header component with theme support
 * Used across the app for navigation headers
 */
export default function ThemedHeader({
  title,
  showBackButton = true,
  onBackPress,
  rightComponent,
  containerStyle,
  titleStyle,
  backgroundColor
}: ThemedHeaderProps) {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: backgroundColor || theme.cardBackground,
          borderBottomColor: theme.border,
          shadowColor: theme.shadow,
          shadowOpacity: isDarkMode ? 0.4 : 0.1,
          elevation: isDarkMode ? 4 : 2
        },
        containerStyle
      ]}
    >
      {showBackButton && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
      )}
      
      <Text 
        style={[
          styles.title, 
          { color: theme.text },
          titleStyle
        ]} 
        numberOfLines={1}
      >
        {title}
      </Text>
      
      <View style={styles.rightContainer}>
        {rightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
