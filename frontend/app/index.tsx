import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, SPACING } from '../src/constants/colors';
import { useStore } from '../src/store/useStore';
import { Mascot } from '../src/components';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading, onboardingCompleted } = useStore();
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);
  const mascotOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate in
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 800 });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    mascotOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));

    // Navigate after animation
    const timer = setTimeout(() => {
      navigateToNext();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const navigateToNext = () => {
    if (isLoading) {
      // Still loading, wait a bit more
      setTimeout(navigateToNext, 500);
      return;
    }

    if (!user) {
      router.replace('/(auth)/login');
    } else if (!onboardingCompleted) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: mascotOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>N</Text>
        </View>
      </Animated.View>
      
      <Animated.Text style={[styles.appName, textAnimatedStyle]}>
        NutriSnap
      </Animated.Text>
      
      <Animated.Text style={[styles.tagline, textAnimatedStyle]}>
        Votre coach nutrition personnel
      </Animated.Text>
      
      <Animated.View style={[styles.mascotContainer, mascotAnimatedStyle]}>
        <Mascot mood="happy" size={100} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
  mascotContainer: {
    position: 'absolute',
    bottom: 100,
  },
});
