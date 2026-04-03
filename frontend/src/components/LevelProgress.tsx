import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/colors';
import { UserLevel, USER_LEVELS } from '../types/gamification';

interface LevelProgressProps {
  currentXp: number;
  showDetails?: boolean;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  currentXp,
  showDetails = true,
}) => {
  // Find current level
  const currentLevel = USER_LEVELS.find(
    (level) => currentXp >= level.minXp && currentXp < level.maxXp
  ) || USER_LEVELS[0];

  const nextLevel = USER_LEVELS.find((l) => l.level === currentLevel.level + 1);

  const progressInLevel = currentXp - currentLevel.minXp;
  const levelRange = currentLevel.maxXp - currentLevel.minXp;
  const progressPercent = Math.min((progressInLevel / levelRange) * 100, 100);

  const xpToNext = nextLevel ? nextLevel.minXp - currentXp : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelIcon}>{currentLevel.icon}</Text>
          <Text style={styles.levelNumber}>Niv. {currentLevel.level}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={[styles.levelName, { color: currentLevel.color }]}>
            {currentLevel.name}
          </Text>
          {showDetails && nextLevel && (
            <Text style={styles.xpText}>
              {xpToNext} XP avant {nextLevel.name}
            </Text>
          )}
        </View>
        <Text style={styles.totalXp}>{currentXp} XP</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: currentLevel.color,
              },
            ]}
          />
        </View>
      </View>

      {showDetails && (
        <View style={styles.xpRange}>
          <Text style={styles.xpRangeText}>{currentLevel.minXp}</Text>
          <Text style={styles.xpRangeText}>{currentLevel.maxXp}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  levelIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  levelNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  levelInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
  },
  xpText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  totalXp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  progressContainer: {
    marginTop: SPACING.xs,
  },
  progressBackground: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  xpRangeText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
});

export default LevelProgress;
