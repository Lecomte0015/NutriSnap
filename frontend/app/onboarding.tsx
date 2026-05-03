import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { Button, MascotAnimated } from '../src/components';
import { useStore } from '../src/store/useStore';
import i18n from '../src/i18n';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

const STEPS = ['welcome', 'name', 'age', 'weight', 'height', 'goal', 'activity', 'language'];

type Goal = 'lose_weight' | 'maintain' | 'gain_muscle';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
type Language = 'fr' | 'en' | 'de' | 'it';

export default function OnboardingScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const { user, setProfile, setOnboardingCompleted, setLanguage } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [language, setSelectedLanguage] = useState<Language>('fr');
  
  const progress = useSharedValue(0);
  const t = useTranslation();

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  const updateProgress = (step: number) => {
    progress.value = withTiming((step + 1) / STEPS.length, { duration: 300 });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      updateProgress(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      updateProgress(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    if (!firstName.trim() || !age || !weight || !height) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/profiles`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            first_name: firstName.trim(),
            age: parseInt(age),
            weight: parseFloat(weight),
            height: parseFloat(height),
            goal,
            activity_level: activityLevel,
            language,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setOnboardingCompleted(true);
        i18n.locale = language;
        setLanguage(language);
        router.replace('/(tabs)');
      } else {
        const error = await response.json();
        Alert.alert('Erreur', error.detail || 'Erreur lors de la création du profil');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Erreur', 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'welcome':
        return (
          <View style={styles.stepContent}>
            <MascotAnimated mood="excited" size={180} />
            <Text style={[styles.stepTitle, { color: COLORS.textPrimary }]}>{t('onboarding.welcome')}</Text>
            <Text style={[styles.stepSubtitle, { color: COLORS.textSecondary }]}>{t('onboarding.welcomeSubtitle')}</Text>
          </View>
        );

      case 'name':
        return (
          <View style={styles.stepContent}>
            <MascotAnimated mood="happy" size={140} />
            <Text style={[styles.stepTitle, { color: COLORS.textPrimary }]}>{t('onboardingExtra.nameQuestion')}</Text>
            <TextInput
              style={[styles.textInput, { color: COLORS.textPrimary, borderBottomColor: COLORS.secondary }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('onboardingExtra.namePlaceholder')}
              placeholderTextColor={COLORS.textLight}
              autoFocus
              autoCapitalize="words"
            />
          </View>
        );
        
      case 'age':
        return (
          <View style={styles.stepContent}>
            <MascotAnimated mood="happy" size={140} />
            <Text style={[styles.stepTitle, { color: COLORS.textPrimary }]}>{t('onboarding.age')}</Text>
            <View style={styles.inputRow}>
              <TextInput style={[styles.numberInput, { color: COLORS.secondary, borderBottomColor: COLORS.secondary }]} value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="25" placeholderTextColor={COLORS.textLight} maxLength={3} />
              <Text style={[styles.unitText, { color: COLORS.textSecondary }]}>{t('onboarding.ageUnit')}</Text>
            </View>
          </View>
        );

      case 'weight':
        return (
          <View style={styles.stepContent}>
            <MascotAnimated mood="thinking" size={140} />
            <Text style={[styles.stepTitle, { color: COLORS.textPrimary }]}>{t('onboarding.weight')}</Text>
            <View style={styles.inputRow}>
              <TextInput style={[styles.numberInput, { color: COLORS.secondary, borderBottomColor: COLORS.secondary }]} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="70" placeholderTextColor={COLORS.textLight} maxLength={5} />
              <Text style={[styles.unitText, { color: COLORS.textSecondary }]}>{t('onboarding.weightUnit')}</Text>
            </View>
          </View>
        );

      case 'height':
        return (
          <View style={styles.stepContent}>
            <MascotAnimated mood="idle" size={140} />
            <Text style={[styles.stepTitle, { color: COLORS.textPrimary }]}>{t('onboarding.height')}</Text>
            <View style={styles.inputRow}>
              <TextInput style={[styles.numberInput, { color: COLORS.secondary, borderBottomColor: COLORS.secondary }]} value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="175" placeholderTextColor={COLORS.textLight} maxLength={3} />
              <Text style={[styles.unitText, { color: COLORS.textSecondary }]}>{t('onboarding.heightUnit')}</Text>
            </View>
          </View>
        );
        
      case 'goal':
        return (
          <View style={styles.stepContent}>
            <MascotAnimated mood="happy" size={140} />
            <Text style={[styles.stepTitle, { color: COLORS.textPrimary }]}>{t('onboarding.goal')}</Text>
            <View style={styles.optionsContainer}>
              {[
                { value: 'lose_weight', label: t('onboarding.goalLoseWeight'), icon: 'trending-down' },
                { value: 'maintain', label: t('onboarding.goalMaintain'), icon: 'remove' },
                { value: 'gain_muscle', label: t('onboarding.goalGainMuscle'), icon: 'trending-up' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    { backgroundColor: COLORS.cardBackground },
                    goal === option.value && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
                  ]}
                  onPress={() => setGoal(option.value as Goal)}
                >
                  <Ionicons name={option.icon as any} size={24} color={goal === option.value ? '#FFFFFF' : COLORS.secondary} />
                  <Text style={[styles.optionText, { color: COLORS.textPrimary }, goal === option.value && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'activity':
        return (
          <View style={styles.stepContent}>
            <MascotAnimated mood="happy" size={140} />
            <Text style={[styles.stepTitle, { color: COLORS.textPrimary }]}>{t('onboardingExtra.activityLevel')}</Text>
            <Text style={[styles.stepSubtitle, { color: COLORS.textSecondary }]}>{t('onboardingExtra.activitySubtitle')}</Text>
            <View style={styles.optionsContainer}>
              {[
                { value: 'sedentary', label: t('onboardingExtra.sedentary'), desc: t('onboardingExtra.sedentaryDesc'), icon: '🛋️' },
                { value: 'light', label: t('onboardingExtra.light'), desc: t('onboardingExtra.lightDesc'), icon: '🚶' },
                { value: 'moderate', label: t('onboardingExtra.moderate'), desc: t('onboardingExtra.moderateDesc'), icon: '🏃' },
                { value: 'active', label: t('onboardingExtra.active'), desc: t('onboardingExtra.activeDesc'), icon: '🏋️' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    { backgroundColor: COLORS.cardBackground },
                    activityLevel === option.value && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
                  ]}
                  onPress={() => setActivityLevel(option.value as ActivityLevel)}
                >
                  <Text style={styles.flagText}>{option.icon}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.optionText, { color: COLORS.textPrimary }, activityLevel === option.value && styles.optionTextActive]}>
                      {option.label}
                    </Text>
                    <Text style={[{ fontSize: 12, marginTop: 2 }, activityLevel === option.value ? { color: 'rgba(255,255,255,0.8)' } : { color: COLORS.textSecondary }]}>
                      {option.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'language':
        return (
          <View style={styles.stepContent}>
            <MascotAnimated mood="excited" size={140} />
            <Text style={[styles.stepTitle, { color: COLORS.textPrimary }]}>{t('onboarding.language')}</Text>
            <View style={styles.optionsContainer}>
              {[
                { value: 'fr', label: 'Français', flag: '🇫🇷' },
                { value: 'en', label: 'English', flag: '🇬🇧' },
                { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
                { value: 'it', label: 'Italiano', flag: '🇮🇹' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    { backgroundColor: COLORS.cardBackground },
                    language === option.value && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
                  ]}
                  onPress={() => { setSelectedLanguage(option.value as Language); i18n.locale = option.value; }}
                >
                  <Text style={styles.flagText}>{option.flag}</Text>
                  <Text style={[styles.optionText, { color: COLORS.textPrimary }, language === option.value && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (STEPS[currentStep]) {
      case 'name': return firstName.trim().length > 0;
      case 'age': return age.length > 0;
      case 'weight': return weight.length > 0;
      case 'height': return height.length > 0;
      default: return true;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: COLORS.border }]}>
          <Animated.View style={[styles.progressFill, progressStyle, { backgroundColor: COLORS.secondary }]} />
        </View>
      </View>

      {/* Back button */}
      {currentStep > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Next button */}
      <View style={styles.footer}>
        <Button
          title={currentStep === STEPS.length - 1 ? t('onboarding.letsGo') : t('common.next')}
          onPress={nextStep}
          disabled={!canProceed()}
          loading={loading}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
    marginTop: SPACING.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  stepContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  numberInput: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 120,
    borderBottomWidth: 3,
    paddingBottom: SPACING.sm,
  },
  unitText: {
    fontSize: 20,
    marginLeft: SPACING.sm,
  },
  textInput: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    borderBottomWidth: 3,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xl,
  },
  optionsContainer: {
    width: '100%',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  optionButtonActive: {
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: SPACING.md,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  flagText: {
    fontSize: 24,
  },
  footer: {
    padding: SPACING.lg,
  },
  nextButton: {
    width: '100%',
  },
});
