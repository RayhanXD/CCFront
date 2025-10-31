import React from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/theme-context';
import { useRouter } from 'expo-router';

export default function ProfileLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  
  // Custom back button component
  const BackButton = () => (
    <TouchableOpacity 
      onPress={() => router.back()}
      style={{ marginLeft: 8, padding: 8 }}
    >
      <ArrowLeft size={24} color={theme?.text || '#1A1A1A'} />
    </TouchableOpacity>
  );
  
  return (
    <Stack>
      <Stack.Screen 
        name="saved" 
        options={{ 
          headerShown: true,
          title: 'Saved Items',
          headerLeft: () => <BackButton />
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{
          headerShown: true,
          title: 'Edit Profile',
          presentation: 'modal',
          headerLeft: () => <BackButton />
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{
          headerShown: true,
          title: 'Settings',
          headerLeft: () => <BackButton />
        }} 
      />
      <Stack.Screen 
        name="about" 
        options={{
          headerShown: true,
          title: 'About Us',
          headerLeft: () => <BackButton />
        }} 
      />
    </Stack>
  );
}