import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SPACING, BORDER_RADIUS } from '../constants/colors';
import { useColors } from '../hooks/useColors';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  color?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  totalSteps,
  color,
}) => {
  const COLORS = useColors();
  const activeColor = color ?? COLORS.secondary;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: COLORS.border }]}>
        <View style={[styles.fill, { width: `${progress}%`, backgroundColor: activeColor }]} />
      </View>
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep - 1;

          return (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: COLORS.border, borderColor: 'transparent' },
                isCompleted && { backgroundColor: activeColor },
                isCurrent && { backgroundColor: COLORS.cardBackground, borderColor: activeColor, borderWidth: 3, width: 14, height: 14, borderRadius: 7, marginTop: -1 },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
    paddingHorizontal: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});

export default ProgressSteps;
