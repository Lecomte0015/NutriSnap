import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface CelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
  type?: 'confetti' | 'fireworks';
}

export const Celebration: React.FC<CelebrationProps> = ({
  trigger,
  onComplete,
  type = 'confetti',
}) => {
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (trigger && confettiRef.current) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      confettiRef.current.start();
    }
  }, [trigger]);

  if (!trigger) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: width / 2, y: -20 }}
        autoStart={true}
        fadeOut={true}
        fallSpeed={3000}
        explosionSpeed={500}
        colors={['#2fa4a7', '#4CAF50', '#FFD700', '#FF6B6B', '#4ECDC4', '#9C27B0']}
        onAnimationEnd={onComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});

export default Celebration;
