import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { Button, Card, MacroBar, Mascot } from '../src/components';
import { useStore } from '../src/store/useStore';
import { AnalysisResult, MascotMood } from '../src/types';
import i18n from '../src/i18n';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, addMeal, setMascotMood, setMascotMessage } = useStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const hasUpdatedMascot = useRef(false);
  const t = i18n.t.bind(i18n);

  const analysis: AnalysisResult | null = params.analysis
    ? JSON.parse(params.analysis as string)
    : null;
  const imageBase64 = params.image as string;

  // Update mascot only once when component mounts
  useEffect(() => {
    if (analysis && !hasUpdatedMascot.current) {
      hasUpdatedMascot.current = true;
      
      let mood: MascotMood;
      let message: string;

      if (analysis.score >= 8) {
        mood = 'excited';
        message = t('mascot.greatMeal');
      } else if (analysis.score >= 6) {
        mood = 'happy';
        message = t('mascot.goodMeal');
      } else if (analysis.score >= 4) {
        mood = 'warning';
        message = t('mascot.averageMeal');
      } else {
        mood = 'sad';
        message = t('mascot.poorMeal');
      }

      setMascotMood(mood);
      setMascotMessage(message);
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
        Alert.alert(
          t('common.success'),
          'Repas enregistré avec succès !',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        const error = await response.json();
        Alert.alert(t('common.error'), error.detail || t('errors.generic'));
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert(t('common.error'), t('errors.network'));
    } finally {
      setSaving(false);
    }
  };

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('errors.generic')}</Text>
          <Button title={t('common.back')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const scoreColor = getScoreColor(analysis.score);
  const mood: MascotMood = analysis.score >= 8 ? 'excited' : analysis.score >= 6 ? 'happy' : analysis.score >= 4 ? 'warning' : 'sad';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('analysis.result')}</Text>
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
              <Text style={styles.scoreValue}>{analysis.score}</Text>
              <Text style={styles.scoreMax}>/10</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreLabel}>{getScoreLabel(analysis.score)}</Text>
              <Text style={styles.scoreSubtext}>{t('analysis.score')}</Text>
            </View>
          </View>
        </Card>

        {/* Mascot Feedback */}
        <Card style={styles.feedbackCard}>
          <View style={styles.feedbackContent}>
            <Mascot mood={mood} size={70} />
            <View style={styles.feedbackTextContainer}>
              <Text style={styles.feedbackText}>{analysis.feedback}</Text>
            </View>
          </View>
        </Card>

        {/* Foods Detected */}
        <Card style={styles.foodsCard}>
          <Text style={styles.sectionTitle}>{t('analysis.detected')}</Text>
          <View style={styles.foodsList}>
            {analysis.foods.map((food, index) => (
              <View key={index} style={styles.foodItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                <Text style={styles.foodText}>{food}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Macros Card */}
        <Card style={styles.macrosCard}>
          <Text style={styles.sectionTitle}>{t('analysis.macros')}</Text>
          
          <View style={styles.caloriesRow}>
            <Ionicons name="flame" size={24} color={COLORS.warning} />
            <Text style={styles.caloriesValue}>{analysis.calories}</Text>
            <Text style={styles.caloriesUnit}>kcal</Text>
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
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
    color: COLORS.textWhite,
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
    color: COLORS.textPrimary,
  },
  scoreSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  foodsCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  caloriesUnit: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
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
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
});
