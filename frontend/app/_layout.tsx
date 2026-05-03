import React, { useEffect, useState, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { supabase } from '../src/lib/supabase';
import { useStore } from '../src/store/useStore';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import i18n from '../src/i18n';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}

function RootLayoutInner() {
  const [isReady, setIsReady] = useState(false);
  const { isDark, colors } = useTheme();
  const { user, setUser, setProfile, setOnboardingCompleted, setLoading, setLanguage, language } = useStore();
  const router = useRouter();
  const segments = useSegments();
  const notificationListenerRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    notificationListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const type = response.notification.request.content.data?.type;
        if (type === 'meal_reminder' || type === 'streak_alert') {
          router.push('/camera');
        } else if (type === 'daily_motivation') {
          router.push('/(tabs)');
        } else if (type === 'achievement') {
          router.push('/achievements');
        }
      }
    );

    return () => {
      notificationListenerRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    // Check initial auth state
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at || new Date().toISOString(),
        });
        
        // Check if profile exists
        await checkProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setOnboardingCompleted(false);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at || new Date().toISOString(),
        });
        
        await checkProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
      setIsReady(true);
    }
  };

  const checkProfile = async (userId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/profiles/${userId}`
      );
      
      if (response.ok) {
        const profile = await response.json();
        setProfile(profile);
        setOnboardingCompleted(true);
        
        // Use profile language only if no local preference saved yet
        if (profile.language && !language) {
          i18n.locale = profile.language;
          setLanguage(profile.language);
        }
      } else {
        setOnboardingCompleted(false);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setOnboardingCompleted(false);
    }
  };

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Defer navigation to avoid removeChild crash in React concurrent mode
    const timer = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/welcome');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [user, segments, isReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {!isReady ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.secondary} />
          </View>
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="camera" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="result" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
