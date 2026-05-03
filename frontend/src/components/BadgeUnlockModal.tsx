import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MascotAnimated } from './MascotAnimated';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/colors';
import { useColors } from '../hooks/useColors';
import { useStore } from '../store/useStore';
import { Badge } from '../types/gamification';

interface BadgeUnlockModalProps {
  badge: Badge | null;
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  badge,
  visible,
  onClose,
}) => {
  const COLORS = useColors();
  const { hapticsEnabled } = useStore();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (visible && badge) {
      if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
      setTimeout(() => confettiRef.current?.start(), 200);
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!badge) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.confettiContainer, { pointerEvents: 'none' }]}>
          <ConfettiCannon
            ref={confettiRef}
            count={120}
            origin={{ x: width / 2, y: -20 }}
            autoStart={false}
            fadeOut
            fallSpeed={3000}
            explosionSpeed={400}
            colors={['#FFD700', '#2fa4a7', '#FF6B6B', '#4ECDC4', '#9C27B0']}
          />
        </View>

        <Animated.View style={[styles.card, { backgroundColor: COLORS.cardBackground, transform: [{ scale: scaleAnim }] }]}>
          <MascotAnimated mood="celebrating" size={100} />

          <Text style={[styles.title, { color: COLORS.textPrimary }]}>Badge débloqué !</Text>

          <View style={[styles.badgeCircle, { backgroundColor: badge.color + '20', borderColor: badge.color }]}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
          </View>

          <Text style={[styles.badgeName, { color: COLORS.textPrimary }]}>{badge.name}</Text>
          <Text style={[styles.badgeDescription, { color: COLORS.textSecondary }]}>{badge.description}</Text>

          <View style={[styles.xpRow, { backgroundColor: COLORS.secondary + '20' }]}>
            <Text style={[styles.xpText, { color: COLORS.secondary }]}>+50 XP</Text>
          </View>

          <TouchableOpacity style={[styles.closeButton, { backgroundColor: COLORS.secondary }]} onPress={onClose}>
            <Text style={styles.closeButtonText}>Super !</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: width * 0.85,
    ...SHADOWS.large,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  badgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badgeIcon: {
    fontSize: 36,
  },
  badgeName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  badgeDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  xpRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.xl,
  },
  xpText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BadgeUnlockModal;
