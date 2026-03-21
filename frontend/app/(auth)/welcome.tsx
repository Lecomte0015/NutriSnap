import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
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
import { Button, Mascot } from '../../src/components';
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
          <Mascot mood="excited" size={200} />
        </Animated.View>
      </View>

      {/* Content section */}
      <Animated.View style={[styles.contentSection, contentAnimatedStyle]}>
        {/* Logo and title */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>N</Text>
          </View>
        </View>
        
        <Text style={styles.appName}>NutriSnap</Text>
        <Text style={styles.tagline}>{t('auth.subtitle')}</Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📸</Text>
            </View>
            <Text style={styles.featureText}>Scannez vos repas</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🤖</Text>
            </View>
            <Text style={styles.featureText}>Analyse IA instantanée</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>💪</Text>
            </View>
            <Text style={styles.featureText}>Coaching personnalisé</Text>
          </View>
        </View>

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
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSection: {
    flex: 0.6,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: SPACING.sm,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 90,
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
    marginTop: SPACING.lg,
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
