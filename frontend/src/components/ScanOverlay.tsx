import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

interface ScanOverlayProps {
  isScanning: boolean;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({ isScanning }) => {
  const scanLineY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const cornerOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (isScanning) {
      // Scan line animation
      scanLineY.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      
      // Pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );

      // Corner glow
      cornerOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.5, { duration: 500 })
        ),
        -1,
        false
      );
    }
  }, [isScanning]);

  const scanLineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLineY.value * 250 }],
    };
  });

  const frameStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const cornerStyle = useAnimatedStyle(() => {
    return {
      opacity: cornerOpacity.value,
    };
  });

  if (!isScanning) {
    return (
      <View style={styles.container}>
        <View style={styles.frame}>
          {/* Corner guides */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.frame, frameStyle]}>
        {/* Animated corners */}
        <Animated.View style={[styles.corner, styles.topLeft, styles.cornerGlow, cornerStyle]} />
        <Animated.View style={[styles.corner, styles.topRight, styles.cornerGlow, cornerStyle]} />
        <Animated.View style={[styles.corner, styles.bottomLeft, styles.cornerGlow, cornerStyle]} />
        <Animated.View style={[styles.corner, styles.bottomRight, styles.cornerGlow, cornerStyle]} />
        
        {/* Scan line */}
        <Animated.View style={[styles.scanLineContainer, scanLineStyle]}>
          <LinearGradient
            colors={['transparent', COLORS.secondary, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanLine}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const FRAME_SIZE = 280;
const CORNER_SIZE = 40;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: COLORS.secondary,
  },
  cornerGlow: {
    borderColor: '#4dd0e1',
    shadowColor: '#4dd0e1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: 12,
  },
  scanLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
  },
  scanLine: {
    flex: 1,
    height: 3,
  },
});

export default ScanOverlay;
