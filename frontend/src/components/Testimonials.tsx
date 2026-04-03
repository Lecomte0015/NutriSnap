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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/colors';
import { TESTIMONIALS, Testimonial } from '../types/gamification';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 60;

interface TestimonialsProps {
  autoPlay?: boolean;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ autoPlay = true }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

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
    <View key={testimonial.id} style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: testimonial.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{testimonial.name}</Text>
          <View style={styles.starsContainer}>{renderStars(testimonial.rating)}</View>
        </View>
        {testimonial.weightLost && (
          <View style={styles.resultBadge}>
            <Text style={styles.resultText}>-{testimonial.weightLost}kg</Text>
          </View>
        )}
      </View>
      <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
      {testimonial.duration && (
        <Text style={styles.duration}>En {testimonial.duration}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ce qu'ils en pensent</Text>
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
              index === currentIndex && styles.paginationDotActive,
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
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBackground,
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
    color: COLORS.textPrimary,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  resultBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  resultText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
    fontSize: 14,
  },
  testimonialText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  duration: {
    fontSize: 13,
    color: COLORS.secondary,
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
    backgroundColor: COLORS.textLight,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.secondary,
    width: 20,
  },
});

export default Testimonials;
