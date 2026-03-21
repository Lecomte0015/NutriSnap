import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../src/constants/colors';
import { useStore } from '../../src/store/useStore';
import { CalorieRing, MacroBar, MealCard, Card, Mascot } from '../../src/components';
import i18n from '../../src/i18n';
import { Meal, DailyStats, Streak } from '../../src/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, profile, todayMeals, setTodayMeals, dailyStats, setDailyStats, streak, setStreak, mascotMood, setMascotMood, mascotMessage, setMascotMessage } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const t = i18n.t.bind(i18n);

  const dailyGoal = profile?.daily_calories || 2000;
  const proteinGoal = Math.round((dailyGoal * 0.3) / 4); // 30% of calories from protein
  const carbsGoal = Math.round((dailyGoal * 0.4) / 4);   // 40% of calories from carbs
  const fatGoal = Math.round((dailyGoal * 0.3) / 9);     // 30% of calories from fat

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch today's meals
      const mealsResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/meals/${user.id}/today`
      );
      if (mealsResponse.ok) {
        const mealsData = await mealsResponse.json();
        setTodayMeals(mealsData.meals || []);
      }

      // Fetch today's stats
      const statsResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/stats/${user.id}/today`
      );
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDailyStats(statsData);
      }

      // Fetch streak
      const streakResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/streaks/${user.id}`
      );
      if (streakResponse.ok) {
        const streakData = await streakResponse.json();
        setStreak(streakData);
        
        // Update mascot based on streak
        if (streakData.current_streak >= 7) {
          setMascotMood('excited');
          setMascotMessage(t('mascot.streak7'));
        } else if (streakData.current_streak >= 3) {
          setMascotMood('happy');
          setMascotMessage(t('mascot.streak3'));
        } else {
          setMascotMood('idle');
          setMascotMessage(t('mascot.welcomeBack'));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAddMeal = () => {
    router.push('/camera');
  };

  const currentCalories = dailyStats?.total_calories || 0;
  const currentProtein = dailyStats?.protein || 0;
  const currentCarbs = dailyStats?.carbs || 0;
  const currentFat = dailyStats?.fat || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.secondary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('dashboard.hello')},</Text>
            <Text style={styles.userName}>
              {user?.email?.split('@')[0] || 'Utilisateur'}
            </Text>
          </View>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={20} color={COLORS.warning} />
            <Text style={styles.streakText}>{streak?.current_streak || 0}</Text>
          </View>
        </View>

        {/* Mascot Card */}
        <Card style={styles.mascotCard}>
          <View style={styles.mascotContent}>
            <Mascot mood={mascotMood} size={80} />
            <View style={styles.mascotTextContainer}>
              <Text style={styles.mascotMessage}>
                {mascotMessage || t('mascot.welcomeBack')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>{t('dashboard.todaySummary')}</Text>
          
          <View style={styles.calorieSection}>
            <CalorieRing current={currentCalories} goal={dailyGoal} />
          </View>

          <View style={styles.macrosSection}>
            <MacroBar
              label={t('dashboard.protein')}
              value={Math.round(currentProtein)}
              max={proteinGoal}
              color={COLORS.protein}
            />
            <MacroBar
              label={t('dashboard.carbs')}
              value={Math.round(currentCarbs)}
              max={carbsGoal}
              color={COLORS.carbs}
            />
            <MacroBar
              label={t('dashboard.fat')}
              value={Math.round(currentFat)}
              max={fatGoal}
              color={COLORS.fat}
            />
          </View>
        </Card>

        {/* Today's Meals */}
        <View style={styles.mealsSection}>
          <View style={styles.mealsSectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('dashboard.todaySummary').split(" ")[0]} ({todayMeals.length})
            </Text>
          </View>

          {todayMeals.length > 0 ? (
            todayMeals.slice(0, 3).map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="restaurant-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>{t('dashboard.noMealsYet')}</Text>
              <Text style={styles.emptySubtext}>{t('dashboard.startScanning')}</Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddMeal}>
        <Ionicons name="camera" size={28} color={COLORS.textWhite} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.small,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  mascotCard: {
    marginBottom: SPACING.md,
  },
  mascotContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  mascotMessage: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  summaryCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  calorieSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  macrosSection: {
    marginTop: SPACING.md,
  },
  mealsSection: {
    marginTop: SPACING.sm,
  },
  mealsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
});
