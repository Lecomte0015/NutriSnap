import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { Card, MascotAnimated } from '../src/components';
import { BadgeCard, LevelProgress, WeeklyChallengeCard } from '../src/components';
import { BadgeUnlockModal } from '../src/components/BadgeUnlockModal';
import { BADGES_CONFIG, WeeklyChallenge, Badge } from '../src/types/gamification';
import { useStore } from '../src/store/useStore';
import { useMascotController } from '../src/hooks/useMascotController';
import { useTranslation } from '../src/hooks/useTranslation';

interface GamificationState {
  total_xp: number;
  meals_scanned: number;
  average_score: number;
  unlocked_badge_ids: string[];
  newly_unlocked_badge_ids: string[];
}

export default function AchievementsScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const t = useTranslation();
  const { user, profile, setGamification, gamification, mascotMood } = useStore();
  const { triggerCelebrating } = useMascotController();
  const [loading, setLoading] = useState(true);
  const [serverData, setServerData] = useState<GamificationState | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<Badge[]>([]);
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);

  const fetchGamification = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/gamification/${user.id}`);
      if (res.ok) {
        const data: GamificationState = await res.json();
        setServerData(data);
        setGamification({
          totalXp: data.total_xp,
          mealsScanned: data.meals_scanned,
          averageScore: data.average_score,
          unlockedBadgeIds: data.unlocked_badge_ids,
          newlyUnlockedBadgeId: data.newly_unlocked_badge_ids[0] || null,
        });

        if (data.newly_unlocked_badge_ids.length > 0) {
          const newBadges: Badge[] = data.newly_unlocked_badge_ids
            .map(id => {
              const config = BADGES_CONFIG.find(b => b.id === id);
              return config ? { ...config, isUnlocked: true, unlockedAt: new Date().toISOString() } : null;
            })
            .filter(Boolean) as Badge[];

          if (newBadges.length > 0) {
            setBadgeQueue(newBadges);
            setCurrentBadge(newBadges[0]);
            triggerCelebrating(t('achievements.newBadge', { name: newBadges[0].name }));
          }
        }
      }
    } catch (e) {
      console.error('Error fetching gamification:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchGamification(); }, [user]));

  const handleBadgeModalClose = () => {
    const remaining = badgeQueue.slice(1);
    setBadgeQueue(remaining);
    if (remaining.length > 0) {
      setCurrentBadge(remaining[0]);
      triggerCelebrating(t('achievements.newBadge', { name: remaining[0].name }));
    } else {
      setCurrentBadge(null);
    }
  };

  const userBadges: Badge[] = BADGES_CONFIG.map(badge => ({
    ...badge,
    isUnlocked: serverData?.unlocked_badge_ids.includes(badge.id) ?? false,
    unlockedAt: serverData?.unlocked_badge_ids.includes(badge.id) ? new Date().toISOString() : undefined,
  }));

  const totalXp = serverData?.total_xp ?? gamification.totalXp;
  const mealsScanned = serverData?.meals_scanned ?? gamification.mealsScanned;
  const avgScore = serverData?.average_score ?? gamification.averageScore;

  const weeklyChallenges: WeeklyChallenge[] = [
    {
      id: '1',
      title: t('achievements.challenge1Title'),
      description: t('achievements.challenge1Desc'),
      type: 'meals',
      target: 5,
      progress: Math.min(mealsScanned, 5),
      reward: 50,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isCompleted: mealsScanned >= 5,
    },
    {
      id: '2',
      title: t('achievements.challenge2Title'),
      description: t('achievements.challenge2Desc'),
      type: 'score',
      target: 7,
      progress: Math.min(avgScore, 7),
      reward: 75,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isCompleted: avgScore >= 7,
    },
  ];

  const stats = [
    { value: mealsScanned, label: t('achievements.statsScanned') },
    { value: avgScore > 0 ? avgScore.toFixed(1) : '-', label: t('achievements.statsScore') },
    { value: userBadges.filter(b => b.isUnlocked).length, label: t('achievements.statsBadges') },
    { value: totalXp, label: t('achievements.statsXp') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <BadgeUnlockModal badge={currentBadge} visible={!!currentBadge} onClose={handleBadgeModalClose} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('achievements.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={[styles.loadingText, { color: COLORS.textSecondary }]}>{t('achievements.loading')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <LevelProgress currentXp={totalXp} />
          </View>

          <View style={styles.mascotSection}>
            <MascotAnimated mood={mascotMood === 'celebrating' ? 'celebrating' : 'excited'} size={100} />
            <Text style={[styles.mascotText, { color: COLORS.textSecondary }]}>
              {totalXp > 0
                ? t('achievements.xpAccumulated', { count: totalXp })
                : t('achievements.scanFirst')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('achievements.weeklyChallengesTitle')}</Text>
            {weeklyChallenges.map((challenge) => (
              <WeeklyChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>
              {t('achievements.badgesTitle')} ({userBadges.filter(b => b.isUnlocked).length}/{BADGES_CONFIG.length})
            </Text>
            <View style={styles.badgesGrid}>
              {userBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} size="medium" />
              ))}
            </View>
          </View>

          <Card style={styles.statsCard}>
            <Text style={[styles.statsTitle, { color: COLORS.textPrimary }]}>{t('achievements.statsTitle')}</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <Text style={[styles.statValue, { color: COLORS.secondary }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  loadingText: { fontSize: 15 },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: SPACING.md },
  mascotSection: { alignItems: 'center', marginVertical: SPACING.md },
  mascotText: { fontSize: 16, marginTop: SPACING.sm, textAlign: 'center' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: SPACING.md },
  statsCard: { marginTop: SPACING.md },
  statsTitle: { fontSize: 16, fontWeight: '600', marginBottom: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', alignItems: 'center', paddingVertical: SPACING.md },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 13, marginTop: 4 },
});
