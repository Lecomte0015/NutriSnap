import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/constants/colors';
import { useStore } from '../../src/store/useStore';
import { MealCard, Card } from '../../src/components';
import { Meal } from '../../src/types';
import { format, isToday, isYesterday, startOfWeek, isWithinInterval } from 'date-fns';
import { fr, de, it } from 'date-fns/locale';
import i18n from '../../src/i18n';

const locales = { fr, de, it };

export default function HistoryScreen() {
  const { user, meals, setMeals } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const t = i18n.t.bind(i18n);
  const locale = locales[i18n.locale as keyof typeof locales] || fr;

  const fetchMeals = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/meals/${user.id}?limit=100`
      );
      if (response.ok) {
        const data = await response.json();
        setMeals(data.meals || []);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMeals();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMeals();
    setRefreshing(false);
  };

  const groupMealsByDate = (meals: Meal[]) => {
    const groups: { [key: string]: Meal[] } = {};
    
    meals.forEach((meal) => {
      const date = new Date(meal.created_at);
      let groupKey: string;
      
      if (isToday(date)) {
        groupKey = t('history.today');
      } else if (isYesterday(date)) {
        groupKey = t('history.yesterday');
      } else {
        groupKey = format(date, 'EEEE d MMMM', { locale });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(meal);
    });
    
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  };

  const groupedMeals = groupMealsByDate(meals);

  const renderMealItem = ({ item }: { item: Meal }) => (
    <MealCard meal={item} />
  );

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('history.title')}</Text>
      </View>

      {meals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>{t('history.noMeals')}</Text>
          </Card>
        </View>
      ) : (
        <FlatList
          data={groupedMeals}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <View style={styles.section}>
              {renderSectionHeader(item.title)}
              {item.data.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.secondary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
