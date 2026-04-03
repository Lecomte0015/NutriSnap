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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/colors';
import { Button, MascotAnimated } from '../../src/components';
import { SocialProof } from '../../src/components';
import i18n from '../../src/i18n';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Scanne tes repas',
    description: 'Prends une photo et obtiens une analyse nutritionnelle complete en 2 secondes',
    mascotMood: 'happy' as const,
    icon: 'camera',
  },
  {
    id: 2,
    title: 'Atteins tes objectifs',
    description: 'Suis ta progression, gagne des badges et reste motive chaque jour',
    mascotMood: 'excited' as const,
    icon: 'trophy',
  },
  {
    id: 3,
    title: 'Coach IA personnel',
    description: 'Recois des conseils personnalises et des suggestions de repas equilibres',
    mascotMood: 'happy' as const,
    icon: 'chatbubbles',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = i18n.t.bind(i18n);

  // Animations
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const mascotScale = useSharedValue(0.5);
  const buttonsOpacity = useSharedValue(0);
  const socialProofOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered animations on mount
    mascotScale.value = withSpring(1, { damping: 12 });
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(300, withSpring(0, { damping: 15 }));
    socialProofOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, []);

  // Auto-scroll carousel
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

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const socialProofAnimatedStyle = useAnimatedStyle(() => ({
    opacity: socialProofOpacity.value,
  }));

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.background, '#d4edec', COLORS.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header with logo */}
        <View style={styles.header}>
          <Text style={styles.logoText}>NutriSnap</Text>
        </View>

        {/* Mascot */}
        <Animated.View style={[styles.mascotContainer, mascotAnimatedStyle]}>
          <MascotAnimated mood={SLIDES[currentSlide].mascotMood} size={180} />
        </Animated.View>

        {/* Carousel */}
        <View style={styles.carouselContainer}>
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
                <Animated.View style={titleAnimatedStyle}>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideDescription}>{slide.description}</Text>
                </Animated.View>
              </View>
            ))}
          </ScrollView>

          {/* Pagination dots */}
          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentSlide && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Social Proof */}
        <Animated.View style={socialProofAnimatedStyle}>
          <SocialProof 
            userCount={12847} 
            mealsAnalyzed={284650} 
            averageRating={4.8} 
          />
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttonsContainer, buttonsAnimatedStyle]}>
          <Button
            title="Commencer"
            onPress={() => router.push('/(auth)/register')}
            style={styles.primaryButton}
          />
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryButtonText}>
              Deja un compte ? Se connecter
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  carouselContainer: {
    height: 140,
  },
  slide: {
    width: width,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  slideDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.secondary,
    width: 24,
  },
  buttonsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    marginTop: 'auto',
  },
  primaryButton: {
    marginBottom: SPACING.md,
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
});
