import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/colors';

const { width } = Dimensions.get('window');

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  color?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  totalSteps,
  color = COLORS.secondary,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: `${progress}%`,
              backgroundColor: color,
            },
          ]}
        />
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
                isCompleted && { backgroundColor: color },
                isCurrent && styles.currentDot,
                isCurrent && { borderColor: color },
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
    backgroundColor: COLORS.border,
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
    backgroundColor: COLORS.border,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentDot: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: -1,
  },
});

export default ProgressSteps;
