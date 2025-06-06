import React from 'react';
import { Stack } from 'expo-router';

export default function DetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="scholarship/[id]" />
      <Stack.Screen name="organization/[id]" />
    </Stack>
  );
}