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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { Button, Mascot } from '../src/components';
import { useStore } from '../src/store/useStore';
import i18n from '../src/i18n';

const { width } = Dimensions.get('window');

const STEPS = ['welcome', 'age', 'weight', 'height', 'goal', 'language'];

type Goal = 'lose_weight' | 'maintain' | 'gain_muscle';
type Language = 'fr' | 'de' | 'it';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, setProfile, setOnboardingCompleted, setLanguage } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [language, setSelectedLanguage] = useState<Language>('fr');
  
  const progress = useSharedValue(0);
  const t = i18n.t.bind(i18n);

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

    if (!age || !weight || !height) {
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
            age: parseInt(age),
            weight: parseFloat(weight),
            height: parseFloat(height),
            goal,
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
            <Mascot mood="excited" size={180} />
            <Text style={styles.stepTitle}>{t('onboarding.welcome')}</Text>
            <Text style={styles.stepSubtitle}>{t('onboarding.welcomeSubtitle')}</Text>
          </View>
        );
        
      case 'age':
        return (
          <View style={styles.stepContent}>
            <Mascot mood="happy" size={140} />
            <Text style={styles.stepTitle}>{t('onboarding.age')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numberInput}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="25"
                placeholderTextColor={COLORS.textLight}
                maxLength={3}
              />
              <Text style={styles.unitText}>{t('onboarding.ageUnit')}</Text>
            </View>
          </View>
        );
        
      case 'weight':
        return (
          <View style={styles.stepContent}>
            <Mascot mood="thinking" size={140} />
            <Text style={styles.stepTitle}>{t('onboarding.weight')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numberInput}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="70"
                placeholderTextColor={COLORS.textLight}
                maxLength={5}
              />
              <Text style={styles.unitText}>{t('onboarding.weightUnit')}</Text>
            </View>
          </View>
        );
        
      case 'height':
        return (
          <View style={styles.stepContent}>
            <Mascot mood="idle" size={140} />
            <Text style={styles.stepTitle}>{t('onboarding.height')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numberInput}
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
                placeholder="175"
                placeholderTextColor={COLORS.textLight}
                maxLength={3}
              />
              <Text style={styles.unitText}>{t('onboarding.heightUnit')}</Text>
            </View>
          </View>
        );
        
      case 'goal':
        return (
          <View style={styles.stepContent}>
            <Mascot mood="happy" size={140} />
            <Text style={styles.stepTitle}>{t('onboarding.goal')}</Text>
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
                    goal === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setGoal(option.value as Goal)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={goal === option.value ? COLORS.textWhite : COLORS.secondary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      goal === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 'language':
        return (
          <View style={styles.stepContent}>
            <Mascot mood="excited" size={140} />
            <Text style={styles.stepTitle}>{t('onboarding.language')}</Text>
            <View style={styles.optionsContainer}>
              {[
                { value: 'fr', label: 'Français', flag: '🇫🇷' },
                { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
                { value: 'it', label: 'Italiano', flag: '🇮🇹' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    language === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedLanguage(option.value as Language);
                    i18n.locale = option.value;
                  }}
                >
                  <Text style={styles.flagText}>{option.flag}</Text>
                  <Text
                    style={[
                      styles.optionText,
                      language === option.value && styles.optionTextActive,
                    ]}
                  >
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
      case 'age': return age.length > 0;
      case 'weight': return weight.length > 0;
      case 'height': return height.length > 0;
      default: return true;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
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
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
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
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
    color: COLORS.secondary,
    textAlign: 'center',
    minWidth: 120,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.secondary,
    paddingBottom: SPACING.sm,
  },
  unitText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  optionsContainer: {
    width: '100%',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  optionButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  optionTextActive: {
    color: COLORS.textWhite,
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
