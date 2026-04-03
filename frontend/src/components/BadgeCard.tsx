import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/colors';
import { Badge } from '../types/gamification';

interface BadgeCardProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  size = 'medium',
  onPress,
}) => {
  const sizeConfig = {
    small: { container: 60, icon: 24, name: 10 },
    medium: { container: 80, icon: 32, name: 12 },
    large: { container: 100, icon: 40, name: 14 },
  };

  const config = sizeConfig[size];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: config.container,
          opacity: badge.isUnlocked ? 1 : 0.4,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={[
          styles.iconContainer,
          {
            width: config.container - 10,
            height: config.container - 10,
            backgroundColor: badge.isUnlocked ? badge.color + '20' : COLORS.border,
            borderColor: badge.isUnlocked ? badge.color : COLORS.border,
          },
        ]}
      >
        <Text style={{ fontSize: config.icon }}>{badge.icon}</Text>
        {!badge.isUnlocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>
      <Text
        style={[styles.name, { fontSize: config.name }]}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  iconContainer: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BORDER_RADIUS.lg - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 16,
  },
  name: {
    color: COLORS.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default BadgeCard;
