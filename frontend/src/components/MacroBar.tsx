import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING } from '../constants/colors';
import { useColors } from '../hooks/useColors';
import { useTranslation } from '../hooks/useTranslation';

interface MacroBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color: string;
}

export const MacroBar: React.FC<MacroBarProps> = ({
  label,
  value,
  max,
  unit = 'g',
  color,
}) => {
  const COLORS = useColors();
  useTranslation();
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: COLORS.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: COLORS.textPrimary }]}>
          {value}<Text style={[styles.unit, { color: COLORS.textSecondary }]}>{unit}</Text>
        </Text>
      </View>
      <View style={[styles.barBackground, { backgroundColor: COLORS.border }]}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default MacroBar;
