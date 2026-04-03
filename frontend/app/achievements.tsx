import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { Card, MascotAnimated } from '../src/components';
import { BadgeCard, LevelProgress, WeeklyChallengeCard, Testimonials, SocialProof } from '../src/components';
import { BADGES_CONFIG, WeeklyChallenge, Badge } from '../src/types/gamification';
import { useStore } from '../src/store/useStore';

export default function AchievementsScreen() {
  const router = useRouter();
  const { profile } = useStore();

  // Demo data - would normally come from backend/store
  const userXp = 450;
  const userBadges: Badge[] = BADGES_CONFIG.map((badge, index) => ({
    ...badge,
    isUnlocked: index < 4, // First 4 badges unlocked for demo
    unlockedAt: index < 4 ? new Date().toISOString() : undefined,
  }));

  const weeklyChallenges: WeeklyChallenge[] = [
    {
      id: '1',
      title: 'Photographe du week-end',
      description: 'Scanne 5 repas cette semaine',
      type: 'meals',
      target: 5,
      progress: 3,
      reward: 50,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isCompleted: false,
    },
    {
      id: '2',
      title: 'Mangeur sain',
      description: 'Obtiens un score moyen de 7+ sur 3 repas',
      type: 'score',
      target: 3,
      progress: 2,
      reward: 75,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isCompleted: false,
    },
    {
      id: '3',
      title: 'S\u00e9rie en feu',
      description: 'Maintiens une s\u00e9rie de 3 jours',
      type: 'streak',
      target: 3,
      progress: 3,
      reward: 100,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isCompleted: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Mes succ\u00e8s</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Level Progress */}
        <View style={styles.section}>
          <LevelProgress currentXp={userXp} />
        </View>

        {/* Mascot */}
        <View style={styles.mascotSection}>
          <MascotAnimated mood="excited" size={100} />
          <Text style={styles.mascotText}>
            Super progression ! Continue comme \u00e7a ! \ud83c\udf1f
          </Text>
        </View>

        {/* Weekly Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>\ud83c\udfaf D\u00e9fis de la semaine</Text>
          {weeklyChallenges.map((challenge) => (
            <WeeklyChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>\ud83c\udfc5 Badges</Text>
          <View style={styles.badgesGrid}>
            {userBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} size="medium" />
            ))}
          </View>
        </View>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>\ud83d\udcca Tes statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Repas scann\u00e9s</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>7.4</Text>
              <Text style={styles.statLabel}>Score moyen</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Jours de s\u00e9rie</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-2.3kg</Text>
              <Text style={styles.statLabel}>Poids perdu</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  mascotSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  mascotText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: SPACING.md,
  },
  statsCard: {
    marginTop: SPACING.md,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
