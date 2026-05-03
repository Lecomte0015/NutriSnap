import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, BORDER_RADIUS } from '../constants/colors';
import { useColors } from '../hooks/useColors';
import { useTranslation } from '../hooks/useTranslation';
import { UserLevel, USER_LEVELS } from '../types/gamification';

interface LevelProgressProps {
  currentXp: number;
  showDetails?: boolean;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  currentXp,
  showDetails = true,
}) => {
  const COLORS = useColors();
  const t = useTranslation();

  const currentLevel = USER_LEVELS.find(
    (level) => currentXp >= level.minXp && currentXp < level.maxXp
  ) || USER_LEVELS[0];

  const nextLevel = USER_LEVELS.find((l) => l.level === currentLevel.level + 1);
  const progressInLevel = currentXp - currentLevel.minXp;
  const levelRange = currentLevel.maxXp - currentLevel.minXp;
  const progressPercent = Math.min((progressInLevel / levelRange) * 100, 100);
  const xpToNext = nextLevel ? nextLevel.minXp - currentXp : 0;

  const levelName = t(`levels.${currentLevel.name}` as any);
  const nextLevelName = nextLevel ? t(`levels.${nextLevel.name}` as any) : '';

  return (
    <View style={[styles.container, { backgroundColor: COLORS.cardBackground }]}>
      <View style={styles.header}>
        <View style={[styles.levelBadge, { backgroundColor: COLORS.background }]}>
          <Text style={styles.levelIcon}>{currentLevel.icon}</Text>
          <Text style={[styles.levelNumber, { color: COLORS.textPrimary }]}>{t('levels.level')} {currentLevel.level}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={[styles.levelName, { color: currentLevel.color }]}>{levelName}</Text>
          {showDetails && nextLevel && (
            <Text style={[styles.xpText, { color: COLORS.textSecondary }]}>
              {t('levels.xpBefore', { count: xpToNext, name: nextLevelName })}
            </Text>
          )}
        </View>
        <Text style={[styles.totalXp, { color: COLORS.secondary }]}>{currentXp} XP</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBackground, { backgroundColor: COLORS.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%`, backgroundColor: currentLevel.color },
            ]}
          />
        </View>
      </View>

      {showDetails && (
        <View style={styles.xpRange}>
          <Text style={[styles.xpRangeText, { color: COLORS.textLight }]}>{currentLevel.minXp}</Text>
          <Text style={[styles.xpRangeText, { color: COLORS.textLight }]}>{currentLevel.maxXp}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  },
  totalXp: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: SPACING.xs,
  },
  progressBackground: {
    height: 8,
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
  },
});

export default LevelProgress;
