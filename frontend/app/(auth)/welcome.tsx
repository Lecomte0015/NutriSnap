import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/colors';
import { Button, MascotAnimated } from '../../src/components';
import i18n from '../../src/i18n';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const t = i18n.t.bind(i18n);
  
  const mascotY = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  React.useEffect(() => {
    // Mascot floating animation
    mascotY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500 }),
        withTiming(10, { duration: 1500 })
      ),
      -1,
      true
    );
    
    // Fade in animation
    fadeIn.value = withDelay(300, withTiming(1, { duration: 800 }));
  }, []);

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: mascotY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.background, '#d4eeec', COLORS.background]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Top section with mascot */}
      <View style={styles.topSection}>
        <Animated.View style={[styles.mascotContainer, mascotAnimatedStyle]}>
          <MascotAnimated mood="excited" size={200} />
        </Animated.View>
      </View>

      {/* Content section */}
      <Animated.View style={[styles.contentSection, contentAnimatedStyle]}>
        {/* Title */}
        <Text style={styles.appName}>NutriSnap</Text>
        <Text style={styles.tagline}>{t('auth.subtitle')}</Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            title={t('auth.register')}
            onPress={() => router.push('/(auth)/register')}
            style={styles.primaryButton}
            size="large"
          />
          <Button
            title={t('auth.login')}
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            style={styles.secondaryButton}
            size="large"
          />
        </View>

        {/* Trial info */}
        <View style={styles.trialInfo}>
          <Text style={styles.trialText}>
            🎁 {t('subscription.trialDays')}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topSection: {
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSection: {
    flex: 0.55,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: 17,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  buttonsContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
  trialInfo: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(47, 164, 167, 0.1)',
    borderRadius: BORDER_RADIUS.round,
  },
  trialText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
});
