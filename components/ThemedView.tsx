import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

// Themed View component
export const ThemedView: React.FC<{
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}> = ({ style, children }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[{ backgroundColor: theme.background }, style]}>
      {children}
    </View>
  );
};

// Themed Card component
export const ThemedCard: React.FC<{
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}> = ({ style, children }) => {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <View 
      style={[
        { 
          backgroundColor: theme.white,
          borderRadius: 16,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 2,
        }, 
        style
      ]}
    >
      {children}
    </View>
  );
};

// Themed Text component
export const ThemedText: React.FC<{
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}> = ({ style, children }) => {
  const { theme } = useTheme();
  
  return (
    <Text style={[{ color: theme.text }, style]}>
      {children}
    </Text>
  );
};

// Themed Secondary Text component
export const ThemedSecondaryText: React.FC<{
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}> = ({ style, children }) => {
  const { theme } = useTheme();
  
  return (
    <Text style={[{ color: theme.textSecondary }, style]}>
      {children}
    </Text>
  );
};

// Themed Input component
export const ThemedInput: React.FC<{
  style?: StyleProp<TextStyle>;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
}> = ({ style, placeholder, value, onChangeText, secureTextEntry, multiline }) => {
  const { theme } = useTheme();
  
  return (
    <TextInput
      style={[
        { 
          backgroundColor: theme.background,
          color: theme.text,
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: theme.border,
        }, 
        style as StyleProp<TextStyle>
      ]}
      placeholder={placeholder}
      placeholderTextColor={theme.textSecondary}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
    />
  );
};

// Themed Button component
export const ThemedButton: React.FC<{
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ style, textStyle, onPress, children, disabled }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        { 
          backgroundColor: disabled ? theme.primaryLight : theme.primary,
          borderRadius: 100,
          paddingVertical: 12,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }, 
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text 
        style={[
          { 
            color: disabled ? theme.textSecondary : '#FFFFFF',
            fontWeight: '600',
            fontSize: 16,
          }, 
          textStyle
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

// Export all themed components
export default {
  View: ThemedView,
  Card: ThemedCard,
  Text: ThemedText,
  SecondaryText: ThemedSecondaryText,
  Input: ThemedInput,
  Button: ThemedButton,
};
