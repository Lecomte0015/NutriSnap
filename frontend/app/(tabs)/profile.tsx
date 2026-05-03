import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS } from '../../src/constants/colors';
import { useStore } from '../../src/store/useStore';
import { useColors } from '../../src/hooks/useColors';
import { Card, Button } from '../../src/components';
import { supabase } from '../../src/lib/supabase';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function ProfileScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const { user, profile, subscription, language, setLanguage, reset } = useStore();
  const t = useTranslation();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLanguageChange = async (code: 'en' | 'fr' | 'de' | 'it') => {
    setLanguage(code);
    setShowLanguagePicker(false);
    // Persist to backend so profile stays in sync
    if (user) {
      fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/profiles/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: code }),
      }).catch(() => {});
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    // Clear local state immediately — don't wait for network
    reset();
    router.replace('/(auth)/welcome');
    // Fire signOut in background (best-effort, non-blocking)
    supabase.auth.signOut().catch(() => {});
  };

  const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  ] as const;

  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'lose_weight': return t('onboarding.goalLoseWeight');
      case 'maintain': return t('onboarding.goalMaintain');
      case 'gain_muscle': return t('onboarding.goalGainMuscle');
      default: return goal;
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return { text: t('profile.gratuit'), color: COLORS.textSecondary };
    if (subscription.status === 'trial') return { text: t('profile.essaiGratuit'), color: COLORS.success };
    if (subscription.status === 'active') return { text: t('profile.premium'), color: COLORS.secondary };
    return { text: t('profile.expire'), color: COLORS.error };
  };

  const subscriptionStatus = getSubscriptionStatus();

  const getDisplayName = () => {
    if (profile?.first_name) return profile.first_name;
    return user?.email?.split('@')[0] || t('dialogs.user');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('profile.title')}</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => router.push('/edit-profile')}
            >
              {profile?.photo_url ? (
                <Image source={{ uri: profile.photo_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.border }]}>
                  <Ionicons name="person" size={40} color={COLORS.textLight} />
                </View>
              )}
              <View style={[styles.editIconContainer, { backgroundColor: COLORS.secondary, borderColor: COLORS.cardBackground }]}>
                <Ionicons name="pencil" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: COLORS.textPrimary }]}>{getDisplayName()}</Text>
              {profile?.last_name && (
                <Text style={[styles.userLastName, { color: COLORS.textSecondary }]}>{profile.last_name}</Text>
              )}
              <View style={[styles.subscriptionBadge, { backgroundColor: subscriptionStatus.color }]}>
                <Text style={styles.subscriptionText}>{subscriptionStatus.text}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editProfileButton, { backgroundColor: COLORS.background }]}
            onPress={() => router.push('/edit-profile')}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.secondary} />
            <Text style={[styles.editProfileText, { color: COLORS.secondary }]}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        </Card>

        {/* Personal Info */}
        <Card style={styles.infoCard}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('profile.personalInfo')}</Text>

          {[
            { icon: 'calendar-outline', label: t('onboarding.age'), value: `${profile?.age || '-'} ${t('onboarding.ageUnit')}` },
            { icon: 'fitness-outline', label: t('onboarding.weight'), value: `${profile?.weight || '-'} ${t('onboarding.weightUnit')}` },
            { icon: 'resize-outline', label: t('onboarding.height'), value: `${profile?.height || '-'} ${t('onboarding.heightUnit')}` },
            { icon: 'trophy-outline', label: t('onboarding.goal'), value: getGoalText(profile?.goal || '') },
            { icon: 'flame-outline', label: t('dashboard.calories'), value: `${profile?.daily_calories || '-'} kcal` },
          ].map((row, i) => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: COLORS.border }]}>
              <Ionicons name={row.icon as any} size={20} color={COLORS.textSecondary} />
              <Text style={[styles.infoLabel, { color: COLORS.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: COLORS.textPrimary }]}>{row.value}</Text>
            </View>
          ))}
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('profile.settings')}</Text>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: COLORS.border }]} onPress={() => router.push('/achievements')}>
            <View style={styles.settingLeft}>
              <Ionicons name="trophy-outline" size={20} color={COLORS.secondary} />
              <Text style={[styles.settingText, { color: COLORS.textPrimary }]}>{t('profile.achievements')}</Text>
            </View>
            <View style={styles.settingRight}>
              <View style={[styles.newBadge, { backgroundColor: COLORS.success }]}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: COLORS.border }]} onPress={() => router.push('/coach')}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubbles-outline" size={20} color={COLORS.secondary} />
              <Text style={[styles.settingText, { color: COLORS.textPrimary }]}>{t('profile.aiCoach')}</Text>
            </View>
            <View style={styles.settingRight}>
              <View style={[styles.newBadge, { backgroundColor: COLORS.secondary }]}>
                <Text style={styles.badgeText}>PRO</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: COLORS.border }]} onPress={() => router.push('/settings')}>
            <View style={styles.settingLeft}>
              <Ionicons name="settings-outline" size={20} color={COLORS.secondary} />
              <Text style={[styles.settingText, { color: COLORS.textPrimary }]}>{t('profile.editSettings')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: showLanguagePicker ? 'transparent' : COLORS.border }]}
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={20} color={COLORS.secondary} />
              <Text style={[styles.settingText, { color: COLORS.textPrimary }]}>{t('settings.language')}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: COLORS.textSecondary }]}>
                {LANGUAGES.find(l => l.code === language)?.flag} {LANGUAGES.find(l => l.code === language)?.label}
              </Text>
              <Ionicons name={showLanguagePicker ? 'chevron-up' : 'chevron-forward'} size={20} color={COLORS.textLight} />
            </View>
          </TouchableOpacity>
          {showLanguagePicker && (
            <View style={[styles.languagePicker, { borderBottomColor: COLORS.border }]}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    { backgroundColor: COLORS.background },
                    language === lang.code && { backgroundColor: COLORS.secondary },
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[styles.languageLabel, { color: language === lang.code ? '#FFFFFF' : COLORS.textPrimary }]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: COLORS.border }]} onPress={() => router.push('/paywall-new')}>
            <View style={styles.settingLeft}>
              <Ionicons name="diamond-outline" size={20} color={COLORS.secondary} />
              <Text style={[styles.settingText, { color: COLORS.textPrimary }]}>{t('profile.subscription')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: COLORS.border }]} onPress={() => router.push('/notifications')}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.secondary} />
              <Text style={[styles.settingText, { color: COLORS.textPrimary }]}>{t('settings.notifications')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: COLORS.border }]} onPress={() => router.push('/help')}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={20} color={COLORS.secondary} />
              <Text style={[styles.settingText, { color: COLORS.textPrimary }]}>{t('profile.help')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: 'transparent' }]} onPress={() => router.push('/about')}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.secondary} />
              <Text style={[styles.settingText, { color: COLORS.textPrimary }]}>{t('profile.about')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title={t('auth.logout')}
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />

        <Text style={[styles.versionText, { color: COLORS.textLight }]}>NutriSnap v1.0.0</Text>
      </ScrollView>

      {/* Logout confirmation modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: COLORS.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: COLORS.textPrimary }]}>{t('dialogs.logoutTitle')}</Text>
            <Text style={[styles.modalMessage, { color: COLORS.textSecondary }]}>{t('dialogs.logoutMsg')}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel, { borderColor: COLORS.border }]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: COLORS.textPrimary }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm, { backgroundColor: COLORS.error }]}
                onPress={confirmLogout}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>{t('common.yes')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileCard: {
    marginBottom: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  userLastName: {
    fontSize: 16,
    marginTop: 2,
  },
  subscriptionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  subscriptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  infoCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    marginLeft: SPACING.sm,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsCard: {
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 15,
    marginLeft: SPACING.sm,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  logoutButton: {
    marginTop: SPACING.md,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: SPACING.lg,
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  languagePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  languageFlag: {
    fontSize: 18,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalBtnCancel: {
    borderWidth: 1,
  },
  modalBtnConfirm: {},
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
