import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/colors';
import { Meal } from '../types';
import { format } from 'date-fns';
import { fr, de, it } from 'date-fns/locale';
import i18n from '../i18n';

const locales = { fr, de, it };

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onPress }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return COLORS.scoreExcellent;
    if (score >= 6) return COLORS.scoreGood;
    if (score >= 4) return COLORS.scoreAverage;
    return COLORS.scorePoor;
  };

  const locale = locales[i18n.locale as keyof typeof locales] || fr;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {meal.image_base64 ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${meal.image_base64}` }}
          style={styles.image}
        />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Ionicons name="restaurant" size={24} color={COLORS.textLight} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.foods} numberOfLines={1}>
            {meal.foods?.join(', ') || 'Repas'}
          </Text>
          <View style={[styles.scoreContainer, { backgroundColor: getScoreColor(meal.score) }]}>
            <Text style={styles.score}>{meal.score}/10</Text>
          </View>
        </View>
        <Text style={styles.time}>
          {format(new Date(meal.created_at), 'HH:mm', { locale })}
        </Text>
        <View style={styles.macros}>
          <Text style={styles.macroText}>
            <Text style={styles.macroValue}>{meal.calories}</Text> kcal
          </Text>
          <Text style={styles.macroDivider}>|</Text>
          <Text style={styles.macroText}>
            P: <Text style={styles.macroValue}>{meal.protein}g</Text>
          </Text>
          <Text style={styles.macroDivider}>|</Text>
          <Text style={styles.macroText}>
            C: <Text style={styles.macroValue}>{meal.carbs}g</Text>
          </Text>
          <Text style={styles.macroDivider}>|</Text>
          <Text style={styles.macroText}>
            F: <Text style={styles.macroValue}>{meal.fat}g</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.sm,
  },
  placeholderImage: {
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: SPACING.sm,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foods: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  scoreContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  score: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  time: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  macros: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  macroText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  macroValue: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  macroDivider: {
    fontSize: 12,
    color: COLORS.textLight,
    marginHorizontal: SPACING.xs,
  },
});

export default MealCard;
