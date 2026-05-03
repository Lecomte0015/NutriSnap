import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../src/constants/colors';
import { useColors } from '../../src/hooks/useColors';
import { MascotAnimated } from '../../src/components';
import { useTranslation } from '../../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = useTranslation();

  const SLIDES = [
    {
      id: 1,
      icon: '📸',
      title: t('welcome.slide1Title'),
      description: t('welcome.slide1Desc'),
      mascotMood: 'happy' as const,
    },
    {
      id: 2,
      icon: '🏆',
      title: t('welcome.slide2Title'),
      description: t('welcome.slide2Desc'),
      mascotMood: 'excited' as const,
    },
    {
      id: 3,
      icon: '🤖',
      title: t('welcome.slide3Title'),
      description: t('welcome.slide3Desc'),
      mascotMood: 'happy' as const,
    },
  ];

  const FEATURES = [
    { icon: '⚡', label: t('welcome.featureFast') },
    { icon: '🎯', label: t('welcome.featureAccurate') },
    { icon: '🔒', label: t('welcome.featureFree') },
  ];

  const mascotScale = useSharedValue(0.5);
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(20);

  useEffect(() => {
    mascotScale.value = withSpring(1, { damping: 12 });
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, { damping: 15 });
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    contentTranslateY.value = withDelay(300, withSpring(0, { damping: 15 }));
    buttonsOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    buttonsTranslateY.value = withDelay(600, withSpring(0, { damping: 15 }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % SLIDES.length;
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
      setCurrentSlide(nextSlide);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentSlide) setCurrentSlide(slideIndex);
  };

  return (
    <LinearGradient
      colors={[COLORS.secondary + '18', COLORS.background, COLORS.secondary + '10'] as any}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>

        {/* Header — Logo + Tagline */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.logoRow}>
            <Text style={styles.logoEmoji}>🥗</Text>
            <Text style={[styles.logoText, { color: COLORS.secondary }]}>NutriSnap</Text>
          </View>
          <Text style={[styles.tagline, { color: COLORS.textSecondary }]}>{t('welcome.tagline')}</Text>
        </Animated.View>

        {/* Mascot */}
        <Animated.View style={[styles.mascotContainer, mascotAnimatedStyle]}>
          <MascotAnimated mood={SLIDES[currentSlide].mascotMood} size={160} />
        </Animated.View>

        {/* Feature Pills */}
        <Animated.View style={[styles.featuresRow, contentAnimatedStyle]}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featurePill, { backgroundColor: COLORS.secondary + '18', borderColor: COLORS.secondary + '30' }]}>
              <Text style={styles.featurePillIcon}>{f.icon}</Text>
              <Text style={[styles.featurePillLabel, { color: COLORS.secondary }]}>{f.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Carousel */}
        <Animated.View style={[styles.carouselContainer, contentAnimatedStyle]}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
          >
            {SLIDES.map((slide) => (
              <View key={slide.id} style={styles.slide}>
                <Text style={styles.slideIcon}>{slide.icon}</Text>
                <Text style={[styles.slideTitle, { color: COLORS.textPrimary }]}>{slide.title}</Text>
                <Text style={[styles.slideDescription, { color: COLORS.textSecondary }]}>{slide.description}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { backgroundColor: COLORS.border },
                  index === currentSlide && { backgroundColor: COLORS.secondary, width: 28 },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Social Proof Strip */}
        <Animated.View style={[styles.socialStrip, contentAnimatedStyle, { borderColor: COLORS.border }]}>
          <View style={styles.socialItem}>
            <Text style={[styles.socialValue, { color: COLORS.textPrimary }]}>12k+</Text>
            <Text style={[styles.socialLabel, { color: COLORS.textSecondary }]}>{t('socialProof.users')}</Text>
          </View>
          <View style={[styles.socialDivider, { backgroundColor: COLORS.border }]} />
          <View style={styles.socialItem}>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(i => (
                <Ionicons key={i} name={i <= 4 ? 'star' : 'star-half'} size={14} color="#FFD700" />
              ))}
            </View>
            <Text style={[styles.socialLabel, { color: COLORS.textSecondary }]}>4.8 / 5</Text>
          </View>
          <View style={[styles.socialDivider, { backgroundColor: COLORS.border }]} />
          <View style={styles.socialItem}>
            <Text style={[styles.socialValue, { color: COLORS.textPrimary }]}>284k</Text>
            <Text style={[styles.socialLabel, { color: COLORS.textSecondary }]}>{t('welcome.mealsAnalyzed')}</Text>
          </View>
        </Animated.View>

        {/* CTA Buttons */}
        <Animated.View style={[styles.buttonsContainer, buttonsAnimatedStyle]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.secondary + 'CC'] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>{t('welcome.getStarted')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: COLORS.textSecondary }]}>
              {t('welcome.alreadyAccount')}{' '}
              <Text style={[styles.secondaryButtonLink, { color: COLORS.secondary }]}>
                {t('welcome.signIn')}
              </Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  logoEmoji: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  mascotContainer: {
    alignItems: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    gap: 4,
  },
  featurePillIcon: {
    fontSize: 13,
  },
  featurePillLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  carouselContainer: {
    height: 150,
  },
  slide: {
    width,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  slideDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  socialStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  socialItem: {
    alignItems: 'center',
    flex: 1,
  },
  socialValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  socialLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  socialDivider: {
    width: 1,
    height: 32,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  buttonsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
    marginBottom: SPACING.sm,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
  },
  secondaryButtonLink: {
    fontWeight: '700',
  },
});
