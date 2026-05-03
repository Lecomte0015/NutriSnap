import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';

export default function AuthLayout() {
  const COLORS = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
