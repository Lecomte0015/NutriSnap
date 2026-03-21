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

// The sprite sheet is 1024x1024 with a 3x2 grid
// Each sprite cell is approximately 341x512 pixels
const SPRITE_WIDTH = 341;
const SPRITE_HEIGHT = 512;

// Sprite positions in the 2x3 grid (row, col)
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
  
  // Calculate the scale factor to fit the sprite into the desired size
  // We want the height to match the size (maintaining aspect ratio)
  const scaleFactor = size / SPRITE_HEIGHT;
  const scaledWidth = SPRITE_WIDTH * scaleFactor;
  const scaledHeight = size;
  
  // Calculate image dimensions (full sprite sheet scaled)
  const imageWidth = 1024 * scaleFactor;
  const imageHeight = 1024 * scaleFactor;
  
  // Calculate offset to show the correct sprite
  const offsetX = -position.col * scaledWidth;
  const offsetY = -position.row * scaledHeight;

  return (
    <Animated.View style={[styles.container, { width: scaledWidth, height: scaledHeight }, animatedStyle]}>
      <View style={[styles.spriteContainer, { width: scaledWidth, height: scaledHeight }]}>
        <Image
          source={mascotImage}
          style={{
            width: imageWidth,
            height: imageHeight,
            position: 'absolute',
            left: offsetX,
            top: offsetY,
          }}
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
  },
});

export default Mascot;
