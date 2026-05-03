import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { Button, Card, MacroBar, MascotAnimated } from '../src/components';
import { Celebration } from '../src/components/Celebration';
import { useStore } from '../src/store/useStore';
import { useMascotController } from '../src/hooks/useMascotController';
import { AnalysisResult, MascotMood } from '../src/types';
import { useTranslation } from '../src/hooks/useTranslation';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const COLORS = useColors();
  const { user, profile, addMeal, addXp, mascotMood } = useStore();
  const { triggerReaction } = useMascotController();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const hasUpdatedMascot = useRef(false);
  const t = useTranslation();

  const rawAnalysis: AnalysisResult | null = params.analysis
    ? JSON.parse(params.analysis as string)
    : null;
  const imageBase64 = params.image as string;

  const [editedCalories, setEditedCalories] = useState(rawAnalysis?.calories?.toString() || '');
  const [editedProtein, setEditedProtein] = useState(rawAnalysis?.macros?.protein?.toString() || '');
  const [editedCarbs, setEditedCarbs] = useState(rawAnalysis?.macros?.carbs?.toString() || '');
  const [editedFat, setEditedFat] = useState(rawAnalysis?.macros?.fat?.toString() || '');

  const analysis: AnalysisResult | null = rawAnalysis ? {
    ...rawAnalysis,
    calories: parseInt(editedCalories) || rawAnalysis.calories,
    macros: {
      protein: parseFloat(editedProtein) || rawAnalysis.macros.protein,
      carbs: parseFloat(editedCarbs) || rawAnalysis.macros.carbs,
      fat: parseFloat(editedFat) || rawAnalysis.macros.fat,
    },
  } : null;

  useEffect(() => {
    if (analysis && !hasUpdatedMascot.current) {
      hasUpdatedMascot.current = true;
      triggerReaction(analysis.score, profile);
      if (analysis.score >= 8) {
        setTimeout(() => setShowCelebration(true), 600);
      }
    }
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return COLORS.scoreExcellent;
    if (score >= 6) return COLORS.scoreGood;
    if (score >= 4) return COLORS.scoreAverage;
    return COLORS.scorePoor;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return t('analysis.excellent');
    if (score >= 6) return t('analysis.good');
    if (score >= 4) return t('analysis.average');
    return t('analysis.poor');
  };

  const saveMeal = async () => {
    if (!analysis || !user || saved) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/meals`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            image_base64: imageBase64,
            foods: analysis.foods,
            calories: analysis.calories,
            protein: analysis.macros.protein,
            carbs: analysis.macros.carbs,
            fat: analysis.macros.fat,
            score: analysis.score,
            feedback: analysis.feedback,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        addMeal(data.meal);
        setSaved(true);

        // Award XP based on score
        const xpGained = analysis.score >= 8 ? 30 : analysis.score >= 6 ? 20 : 10;
        addXp(xpGained);

        Alert.alert(
          t('common.success'),
          t('analysis.savedXp', { xp: xpGained }),
          [{ text: t('common.done'), onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        const error = await response.json();
        Alert.alert(
          t('common.error'),
          error.detail || t('errors.generic'),
          [
            { text: t('errors.tryAgain'), onPress: saveMeal },
            { text: t('common.cancel'), style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert(
        t('common.error'),
        t('errors.network'),
        [
          { text: 'Réessayer', onPress: saveMeal },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  if (!analysis) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: COLORS.textSecondary }]}>{t('errors.generic')}</Text>
          <Button title={t('common.back')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const scoreColor = getScoreColor(analysis.score);
  const displayMood: MascotMood = mascotMood || (
    analysis.score > 9 ? 'celebrating' :
    analysis.score >= 8 ? 'excited' :
    analysis.score >= 6 ? 'happy' :
    analysis.score >= 4 ? 'warning' : 'sad'
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Confettis sur les bons scores */}
      <Celebration
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('analysis.result')}</Text>
          <TouchableOpacity
            style={styles.editToggle}
            onPress={() => setEditMode(!editMode)}
          >
            <Ionicons
              name={editMode ? 'checkmark-circle' : 'pencil'}
              size={22}
              color={editMode ? COLORS.success : COLORS.textSecondary}
            />
            <Text style={[styles.editToggleText, { color: COLORS.textSecondary }, editMode && { color: COLORS.success }]}>
              {editMode ? t('analysis.validate') : t('analysis.correct')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {imageBase64 && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
              style={styles.mealImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Score Card */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
              <Text style={styles.scoreValue}>{rawAnalysis?.score}</Text>
              <Text style={styles.scoreMax}>/10</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={[styles.scoreLabel, { color: COLORS.textPrimary }]}>{getScoreLabel(rawAnalysis?.score || 0)}</Text>
              <Text style={[styles.scoreSubtext, { color: COLORS.textSecondary }]}>{t('analysis.score')}</Text>
            </View>
          </View>
        </Card>

        {/* Mascot Feedback */}
        <Card style={styles.feedbackCard}>
          <View style={styles.feedbackContent}>
            <MascotAnimated mood={displayMood} size={90} />
            <View style={styles.feedbackTextContainer}>
              <Text style={[styles.feedbackText, { color: COLORS.textPrimary }]}>{analysis.feedback}</Text>
            </View>
          </View>
        </Card>

        {/* Foods Detected */}
        <Card style={styles.foodsCard}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('analysis.detected')}</Text>
          <View style={styles.foodsList}>
            {analysis.foods.map((food, index) => (
              <View key={index} style={styles.foodItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                <Text style={[styles.foodText, { color: COLORS.textPrimary }]}>{food}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Macros Card — éditable */}
        <Card style={styles.macrosCard}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('analysis.macros')}</Text>

          {editMode ? (
            <View style={styles.editGrid}>
              <View style={[styles.editItem, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                <Text style={[styles.editLabel, { color: COLORS.textSecondary }]}>{t('dashboard.calories')}</Text>
                <TextInput
                  style={[styles.editInput, { color: COLORS.textPrimary }]}
                  value={editedCalories}
                  onChangeText={setEditedCalories}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <Text style={[styles.editUnit, { color: COLORS.textSecondary }]}>kcal</Text>
              </View>
              <View style={[styles.editItem, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                <Text style={[styles.editLabel, { color: COLORS.textSecondary }]}>{t('dashboard.protein')}</Text>
                <TextInput
                  style={[styles.editInput, { color: COLORS.textPrimary }]}
                  value={editedProtein}
                  onChangeText={setEditedProtein}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                />
                <Text style={[styles.editUnit, { color: COLORS.textSecondary }]}>g</Text>
              </View>
              <View style={[styles.editItem, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                <Text style={[styles.editLabel, { color: COLORS.textSecondary }]}>{t('dashboard.carbs')}</Text>
                <TextInput
                  style={[styles.editInput, { color: COLORS.textPrimary }]}
                  value={editedCarbs}
                  onChangeText={setEditedCarbs}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                />
                <Text style={[styles.editUnit, { color: COLORS.textSecondary }]}>g</Text>
              </View>
              <View style={[styles.editItem, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                <Text style={[styles.editLabel, { color: COLORS.textSecondary }]}>{t('dashboard.fat')}</Text>
                <TextInput
                  style={[styles.editInput, { color: COLORS.textPrimary }]}
                  value={editedFat}
                  onChangeText={setEditedFat}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                />
                <Text style={[styles.editUnit, { color: COLORS.textSecondary }]}>g</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.caloriesRow}>
                <Ionicons name="flame" size={24} color={COLORS.warning} />
                <Text style={[styles.caloriesValue, { color: COLORS.textPrimary }]}>{analysis.calories}</Text>
                <Text style={[styles.caloriesUnit, { color: COLORS.textSecondary }]}>kcal</Text>
              </View>
              <MacroBar
                label={t('dashboard.protein')}
                value={analysis.macros.protein}
                max={100}
                color={COLORS.protein}
              />
              <MacroBar
                label={t('dashboard.carbs')}
                value={analysis.macros.carbs}
                max={200}
                color={COLORS.carbs}
              />
              <MacroBar
                label={t('dashboard.fat')}
                value={analysis.macros.fat}
                max={80}
                color={COLORS.fat}
              />
            </>
          )}
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={t('analysis.retake')}
            onPress={() => router.replace('/camera')}
            variant="outline"
            style={styles.actionButton}
            disabled={saving}
          />
          <Button
            title={saved ? t('common.done') : t('analysis.saveToHistory')}
            onPress={saved ? () => router.replace('/(tabs)') : saveMeal}
            style={styles.actionButton}
            loading={saving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  editToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: SPACING.sm,
  },
  editToggleText: {
    fontSize: 14,
  },
  imageContainer: {
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  scoreCard: {
    marginBottom: SPACING.md,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreMax: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  scoreInfo: {
    marginLeft: SPACING.md,
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreSubtext: {
    fontSize: 14,
  },
  feedbackCard: {
    marginBottom: SPACING.md,
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 22,
  },
  foodsCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  foodsList: {
    gap: SPACING.sm,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodText: {
    fontSize: 15,
    marginLeft: SPACING.sm,
    textTransform: 'capitalize',
  },
  macrosCard: {
    marginBottom: SPACING.md,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: BORDER_RADIUS.sm,
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  caloriesUnit: {
    fontSize: 16,
    marginLeft: SPACING.xs,
  },
  editGrid: {
    gap: SPACING.sm,
  },
  editItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
  },
  editLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  editInput: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: 60,
  },
  editUnit: {
    fontSize: 13,
    marginLeft: 4,
    width: 30,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
});
