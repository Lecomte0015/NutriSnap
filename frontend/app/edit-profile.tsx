import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useStore } from '../src/store/useStore';
import { Button, Card } from '../src/components';
import i18n from '../src/i18n';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, profile, setProfile, setLanguage } = useStore();
  const t = i18n.t.bind(i18n);

  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [goal, setGoal] = useState(profile?.goal || 'maintain');
  const [language, setSelectedLanguage] = useState(profile?.language || 'fr');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'Nous avons besoin de la permission caméra');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'Nous avons besoin de la permission galerie');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
          base64: true,
        });
      }

      if (!result.canceled && result.assets[0]?.base64) {
        setPhotoPreview(result.assets[0].base64);
        // Upload photo immediately
        await uploadPhoto(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  };

  const uploadPhoto = async (base64: string) => {
    if (!user) return;
    
    setUploadingPhoto(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/upload-photo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            photo_base64: base64,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPhotoUrl(data.photo_url);
        // Update profile in store
        if (profile) {
          setProfile({ ...profile, photo_url: data.photo_url });
        }
      } else {
        const error = await response.json();
        Alert.alert(t('common.error'), error.detail || 'Erreur lors de l\'upload de la photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert(t('common.error'), t('errors.network'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Photo de profil',
      'Choisissez une option',
      [
        { text: 'Prendre une photo', onPress: () => pickImage(true) },
        { text: 'Choisir depuis la galerie', onPress: () => pickImage(false) },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!user || !firstName.trim()) {
      Alert.alert(t('common.error'), 'Le prénom est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/profiles/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim() || null,
            photo_url: photoUrl || null,
            age: parseInt(age) || profile?.age,
            weight: parseFloat(weight) || profile?.weight,
            height: parseFloat(height) || profile?.height,
            goal,
            language,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        i18n.locale = language;
        setLanguage(language as 'fr' | 'de' | 'it');
        Alert.alert(
          t('common.success'),
          'Profil mis à jour avec succès !',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        const error = await response.json();
        Alert.alert(t('common.error'), error.detail || t('errors.generic'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(t('common.error'), t('errors.network'));
    } finally {
      setLoading(false);
    }
  };

  const getGoalText = (goalValue: string) => {
    switch (goalValue) {
      case 'lose_weight': return t('onboarding.goalLoseWeight');
      case 'maintain': return t('onboarding.goalMaintain');
      case 'gain_muscle': return t('onboarding.goalGainMuscle');
      default: return goalValue;
    }
  };

  // Get photo source
  const getPhotoSource = () => {
    if (photoPreview) {
      return { uri: `data:image/jpeg;base64,${photoPreview}` };
    }
    if (photoUrl) {
      return { uri: photoUrl };
    }
    return null;
  };

  const photoSource = getPhotoSource();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoContainer} onPress={showImageOptions} disabled={uploadingPhoto}>
              {photoSource ? (
                <Image
                  source={photoSource}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="person" size={50} color={COLORS.textLight} />
                </View>
              )}
              {uploadingPhoto ? (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color={COLORS.textWhite} />
                </View>
              ) : (
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={18} color={COLORS.textWhite} />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoHint}>
              {uploadingPhoto ? 'Upload en cours...' : 'Appuyez pour changer la photo'}
            </Text>
          </View>

          {/* Form */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Votre prénom"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Votre nom (optionnel)"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>{t('onboarding.age')}</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="25"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>{t('onboarding.weight')} (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="70"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('onboarding.height')} (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="175"
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
              />
            </View>
          </Card>

          {/* Goal Section */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>{t('onboarding.goal')}</Text>
            {[
              { value: 'lose_weight', icon: 'trending-down' },
              { value: 'maintain', icon: 'remove' },
              { value: 'gain_muscle', icon: 'trending-up' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  goal === option.value && styles.optionButtonActive,
                ]}
                onPress={() => setGoal(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={22}
                  color={goal === option.value ? COLORS.textWhite : COLORS.secondary}
                />
                <Text
                  style={[
                    styles.optionText,
                    goal === option.value && styles.optionTextActive,
                  ]}
                >
                  {getGoalText(option.value)}
                </Text>
                {goal === option.value && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.textWhite} />
                )}
              </TouchableOpacity>
            ))}
          </Card>

          {/* Language Section */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
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
                onPress={() => setSelectedLanguage(option.value as 'fr' | 'de' | 'it')}
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
                {language === option.value && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.textWhite} />
                )}
              </TouchableOpacity>
            ))}
          </Card>

          {/* Save Button */}
          <Button
            title={t('common.save')}
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
            disabled={uploadingPhoto}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHint: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  formCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  optionTextActive: {
    color: COLORS.textWhite,
  },
  flagText: {
    fontSize: 22,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
});
