import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { SPACING, BORDER_RADIUS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { useStore } from '../src/store/useStore';
import { MascotAnimated } from '../src/components';
import { useTranslation } from '../src/hooks/useTranslation';

export default function SplashScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const t = useTranslation();
  const { user, isLoading, onboardingCompleted } = useStore();

  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(16);
  const mascotOpacity = useSharedValue(0);
  const mascotTranslateY = useSharedValue(20);
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700 });
    logoScale.value = withSpring(1, { damping: 10, stiffness: 100 });

    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));

    mascotOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    mascotTranslateY.value = withDelay(700, withSpring(0, { damping: 12 }));

    // Animated loading dots
    dot1Opacity.value = withDelay(900, withRepeat(withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0.3, { duration: 400 }),
    ), -1));
    dot2Opacity.value = withDelay(1100, withRepeat(withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0.3, { duration: 400 }),
    ), -1));
    dot3Opacity.value = withDelay(1300, withRepeat(withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0.3, { duration: 400 }),
    ), -1));

    const timer = setTimeout(() => {
      navigateToNext();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const navigateToNext = () => {
    if (isLoading) {
      setTimeout(navigateToNext, 500);
      return;
    }
    if (!user) {
      router.replace('/(auth)/welcome');
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
    transform: [{ translateY: textTranslateY.value }],
  }));

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: mascotOpacity.value,
    transform: [{ translateY: mascotTranslateY.value }],
  }));

  return (
    <LinearGradient
      colors={[COLORS.secondary + '22', COLORS.background, COLORS.background] as any}
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.secondary + 'BB'] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <Text style={styles.logoEmoji}>🥗</Text>
          </LinearGradient>
        </Animated.View>

        {/* App name + tagline */}
        <Animated.View style={[styles.textBlock, textAnimatedStyle]}>
          <Text style={[styles.appName, { color: COLORS.secondary }]}>NutriSnap</Text>
          <Text style={[styles.tagline, { color: COLORS.textSecondary }]}>
            {t('welcome.tagline')}
          </Text>
        </Animated.View>

        {/* Mascot */}
        <Animated.View style={[styles.mascotContainer, mascotAnimatedStyle]}>
          <MascotAnimated mood="happy" size={120} />
        </Animated.View>
      </View>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, { backgroundColor: COLORS.secondary }, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { backgroundColor: COLORS.secondary }, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { backgroundColor: COLORS.secondary }, { opacity: dot3Opacity }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: SPACING.xxl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  logoWrapper: {
    marginBottom: SPACING.sm,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 8px 16px rgba(0,0,0,0.15)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16 },
    }),
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 52,
  },
  textBlock: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
  mascotContainer: {
    marginTop: SPACING.md,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: SPACING.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
