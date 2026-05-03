import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/colors';
import { useColors } from '../hooks/useColors';
import { useTranslation } from '../hooks/useTranslation';
import { TESTIMONIALS, Testimonial } from '../types/gamification';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 60;

interface TestimonialsProps {
  autoPlay?: boolean;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ autoPlay = true }) => {
  const COLORS = useColors();
  const t = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % TESTIMONIALS.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (CARD_WIDTH + 20),
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, autoPlay]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? 'star' : 'star-outline'}
        size={16}
        color={i < rating ? '#FFD700' : COLORS.textLight}
      />
    ));
  };

  const renderTestimonial = (testimonial: Testimonial) => (
    <View key={testimonial.id} style={[styles.card, { backgroundColor: COLORS.cardBackground }]}>
      <View style={styles.header}>
        <Image source={{ uri: testimonial.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: COLORS.textPrimary }]}>{testimonial.name}</Text>
          <View style={styles.starsContainer}>{renderStars(testimonial.rating)}</View>
        </View>
        {testimonial.weightLost && (
          <View style={[styles.resultBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.resultText}>-{testimonial.weightLost}kg</Text>
          </View>
        )}
      </View>
      <Text style={[styles.testimonialText, { color: COLORS.textSecondary }]}>"{testimonial.text}"</Text>
      {testimonial.durationMonths && (
        <Text style={[styles.duration, { color: COLORS.secondary }]}>
          {t('testimonials.duration', { count: testimonial.durationMonths })}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('testimonials.title')}</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 20));
          setCurrentIndex(index);
        }}
      >
        {TESTIMONIALS.map(renderTestimonial)}
      </ScrollView>
      <View style={styles.pagination}>
        {TESTIMONIALS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: COLORS.textLight },
              index === currentIndex && { backgroundColor: COLORS.secondary, width: 20 },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginRight: 20,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  resultBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  resultText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  testimonialText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  duration: {
    fontSize: 13,
    marginTop: SPACING.sm,
    fontWeight: '500',
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
    marginHorizontal: 4,
  },
});

export default Testimonials;
