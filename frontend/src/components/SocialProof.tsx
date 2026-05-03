import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS } from '../constants/colors';
import { useColors } from '../hooks/useColors';
import { useTranslation } from '../hooks/useTranslation';

interface SocialProofProps {
  userCount?: number;
  mealsAnalyzed?: number;
  averageRating?: number;
}

export const SocialProof: React.FC<SocialProofProps> = ({
  userCount = 12847,
  mealsAnalyzed = 284650,
  averageRating = 4.8,
}) => {
  const COLORS = useColors();
  const t = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: COLORS.cardBackground },
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.stat}>
        <Ionicons name="people" size={24} color={COLORS.secondary} />
        <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{formatNumber(userCount)}+</Text>
        <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>{t('socialProof.users')}</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: COLORS.border }]} />

      <View style={styles.stat}>
        <Ionicons name="camera" size={24} color={COLORS.secondary} />
        <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{formatNumber(mealsAnalyzed)}</Text>
        <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>{t('socialProof.mealsAnalyzed')}</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: COLORS.border }]} />

      <View style={styles.stat}>
        <Ionicons name="star" size={24} color="#FFD700" />
        <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{averageRating}</Text>
        <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>{t('socialProof.averageRating')}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
  },
});

export default SocialProof;
