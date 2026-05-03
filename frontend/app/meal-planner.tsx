import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { useTranslation } from '../src/hooks/useTranslation';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface PlannedMeal {
  id: string;
  name: string;
  calories: number;
  mealType: MealType;
  date: string; // ISO date string YYYY-MM-DD
}

const STORAGE_KEY = 'nutrisnap_planner';

function getWeekDates(): { date: string; dayKey: string; label: string; isToday: boolean }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const isToday = iso === today.toISOString().split('T')[0];
    return {
      date: iso,
      dayKey: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()],
      label: d.getDate().toString(),
      isToday,
    };
  });
}

export default function MealPlannerScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const t = useTranslation();

  const weekDates = getWeekDates();
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [meals, setMeals] = useState<PlannedMeal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealCal, setNewMealCal] = useState('');
  const [newMealType, setNewMealType] = useState<MealType>('lunch');

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setMeals(JSON.parse(stored));
    } catch {}
  };

  const saveMeals = async (updated: PlannedMeal[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    setMeals(updated);
  };

  const addMeal = () => {
    if (!newMealName.trim()) {
      Alert.alert(t('common.error'), t('manualEntry.errorName'));
      return;
    }
    const newMeal: PlannedMeal = {
      id: Date.now().toString(),
      name: newMealName.trim(),
      calories: parseInt(newMealCal) || 0,
      mealType: newMealType,
      date: selectedDate,
    };
    saveMeals([...meals, newMeal]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
    setNewMealName('');
    setNewMealCal('');
    setNewMealType('lunch');
  };

  const deleteMeal = (id: string) => {
    Alert.alert(t('planner.deleteTitle'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('planner.deleteConfirm'),
        style: 'destructive',
        onPress: () => saveMeals(meals.filter((m) => m.id !== id)),
      },
    ]);
  };

  const mealTypes: { key: MealType; label: string; icon: string }[] = [
    { key: 'breakfast', label: t('planner.breakfast'), icon: '🌅' },
    { key: 'lunch', label: t('planner.lunch'), icon: '☀️' },
    { key: 'dinner', label: t('planner.dinner'), icon: '🌙' },
    { key: 'snack', label: t('planner.snack'), icon: '🍎' },
  ];

  const dayMeals = meals.filter((m) => m.date === selectedDate);
  const totalCal = dayMeals.reduce((sum, m) => sum + m.calories, 0);

  const mealsByType = (type: MealType) => dayMeals.filter((m) => m.mealType === type);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>{t('planner.title')}</Text>
          <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>{t('planner.subtitle')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: COLORS.secondary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Week selector */}
      <View style={[styles.weekBar, { backgroundColor: COLORS.cardBackground }]}>
        {weekDates.map((d) => {
          const dayMealCount = meals.filter((m) => m.date === d.date).length;
          const isSelected = d.date === selectedDate;
          return (
            <TouchableOpacity
              key={d.date}
              style={[
                styles.dayBtn,
                isSelected && [styles.dayBtnActive, { backgroundColor: COLORS.secondary }],
                d.isToday && !isSelected && styles.dayBtnToday,
              ]}
              onPress={() => setSelectedDate(d.date)}
            >
              <Text style={[
                styles.dayLabel,
                { color: isSelected ? '#fff' : COLORS.textSecondary },
              ]}>
                {t(`planner.${d.dayKey}` as any)}
              </Text>
              <Text style={[
                styles.dayNumber,
                { color: isSelected ? '#fff' : COLORS.textPrimary },
                d.isToday && !isSelected && { color: COLORS.secondary },
              ]}>
                {d.label}
              </Text>
              {dayMealCount > 0 && (
                <View style={[styles.dot, { backgroundColor: isSelected ? '#fff' : COLORS.secondary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Total */}
      {totalCal > 0 && (
        <View style={[styles.totalBar, { backgroundColor: COLORS.secondary + '15' }]}>
          <Text style={[styles.totalText, { color: COLORS.secondary }]}>
            🔥 {t('planner.totalCalories')} : <Text style={styles.totalCal}>{totalCal}</Text> {t('planner.kcal')}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {mealTypes.map((type) => {
          const typeMeals = mealsByType(type.key);
          return (
            <View key={type.key} style={[styles.mealSection, { backgroundColor: COLORS.cardBackground }]}>
              <View style={styles.mealSectionHeader}>
                <Text style={styles.mealTypeIcon}>{type.icon}</Text>
                <Text style={[styles.mealTypeName, { color: COLORS.textPrimary }]}>{type.label}</Text>
                <TouchableOpacity
                  style={[styles.addMealBtn, { backgroundColor: COLORS.secondary + '20' }]}
                  onPress={() => {
                    setNewMealType(type.key);
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="add" size={16} color={COLORS.secondary} />
                  <Text style={[styles.addMealText, { color: COLORS.secondary }]}>{t('planner.addMeal')}</Text>
                </TouchableOpacity>
              </View>

              {typeMeals.length === 0 ? (
                <Text style={[styles.emptyText, { color: COLORS.textLight }]}>{t('planner.tapToAdd')}</Text>
              ) : (
                typeMeals.map((meal) => (
                  <View key={meal.id} style={[styles.mealItem, { borderColor: COLORS.border }]}>
                    <View style={styles.mealItemLeft}>
                      <Text style={[styles.mealItemName, { color: COLORS.textPrimary }]} numberOfLines={1}>
                        {meal.name}
                      </Text>
                      {meal.calories > 0 && (
                        <Text style={[styles.mealItemCal, { color: COLORS.textSecondary }]}>
                          {meal.calories} kcal
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => deleteMeal(meal.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color={COLORS.error || '#ef4444'} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          );
        })}

        {dayMeals.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: COLORS.cardBackground }]}>
            <Text style={styles.emptyCardIcon}>📅</Text>
            <Text style={[styles.emptyCardText, { color: COLORS.textSecondary }]}>{t('planner.noMeals')}</Text>
            <Text style={[styles.emptyCardSub, { color: COLORS.textLight }]}>{t('planner.tapToAdd')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Add meal modal */}
      <Modal visible={modalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalSheet, { backgroundColor: COLORS.cardBackground }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: COLORS.textPrimary }]}>{t('planner.addMealTitle')}</Text>

            {/* Meal type selector */}
            <View style={styles.mealTypeRow}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.mealTypePill,
                    { backgroundColor: COLORS.background, borderColor: COLORS.border },
                    newMealType === type.key && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
                  ]}
                  onPress={() => setNewMealType(type.key)}
                >
                  <Text style={styles.mealTypeIcon2}>{type.icon}</Text>
                  <Text style={[styles.mealTypePillLabel, { color: newMealType === type.key ? '#fff' : COLORS.textSecondary }]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name */}
            <Text style={[styles.modalLabel, { color: COLORS.textSecondary }]}>{t('planner.mealName')}</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: COLORS.background, color: COLORS.textPrimary, borderColor: COLORS.border }]}
              value={newMealName}
              onChangeText={setNewMealName}
              placeholder={t('planner.mealNamePlaceholder')}
              placeholderTextColor={COLORS.textLight}
              autoFocus
            />

            {/* Calories */}
            <Text style={[styles.modalLabel, { color: COLORS.textSecondary }]}>{t('planner.estimatedCalories')}</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: COLORS.background, color: COLORS.textPrimary, borderColor: COLORS.border }]}
              value={newMealCal}
              onChangeText={setNewMealCal}
              placeholder="0"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
            />

            {/* Confirm */}
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: COLORS.secondary }]}
              onPress={addMeal}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.confirmBtnText}>{t('planner.confirm')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelModal}>
              <Text style={[styles.cancelText, { color: COLORS.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  weekBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  dayBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  dayBtnActive: { borderRadius: BORDER_RADIUS.md },
  dayBtnToday: {},
  dayLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  dayNumber: { fontSize: 16, fontWeight: '700' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 3 },
  totalBar: {
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  totalText: { fontSize: 14, fontWeight: '600' },
  totalCal: { fontWeight: '800', fontSize: 16 },
  content: { padding: SPACING.md, paddingBottom: 40 },
  mealSection: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mealTypeIcon: { fontSize: 20, marginRight: SPACING.sm },
  mealTypeName: { fontSize: 16, fontWeight: '700', flex: 1 },
  addMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    gap: 4,
  },
  addMealText: { fontSize: 13, fontWeight: '600' },
  emptyText: { fontSize: 13, fontStyle: 'italic', paddingVertical: SPACING.sm },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    marginTop: 4,
  },
  mealItemLeft: { flex: 1 },
  mealItemName: { fontSize: 14, fontWeight: '500' },
  mealItemCal: { fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: SPACING.xs },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    ...SHADOWS.small,
  },
  emptyCardIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyCardText: { fontSize: 16, fontWeight: '500', marginBottom: SPACING.xs },
  emptyCardSub: { fontSize: 13 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: SPACING.md },
  mealTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  mealTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1.5,
    gap: 4,
  },
  mealTypeIcon2: { fontSize: 14 },
  mealTypePillLabel: { fontSize: 12, fontWeight: '500' },
  modalLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: SPACING.md,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelModal: { alignItems: 'center', paddingVertical: SPACING.sm },
  cancelText: { fontSize: 14 },
});
