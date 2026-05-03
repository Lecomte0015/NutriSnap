import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../src/constants/colors';
import { useStore } from '../../src/store/useStore';
import { useColors } from '../../src/hooks/useColors';
import { MealCard, Card } from '../../src/components';
import { Meal } from '../../src/types';
import { format, isToday, isYesterday } from 'date-fns';
import { fr, de, it, enUS } from 'date-fns/locale';
import i18n from '../../src/i18n';
import { useTranslation } from '../../src/hooks/useTranslation';

const locales: Record<string, Locale> = { fr, de, it, en: enUS };

export default function HistoryScreen() {
  const { user, meals, setMeals } = useStore();
  const COLORS = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const t = useTranslation();
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

  const handleDeleteMeal = async () => {
    if (!selectedMeal || !user) return;
    setDeleting(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/meals/${selectedMeal.id}?user_id=${user.id}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setMeals(meals.filter((m) => m.id !== selectedMeal.id));
        setSelectedMeal(null);
        setDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    } finally {
      setDeleting(false);
    }
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return COLORS.scoreExcellent;
    if (score >= 6) return COLORS.scoreGood;
    if (score >= 4) return COLORS.scoreAverage;
    return COLORS.scorePoor;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Meal Detail Modal */}
      <Modal
        visible={!!selectedMeal}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedMeal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: COLORS.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
                {selectedMeal?.foods?.join(', ') || t('analysis.result')}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setDeleteConfirm(true)} style={styles.modalDeleteBtn}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedMeal(null)} style={styles.modalClose}>
                  <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedMeal?.image_base64 ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${selectedMeal.image_base64}` }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.modalImagePlaceholder, { backgroundColor: COLORS.border }]}>
                  <Ionicons name="restaurant" size={48} color={COLORS.textLight} />
                </View>
              )}

              {selectedMeal && (
                <View style={styles.modalContent}>
                  <View style={styles.modalScoreRow}>
                    <Text style={[styles.modalLabel, { color: COLORS.textSecondary }]}>{t('analysis.score')}</Text>
                    <View style={[styles.modalScoreBadge, { backgroundColor: getScoreColor(selectedMeal.score) }]}>
                      <Text style={styles.modalScoreText}>{selectedMeal.score}/10</Text>
                    </View>
                  </View>

                  <Text style={[styles.modalLabel, { color: COLORS.textSecondary }]}>{t('analysis.detected')}</Text>
                  <Text style={[styles.modalFoods, { color: COLORS.textPrimary }]}>
                    {selectedMeal.foods?.join(', ') || '-'}
                  </Text>

                  <Text style={[styles.modalLabel, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>{t('analysis.macros')}</Text>
                  <View style={styles.modalMacros}>
                    {[
                      { label: t('dashboard.calories'), value: `${selectedMeal.calories} kcal`, color: COLORS.secondary },
                      { label: t('dashboard.protein'), value: `${selectedMeal.protein}g`, color: COLORS.protein },
                      { label: t('dashboard.carbs'), value: `${selectedMeal.carbs}g`, color: COLORS.carbs },
                      { label: t('dashboard.fat'), value: `${selectedMeal.fat}g`, color: COLORS.fat },
                    ].map((macro) => (
                      <View key={macro.label} style={[styles.macroItem, { backgroundColor: macro.color + '15' }]}>
                        <Text style={[styles.macroValue, { color: macro.color }]}>{macro.value}</Text>
                        <Text style={[styles.macroLabel, { color: COLORS.textSecondary }]}>{macro.label}</Text>
                      </View>
                    ))}
                  </View>

                  {selectedMeal.feedback ? (
                    <>
                      <Text style={[styles.modalLabel, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>{t('testimonials.feedback')}</Text>
                      <Text style={[styles.modalFeedback, { color: COLORS.textPrimary }]}>{selectedMeal.feedback}</Text>
                    </>
                  ) : null}

                  <Text style={[styles.modalDate, { color: COLORS.textLight }]}>
                    {format(new Date(selectedMeal.created_at), 'PPPp', { locale })}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        visible={deleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmBox, { backgroundColor: COLORS.cardBackground }]}>
            <View style={[styles.confirmIcon, { backgroundColor: COLORS.error + '18' }]}>
              <Ionicons name="trash-outline" size={28} color={COLORS.error} />
            </View>
            <Text style={[styles.confirmTitle, { color: COLORS.textPrimary }]}>{t('history.deleteTitle')}</Text>
            <Text style={[styles.confirmMessage, { color: COLORS.textSecondary }]}>{t('history.deleteMsg')}</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, { borderColor: COLORS.border, borderWidth: 1 }]}
                onPress={() => setDeleteConfirm(false)}
                disabled={deleting}
              >
                <Text style={[styles.confirmBtnText, { color: COLORS.textPrimary }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: COLORS.error }]}
                onPress={handleDeleteMeal}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.confirmBtnText, { color: '#fff' }]}>{t('history.deleteConfirm')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('history.title')}</Text>
      </View>

      {meals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
            <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>{t('history.noMeals')}</Text>
          </Card>
        </View>
      ) : (
        <FlatList
          data={groupedMeals}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: COLORS.textSecondary }]}>{item.title}</Text>
              {item.data.map((meal) => (
                <MealCard key={meal.id} meal={meal} onPress={() => setSelectedMeal(meal)} />
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
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  modalDeleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: SPACING.sm,
  },
  modalClose: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: '100%',
    height: 220,
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: SPACING.md,
  },
  modalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  modalScoreBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  modalScoreText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  modalFoods: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  modalMacros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  macroItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  macroLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  modalFeedback: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  modalDate: {
    fontSize: 13,
    textAlign: 'right',
    marginTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  confirmBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  confirmIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
