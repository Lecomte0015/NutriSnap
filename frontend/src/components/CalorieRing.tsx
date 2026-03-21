import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SPACING } from '../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalorieRingProps {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  current,
  goal,
  size = 180,
  strokeWidth = 15,
}) => {
  const progress = useSharedValue(0);
  const percentage = Math.min((current / goal) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  React.useEffect(() => {
    progress.value = withTiming(percentage / 100, { duration: 1000 });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - progress.value),
    };
  });

  const getColor = () => {
    if (percentage >= 100) return COLORS.warning;
    if (percentage >= 80) return COLORS.scoreGood;
    return COLORS.secondary;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        <Text style={styles.currentValue}>{current}</Text>
        <Text style={styles.goalValue}>/ {goal}</Text>
        <Text style={styles.label}>kcal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
  },
  currentValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  goalValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: -4,
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
});

export default CalorieRing;
