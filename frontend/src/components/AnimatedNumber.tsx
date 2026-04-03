import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/colors';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '500' | '600' | '700';
  delay?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1000,
  suffix = '',
  prefix = '',
  color = COLORS.textPrimary,
  fontSize = 24,
  fontWeight = 'bold',
  delay = 0,
}) => {
  const animatedValue = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    // Scale in animation
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    
    // Count up animation
    animatedValue.value = withDelay(
      delay,
      withTiming(value, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Update display value
    const interval = setInterval(() => {
      const progress = animatedValue.value;
      setDisplayValue(Math.round(progress));
      if (progress >= value) {
        clearInterval(interval);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.text, { color, fontSize, fontWeight }]}>
        {prefix}{displayValue}{suffix}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
});

export default AnimatedNumber;
