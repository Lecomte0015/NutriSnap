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
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { useStore } from '../src/store/useStore';
import { Button, Card } from '../src/components';
import { useTranslation } from '../src/hooks/useTranslation';

export default function EditProfileScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const { user, profile, setProfile } = useStore();
  const t = useTranslation();

  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [goal, setGoal] = useState(profile?.goal || 'maintain');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('profile.permissionDenied'), t('profile.cameraDenied'));
          return;
        }
        result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('profile.permissionDenied'), t('profile.galleryDenied'));
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
      }
      if (!result.canceled && result.assets[0]?.base64) {
        setPhotoPreview(result.assets[0].base64);
        await uploadPhoto(result.assets[0].base64);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  };

  const uploadPhoto = async (base64: string) => {
    if (!user) return;
    setUploadingPhoto(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/upload-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, photo_base64: base64 }),
      });
      if (response.ok) {
        const data = await response.json();
        setPhotoUrl(data.photo_url);
        if (profile) setProfile({ ...profile, photo_url: data.photo_url });
      } else {
        const error = await response.json();
        Alert.alert(t('common.error'), error.detail || t('profile.uploadError'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.network'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(t('profile.photoTitle'), t('profile.photoOptions'), [
      { text: t('camera.takePhoto'), onPress: () => pickImage(true) },
      { text: t('camera.chooseFromGallery'), onPress: () => pickImage(false) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!user || !firstName.trim()) {
      Alert.alert(t('common.error'), t('profile.firstNameRequired'));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/profiles/${user.id}`, {
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
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        Alert.alert(t('common.success'), t('profile.saveSuccess'), [{ text: t('common.done'), onPress: () => router.back() }]);
      } else {
        const error = await response.json();
        Alert.alert(t('common.error'), error.detail || t('errors.generic'));
      }
    } catch (error) {
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

  const photoSource = photoPreview
    ? { uri: `data:image/jpeg;base64,${photoPreview}` }
    : photoUrl ? { uri: photoUrl } : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>{t('profile.editProfile')}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoContainer} onPress={showImageOptions} disabled={uploadingPhoto}>
              {photoSource ? (
                <Image source={photoSource} style={styles.photo} />
              ) : (
                <View style={[styles.photoPlaceholder, { backgroundColor: COLORS.border }]}>
                  <Ionicons name="person" size={50} color={COLORS.textLight} />
                </View>
              )}
              {uploadingPhoto ? (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : (
                <View style={[styles.cameraIconContainer, { backgroundColor: COLORS.secondary, borderColor: COLORS.background }]}>
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.photoHint, { color: COLORS.textSecondary }]}>
              {uploadingPhoto ? t('profile.uploadingPhoto') : t('profile.photoHint')}
            </Text>
          </View>

          {/* Form */}
          <Card style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('profile.personalInfo')}</Text>

            {[
              { label: t('profile.firstName'), value: firstName, onChange: setFirstName, placeholder: t('profile.firstNamePlaceholder') },
              { label: t('profile.lastName'), value: lastName, onChange: setLastName, placeholder: t('profile.lastNamePlaceholder') },
            ].map((field) => (
              <View key={field.label} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: COLORS.textSecondary }]}>{field.label}</Text>
                <TextInput
                  style={[styles.input, { color: COLORS.textPrimary, backgroundColor: COLORS.background, borderColor: COLORS.border }]}
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            ))}

            <View style={styles.row}>
              {[
                { label: t('onboarding.age'), value: age, onChange: setAge, placeholder: '25', keyboard: 'number-pad' as const },
                { label: `${t('onboarding.weight')} (kg)`, value: weight, onChange: setWeight, placeholder: '70', keyboard: 'decimal-pad' as const },
              ].map((field) => (
                <View key={field.label} style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={[styles.inputLabel, { color: COLORS.textSecondary }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.input, { color: COLORS.textPrimary, backgroundColor: COLORS.background, borderColor: COLORS.border }]}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={field.placeholder}
                    placeholderTextColor={COLORS.textLight}
                    keyboardType={field.keyboard}
                  />
                </View>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: COLORS.textSecondary }]}>{t('onboarding.height')} (cm)</Text>
              <TextInput
                style={[styles.input, { color: COLORS.textPrimary, backgroundColor: COLORS.background, borderColor: COLORS.border }]}
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
            <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('onboarding.goal')}</Text>
            {[
              { value: 'lose_weight', icon: 'trending-down' },
              { value: 'maintain', icon: 'remove' },
              { value: 'gain_muscle', icon: 'trending-up' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  { backgroundColor: COLORS.background, borderColor: COLORS.border },
                  goal === option.value && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
                ]}
                onPress={() => setGoal(option.value)}
              >
                <Ionicons name={option.icon as any} size={22} color={goal === option.value ? '#FFFFFF' : COLORS.secondary} />
                <Text style={[styles.optionText, { color: COLORS.textPrimary }, goal === option.value && { color: '#FFFFFF' }]}>
                  {getGoalText(option.value)}
                </Text>
                {goal === option.value && <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}
          </Card>

          <Button title={t('common.save')} onPress={handleSave} loading={loading} style={styles.saveButton} disabled={uploadingPhoto} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  placeholder: { width: 44 },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  photoSection: { alignItems: 'center', marginBottom: SPACING.lg },
  photoContainer: { position: 'relative' },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  cameraIconContainer: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  photoHint: { marginTop: SPACING.sm, fontSize: 14 },
  formCard: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: SPACING.md },
  inputGroup: { marginBottom: SPACING.md },
  inputLabel: { fontSize: 14, marginBottom: SPACING.xs },
  input: { borderRadius: BORDER_RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: 16, borderWidth: 1 },
  row: { flexDirection: 'row', gap: SPACING.md },
  halfInput: { flex: 1 },
  optionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.sm, borderWidth: 1 },
  optionText: { flex: 1, fontSize: 15, marginLeft: SPACING.sm },
  flagText: { fontSize: 22 },
  saveButton: { marginTop: SPACING.md },
});
