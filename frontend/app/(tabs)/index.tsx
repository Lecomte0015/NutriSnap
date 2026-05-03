import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Animated,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../src/constants/colors';
import { useStore } from '../../src/store/useStore';
import { useColors } from '../../src/hooks/useColors';
import { CalorieRing, MacroBar, MealCard, Card, MascotAnimated, WeeklyChart } from '../../src/components';
import { notificationService } from '../../src/services/notifications';
import { useTranslation } from '../../src/hooks/useTranslation';
import { Meal, DailyStats, Streak } from '../../src/types';

interface WeeklyStatsData {
  date: string;
  total_calories: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const {
    user, profile, todayMeals, setTodayMeals, dailyStats, setDailyStats,
    streak, setStreak, mascotMood, setMascotMood, mascotMessage, setMascotMessage,
  } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsData[]>([]);
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useState(new Animated.Value(0))[0];
  const t = useTranslation();

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    Animated.spring(fabAnim, { toValue, useNativeDriver: true, friction: 6 }).start();
    setFabOpen(!fabOpen);
  };

  const closeFab = () => {
    Animated.spring(fabAnim, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
    setFabOpen(false);
  };

  const dailyGoal = profile?.daily_calories || 2000;
  const proteinGoal = Math.round((dailyGoal * 0.3) / 4);
  const carbsGoal = Math.round((dailyGoal * 0.4) / 4);
  const fatGoal = Math.round((dailyGoal * 0.3) / 9);

  const fetchData = async () => {
    if (!user) return;

    try {
      const results = await Promise.allSettled([
        fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/meals/${user.id}/today`),
        fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/stats/${user.id}/today`),
        fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/streaks/${user.id}`),
        fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/stats/${user.id}/weekly`),
      ]);

      const [mealsRes, statsRes, streakRes, weeklyRes] = results;

      let todayMealsCount = 0;

      if (mealsRes.status === 'fulfilled' && mealsRes.value.ok) {
        const d = await mealsRes.value.json();
        const meals = d.meals || [];
        setTodayMeals(meals);
        todayMealsCount = meals.length;
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const d = await statsRes.value.json();
        setDailyStats(d);
      }

      if (streakRes.status === 'fulfilled' && streakRes.value.ok) {
        const streakData = await streakRes.value.json();
        setStreak(streakData);

        const currentStreak = streakData.current_streak || 0;

        if (currentStreak >= 7) {
          setMascotMood('excited');
          setMascotMessage(t('mascot.streak7'));
        } else if (currentStreak >= 3) {
          setMascotMood('happy');
          setMascotMessage(t('mascot.streak3'));
        } else {
          setMascotMood('idle');
          setMascotMessage(t('mascot.welcomeBack'));
        }

        if (currentStreak > 0 && todayMealsCount === 0) {
          notificationService.scheduleStreakDangerAlert(currentStreak);
        }
      }

      if (weeklyRes.status === 'fulfilled' && weeklyRes.value.ok) {
        const d = await weeklyRes.value.json();
        setWeeklyStats(d.stats || []);
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

  const currentCalories = dailyStats?.total_calories || 0;
  const currentProtein = dailyStats?.protein || 0;
  const currentCarbs = dailyStats?.carbs || 0;
  const currentFat = dailyStats?.fat || 0;

  const remainingCalories = Math.max(0, dailyGoal - currentCalories);
  const remainingProtein = Math.max(0, proteinGoal - Math.round(currentProtein));
  const remainingCarbs = Math.max(0, carbsGoal - Math.round(currentCarbs));
  const remainingFat = Math.max(0, fatGoal - Math.round(currentFat));

  const getMealSuggestion = () => {
    if (remainingCalories <= 0) return null;
    if (remainingProtein > 20) return { text: t('dashboard.suggestionProtein'), icon: '🥩', detail: t('dashboard.suggestionProteinDetail', { count: remainingProtein }) };
    if (remainingCarbs > 30) return { text: t('dashboard.suggestionCarbs'), icon: '🌾', detail: t('dashboard.suggestionCarbsDetail', { count: remainingCarbs }) };
    if (remainingFat > 10) return { text: t('dashboard.suggestionFat'), icon: '🥑', detail: t('dashboard.suggestionFatDetail', { count: remainingFat }) };
    return { text: t('dashboard.suggestionBalanced'), icon: '✅', detail: t('dashboard.suggestionBalancedDetail', { count: remainingCalories }) };
  };

  const suggestion = getMealSuggestion();
  const displayName = profile?.first_name || user?.email?.split('@')[0] || t('dialogs.user');
  const isStreakDanger = (streak?.current_streak || 0) > 0 && todayMeals.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: COLORS.textSecondary }]}>{t('dashboard.hello')},</Text>
            <Text style={[styles.userName, { color: COLORS.textPrimary }]}>{displayName}</Text>
          </View>
          <View style={[
            styles.streakContainer,
            { backgroundColor: COLORS.cardBackground },
            isStreakDanger && { backgroundColor: COLORS.error + '20', borderWidth: 1, borderColor: COLORS.error },
          ]}>
            <Ionicons name="flame" size={20} color={isStreakDanger ? COLORS.error : COLORS.warning} />
            <Text style={[styles.streakText, { color: COLORS.textPrimary }, isStreakDanger && { color: COLORS.error }]}>
              {streak?.current_streak || 0}
            </Text>
            {isStreakDanger && <Text style={[styles.dangerIndicator, { color: COLORS.error }]}>!</Text>}
          </View>
        </View>

        {/* Mascot Card */}
        <Card style={[styles.mascotCard, isStreakDanger && { borderWidth: 1, borderColor: COLORS.warning, backgroundColor: COLORS.warning + '10' }]}>
          <View style={styles.mascotContent}>
            <MascotAnimated mood={isStreakDanger ? 'warning' : mascotMood} size={100} />
            <View style={styles.mascotTextContainer}>
              <Text style={[styles.mascotMessage, { color: COLORS.textPrimary }]}>
                {isStreakDanger
                  ? t('dashboard.streakDanger', { count: streak?.current_streak })
                  : (mascotMessage || t('mascot.welcomeBack'))}
              </Text>
            </View>
          </View>
        </Card>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('dashboard.todaySummary')}</Text>

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

          <WeeklyChart data={weeklyStats} goal={dailyGoal} />
        </Card>

        {/* Suggestion prochain repas */}
        {suggestion && (
          <Card style={[styles.suggestionCard, { backgroundColor: COLORS.secondary + '10', borderColor: COLORS.secondary + '40' }]}>
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
              <View style={styles.suggestionText}>
                <Text style={[styles.suggestionTitle, { color: COLORS.textPrimary }]}>{suggestion.text}</Text>
                <Text style={[styles.suggestionDetail, { color: COLORS.textSecondary }]}>{suggestion.detail}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Today's Meals */}
        <View style={styles.mealsSection}>
          <View style={styles.mealsSectionHeader}>
            <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>
              {t('dashboard.meals')} ({todayMeals.length})
            </Text>
          </View>

          {todayMeals.length > 0 ? (
            todayMeals.slice(0, 3).map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="restaurant-outline" size={48} color={COLORS.textLight} />
              <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>{t('dashboard.noMealsYet')}</Text>
              <Text style={[styles.emptySubtext, { color: COLORS.textLight }]}>{t('dashboard.startScanning')}</Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB overlay backdrop */}
      {fabOpen && (
        <TouchableOpacity style={styles.fabBackdrop} activeOpacity={1} onPress={closeFab} />
      )}

      {/* FAB mini buttons */}
      {fabOpen && (
        <View style={styles.fabMenu}>
          {/* Manual entry */}
          <Animated.View style={[styles.fabMenuItem, {
            opacity: fabAnim,
            transform: [{ translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -160] }) }],
          }]}>
            <View style={styles.fabMenuLabel}>
              <View style={[styles.fabLabelBubble, { backgroundColor: COLORS.cardBackground }]}>
                <Text style={[styles.fabLabelText, { color: COLORS.textPrimary }]}>{t('addMealModal.manual')}</Text>
                <Text style={[styles.fabLabelDesc, { color: COLORS.textSecondary }]}>{t('addMealModal.manualDesc')}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.fabMini, { backgroundColor: '#8b5cf6' }]}
              onPress={() => { closeFab(); router.push('/manual-entry'); }}
            >
              <Ionicons name="create-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          {/* Barcode */}
          <Animated.View style={[styles.fabMenuItem, {
            opacity: fabAnim,
            transform: [{ translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -100] }) }],
          }]}>
            <View style={styles.fabMenuLabel}>
              <View style={[styles.fabLabelBubble, { backgroundColor: COLORS.cardBackground }]}>
                <Text style={[styles.fabLabelText, { color: COLORS.textPrimary }]}>{t('addMealModal.barcode')}</Text>
                <Text style={[styles.fabLabelDesc, { color: COLORS.textSecondary }]}>{t('addMealModal.barcodeDesc')}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.fabMini, { backgroundColor: '#f59e0b' }]}
              onPress={() => { closeFab(); router.push('/barcode-scanner'); }}
            >
              <Ionicons name="barcode-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Main FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: COLORS.secondary }]}
        onPress={fabOpen ? closeFab : toggleFab}
        activeOpacity={0.85}
      >
        <Animated.View style={{
          transform: [{ rotate: fabAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }],
        }}>
          {fabOpen
            ? <Ionicons name="close" size={28} color="#FFFFFF" />
            : <Ionicons name="add" size={32} color="#FFFFFF" />
          }
        </Animated.View>
      </TouchableOpacity>

      {/* Camera shortcut stays as secondary mini-fab */}
      {!fabOpen && (
        <TouchableOpacity
          style={[styles.cameraShortcut, { backgroundColor: COLORS.secondary + 'cc' }]}
          onPress={() => router.push('/camera')}
        >
          <Ionicons name="camera" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.small,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  dangerIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
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
    lineHeight: 22,
  },
  summaryCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  calorieSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  macrosSection: {
    marginTop: SPACING.md,
  },
  suggestionCard: {
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  suggestionDetail: {
    fontSize: 13,
    marginTop: 2,
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
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  cameraShortcut: {
    position: 'absolute',
    right: SPACING.lg + 64,
    bottom: 108,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  fabBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  fabMenu: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 100,
    alignItems: 'flex-end',
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fabMenuLabel: {
    marginRight: SPACING.sm,
  },
  fabLabelBubble: {
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    ...SHADOWS.small,
  },
  fabLabelText: { fontSize: 13, fontWeight: '600' },
  fabLabelDesc: { fontSize: 11, marginTop: 1 },
  fabMini: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
});
