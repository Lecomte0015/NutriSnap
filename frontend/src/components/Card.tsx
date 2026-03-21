import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/colors';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  style,
  padding = 'medium',
}) => {
  const paddingStyles = {
    none: 0,
    small: SPACING.sm,
    medium: SPACING.md,
    large: SPACING.lg,
  };

  return (
    <View style={[styles.card, { padding: paddingStyles[padding] }, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
});

export default Card;
