import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { useStore } from '../src/store/useStore';
import { useTranslation } from '../src/hooks/useTranslation';

const OFF_BASE = 'https://world.openfoodfacts.org/cgi/search.pl';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface SearchResult {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  brand?: string;
}

export default function ManualEntryScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const { user } = useStore();
  const t = useTranslation();

  // Search state
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [foodName, setFoodName] = useState('');
  const [portion, setPortion] = useState('100');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [saving, setSaving] = useState(false);

  const mealTypes: { key: MealType; label: string; icon: string }[] = [
    { key: 'breakfast', label: t('manualEntry.breakfast'), icon: '🌅' },
    { key: 'lunch', label: t('manualEntry.lunch'), icon: '☀️' },
    { key: 'dinner', label: t('manualEntry.dinner'), icon: '🌙' },
    { key: 'snack', label: t('manualEntry.snack'), icon: '🍎' },
  ];

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `${OFF_BASE}?search_terms=${encodeURIComponent(text)}&search_simple=1&action=process&json=1&fields=id,product_name,brands,nutriments&page_size=8&lc=fr`;
        const res = await fetch(url);
        const data = await res.json();
        const products = (data.products || [])
          .filter((p: any) => p.product_name && p.nutriments?.['energy-kcal_100g'])
          .map((p: any) => ({
            id: p.id || p.code || Math.random().toString(),
            name: p.product_name,
            brand: p.brands || '',
            calories: Math.round(p.nutriments['energy-kcal_100g'] || 0),
            protein: Math.round(p.nutriments['proteins_100g'] || 0),
            carbs: Math.round(p.nutriments['carbohydrates_100g'] || 0),
            fat: Math.round(p.nutriments['fat_100g'] || 0),
          }));
        setSearchResults(products);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  const selectSearchResult = (item: SearchResult) => {
    const ratio = parseFloat(portion) / 100 || 1;
    setFoodName(item.name);
    setCalories(String(Math.round(item.calories * ratio)));
    setProtein(String(Math.round(item.protein * ratio)));
    setCarbs(String(Math.round(item.carbs * ratio)));
    setFat(String(Math.round(item.fat * ratio)));
    setSearchResults([]);
    setQuery('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSave = async () => {
    if (!foodName.trim()) {
      Alert.alert(t('common.error'), t('manualEntry.errorName'));
      return;
    }
    if (!calories || isNaN(Number(calories))) {
      Alert.alert(t('common.error'), t('manualEntry.errorCalories'));
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/meals/manual`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            food_name: foodName.trim(),
            portion_g: parseFloat(portion) || 100,
            calories: parseFloat(calories) || 0,
            protein: parseFloat(protein) || 0,
            carbs: parseFloat(carbs) || 0,
            fat: parseFloat(fat) || 0,
            meal_type: mealType,
          }),
        }
      );
      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✅', t('manualEntry.saved'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        throw new Error('server error');
      }
    } catch {
      Alert.alert(t('common.error'), t('manualEntry.errorNetwork'));
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [styles.input, {
    backgroundColor: COLORS.cardBackground,
    color: COLORS.textPrimary,
    borderColor: COLORS.border,
  }];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>{t('manualEntry.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Search */}
          <View style={[styles.section, { backgroundColor: COLORS.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>
              🔍 {t('manualEntry.searchFood')}
            </Text>
            <View style={[styles.searchBar, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
              <Ionicons name="search-outline" size={18} color={COLORS.textLight} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: COLORS.textPrimary }]}
                value={query}
                onChangeText={handleSearch}
                placeholder={t('manualEntry.searchPlaceholder')}
                placeholderTextColor={COLORS.textLight}
                returnKeyType="search"
              />
              {searching && <ActivityIndicator size="small" color={COLORS.secondary} />}
              {query.length > 0 && !searching && (
                <TouchableOpacity onPress={() => { setQuery(''); setSearchResults([]); }}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View style={[styles.resultsContainer, { borderColor: COLORS.border }]}>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.resultItem, { borderBottomColor: COLORS.border }]}
                    onPress={() => selectSearchResult(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.resultName, { color: COLORS.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                      {item.brand ? <Text style={[styles.resultBrand, { color: COLORS.textSecondary }]}>{item.brand}</Text> : null}
                    </View>
                    <View style={styles.resultMacros}>
                      <Text style={[styles.resultCal, { color: COLORS.secondary }]}>{item.calories} kcal</Text>
                      <Text style={[styles.resultPer, { color: COLORS.textLight }]}>/ 100g</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {query.length >= 2 && !searching && searchResults.length === 0 && (
              <Text style={[styles.noResults, { color: COLORS.textLight }]}>{t('manualEntry.noResults')}</Text>
            )}
          </View>

          {/* Separator */}
          <View style={styles.orContainer}>
            <View style={[styles.orLine, { backgroundColor: COLORS.border }]} />
            <Text style={[styles.orText, { color: COLORS.textSecondary }]}>{t('manualEntry.orEnterManually')}</Text>
            <View style={[styles.orLine, { backgroundColor: COLORS.border }]} />
          </View>

          {/* Manual form */}
          <View style={[styles.section, { backgroundColor: COLORS.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>✏️ {t('manualEntry.title')}</Text>

            {/* Food name */}
            <Text style={[styles.label, { color: COLORS.textSecondary }]}>{t('manualEntry.foodName')}</Text>
            <TextInput
              style={inputStyle}
              value={foodName}
              onChangeText={setFoodName}
              placeholder={t('manualEntry.foodNamePlaceholder')}
              placeholderTextColor={COLORS.textLight}
            />

            {/* Portion */}
            <Text style={[styles.label, { color: COLORS.textSecondary }]}>{t('manualEntry.portion')}</Text>
            <TextInput
              style={inputStyle}
              value={portion}
              onChangeText={setPortion}
              placeholder={t('manualEntry.portionPlaceholder')}
              placeholderTextColor={COLORS.textLight}
              keyboardType="decimal-pad"
            />

            {/* Macros grid */}
            <View style={styles.macroGrid}>
              <View style={styles.macroCell}>
                <Text style={[styles.label, { color: COLORS.textSecondary }]}>🔥 {t('manualEntry.calories')}</Text>
                <TextInput style={inputStyle} value={calories} onChangeText={setCalories} placeholder="0" placeholderTextColor={COLORS.textLight} keyboardType="decimal-pad" />
              </View>
              <View style={styles.macroCell}>
                <Text style={[styles.label, { color: COLORS.textSecondary }]}>💪 {t('manualEntry.protein')}</Text>
                <TextInput style={inputStyle} value={protein} onChangeText={setProtein} placeholder="0" placeholderTextColor={COLORS.textLight} keyboardType="decimal-pad" />
              </View>
              <View style={styles.macroCell}>
                <Text style={[styles.label, { color: COLORS.textSecondary }]}>🌾 {t('manualEntry.carbs')}</Text>
                <TextInput style={inputStyle} value={carbs} onChangeText={setCarbs} placeholder="0" placeholderTextColor={COLORS.textLight} keyboardType="decimal-pad" />
              </View>
              <View style={styles.macroCell}>
                <Text style={[styles.label, { color: COLORS.textSecondary }]}>🥑 {t('manualEntry.fat')}</Text>
                <TextInput style={inputStyle} value={fat} onChangeText={setFat} placeholder="0" placeholderTextColor={COLORS.textLight} keyboardType="decimal-pad" />
              </View>
            </View>
          </View>

          {/* Meal type */}
          <View style={[styles.section, { backgroundColor: COLORS.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>🍽️ {t('manualEntry.mealType')}</Text>
            <View style={styles.mealTypeRow}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.mealTypeBtn,
                    { backgroundColor: COLORS.background, borderColor: COLORS.border },
                    mealType === type.key && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
                  ]}
                  onPress={() => setMealType(type.key)}
                >
                  <Text style={styles.mealTypeIcon}>{type.icon}</Text>
                  <Text style={[styles.mealTypeLabel, { color: mealType === type.key ? '#fff' : COLORS.textSecondary }]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: COLORS.secondary }, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.saveBtnText}>{t('manualEntry.save')}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: SPACING.md, paddingBottom: 40 },
  section: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: 15 },
  resultsContainer: {
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  resultName: { fontSize: 14, fontWeight: '500' },
  resultBrand: { fontSize: 12, marginTop: 2 },
  resultMacros: { alignItems: 'flex-end', marginLeft: SPACING.sm },
  resultCal: { fontSize: 14, fontWeight: '700' },
  resultPer: { fontSize: 11 },
  noResults: { textAlign: 'center', paddingVertical: SPACING.sm, fontSize: 13 },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  orLine: { flex: 1, height: 1 },
  orText: { marginHorizontal: SPACING.md, fontSize: 12 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6, marginTop: SPACING.sm },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 4,
  },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.xs },
  macroCell: { width: '48%' },
  mealTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  mealTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1.5,
    gap: 6,
  },
  mealTypeIcon: { fontSize: 16 },
  mealTypeLabel: { fontSize: 13, fontWeight: '500' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.medium,
    marginTop: SPACING.sm,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
