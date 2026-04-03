import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/colors';
import { WeeklyChallenge as ChallengeType } from '../types/gamification';

interface WeeklyChallengeProps {
  challenge: ChallengeType;
  onPress?: () => void;
}

export const WeeklyChallengeCard: React.FC<WeeklyChallengeProps> = ({
  challenge,
  onPress,
}) => {
  const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
  const isCompleted = challenge.isCompleted;

  const getIcon = () => {
    switch (challenge.type) {
      case 'meals':
        return 'restaurant';
      case 'score':
        return 'star';
      case 'streak':
        return 'flame';
      case 'calories':
        return 'fitness';
      default:
        return 'trophy';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.completed]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getIcon() as any}
          size={28}
          color={isCompleted ? COLORS.success : COLORS.secondary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{challenge.title}</Text>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>+{challenge.reward} XP</Text>
          </View>
        </View>

        <Text style={styles.description}>{challenge.description}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
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
          <Text style={styles.progressText}>
            {challenge.progress}/{challenge.target}
          </Text>
        </View>
      </View>

      {isCompleted && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  completed: {
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
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
    color: COLORS.textPrimary,
    flex: 1,
  },
  rewardBadge: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.border,
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
    color: COLORS.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  completedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
  },
});

export default WeeklyChallengeCard;
