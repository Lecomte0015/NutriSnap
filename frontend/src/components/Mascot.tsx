import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { MascotMood } from '../types';

const mascotImage = require('../../assets/mascot/mascot-sprites.png');

interface MascotProps {
  mood: MascotMood;
  size?: number;
  showAnimation?: boolean;
}

// Sprite positions in the 2x3 grid
const SPRITE_POSITIONS: Record<MascotMood, { row: number; col: number }> = {
  idle: { row: 0, col: 0 },      // Top-left: confident/achiever
  excited: { row: 0, col: 1 },   // Top-middle: jumping/enthusiastic
  sad: { row: 0, col: 2 },       // Top-right: disappointed
  happy: { row: 1, col: 0 },     // Bottom-left: pointer/navigator
  warning: { row: 1, col: 1 },   // Bottom-middle: concerned
  thinking: { row: 1, col: 2 },  // Bottom-right: rewarder/indulgent
};

export const Mascot: React.FC<MascotProps> = ({ mood, size = 120, showAnimation = true }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    if (!showAnimation) return;

    switch (mood) {
      case 'excited':
        translateY.value = withRepeat(
          withSequence(
            withSpring(-15, { damping: 5 }),
            withSpring(0, { damping: 5 })
          ),
          -1,
          true
        );
        scale.value = withRepeat(
          withSequence(
            withSpring(1.1, { damping: 8 }),
            withSpring(1, { damping: 8 })
          ),
          -1,
          true
        );
        break;
      case 'happy':
        rotate.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 200 }),
            withTiming(5, { duration: 200 })
          ),
          -1,
          true
        );
        break;
      case 'sad':
        translateY.value = withRepeat(
          withSequence(
            withTiming(3, { duration: 1000 }),
            withTiming(0, { duration: 1000 })
          ),
          -1,
          true
        );
        break;
      case 'thinking':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          true
        );
        break;
      default:
        // Idle gentle float
        translateY.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 1500 }),
            withTiming(5, { duration: 1500 })
          ),
          -1,
          true
        );
        break;
    }

    return () => {
      translateY.value = 0;
      scale.value = 1;
      rotate.value = 0;
    };
  }, [mood, showAnimation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  const position = SPRITE_POSITIONS[mood];
  const spriteWidth = 341; // Each sprite is approximately 341px wide (1024/3)
  const spriteHeight = 512; // Each sprite is approximately 512px tall (1024/2)

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
      <View style={[styles.spriteContainer, { width: size, height: size }]}>
        <Image
          source={mascotImage}
          style={[
            styles.spriteImage,
            {
              width: size * 3,
              height: size * 2,
              transform: [
                { translateX: -position.col * size },
                { translateY: -position.row * size },
              ],
            },
          ]}
          resizeMode="cover"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spriteContainer: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  spriteImage: {
    position: 'absolute',
  },
});

export default Mascot;
