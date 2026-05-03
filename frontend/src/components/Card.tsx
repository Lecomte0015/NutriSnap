import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { SHADOWS, BORDER_RADIUS, SPACING } from '../constants/colors';
import { useColors } from '../hooks/useColors';

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
  const COLORS = useColors();

  const paddingMap = { none: 0, small: SPACING.sm, medium: SPACING.md, large: SPACING.lg };

  return (
    <View style={[
      {
        backgroundColor: COLORS.cardBackground,
        borderRadius: BORDER_RADIUS.md,
        padding: paddingMap[padding],
        ...SHADOWS.small,
      },
      style,
    ]}>
      {title && (
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: COLORS.textPrimary,
          marginBottom: SPACING.sm,
        }}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

export default Card;
