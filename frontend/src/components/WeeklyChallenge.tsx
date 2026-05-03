import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/colors';
import { useColors } from '../hooks/useColors';
import { WeeklyChallenge as ChallengeType } from '../types/gamification';

interface WeeklyChallengeProps {
  challenge: ChallengeType;
  onPress?: () => void;
}

export const WeeklyChallengeCard: React.FC<WeeklyChallengeProps> = ({
  challenge,
  onPress,
}) => {
  const COLORS = useColors();
  const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
  const isCompleted = challenge.isCompleted;

  const getIcon = () => {
    switch (challenge.type) {
      case 'meals': return 'restaurant';
      case 'score': return 'star';
      case 'streak': return 'flame';
      case 'calories': return 'fitness';
      default: return 'trophy';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: COLORS.cardBackground },
        isCompleted && { borderColor: COLORS.success, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: COLORS.background }]}>
        <Ionicons
          name={getIcon() as any}
          size={28}
          color={isCompleted ? COLORS.success : COLORS.secondary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: COLORS.textPrimary }]}>{challenge.title}</Text>
          <View style={[styles.rewardBadge, { backgroundColor: COLORS.secondary + '20' }]}>
            <Text style={[styles.rewardText, { color: COLORS.secondary }]}>+{challenge.reward} XP</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: COLORS.textSecondary }]}>{challenge.description}</Text>

        <View style={styles.progressSection}>
          <View style={[styles.progressBar, { backgroundColor: COLORS.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: isCompleted ? COLORS.success : COLORS.secondary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: COLORS.textSecondary }]}>
            {challenge.progress}/{challenge.target}
          </Text>
        </View>
      </View>

      {isCompleted && (
        <View style={[styles.completedBadge, { backgroundColor: COLORS.cardBackground }]}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  rewardBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    marginTop: 4,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  completedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 12,
  },
});

export default WeeklyChallengeCard;
