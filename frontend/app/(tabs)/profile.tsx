import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../src/constants/colors';
import { useStore } from '../../src/store/useStore';
import { Card, Button } from '../../src/components';
import { supabase } from '../../src/lib/supabase';
import i18n from '../../src/i18n';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, subscription, setLanguage, reset } = useStore();
  const t = i18n.t.bind(i18n);

  const handleLogout = async () => {
    Alert.alert(
      t('auth.logout'),
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            reset();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      t('settings.language'),
      'Choisissez votre langue',
      [
        {
          text: 'Français',
          onPress: () => {
            i18n.locale = 'fr';
            setLanguage('fr');
          },
        },
        {
          text: 'Deutsch',
          onPress: () => {
            i18n.locale = 'de';
            setLanguage('de');
          },
        },
        {
          text: 'Italiano',
          onPress: () => {
            i18n.locale = 'it';
            setLanguage('it');
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'lose_weight': return t('onboarding.goalLoseWeight');
      case 'maintain': return t('onboarding.goalMaintain');
      case 'gain_muscle': return t('onboarding.goalGainMuscle');
      default: return goal;
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return { text: 'Gratuit', color: COLORS.textSecondary };
    if (subscription.status === 'trial') return { text: 'Essai gratuit', color: COLORS.success };
    if (subscription.status === 'active') return { text: 'Premium', color: COLORS.secondary };
    return { text: 'Expiré', color: COLORS.error };
  };

  const subscriptionStatus = getSubscriptionStatus();

  // Get display name
  const getDisplayName = () => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    // Fallback to email username
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.title')}</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {/* Profile Photo */}
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => router.push('/edit-profile')}
            >
              {profile?.photo_url ? (
                <Image
                  source={{ uri: profile.photo_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={COLORS.textLight} />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="pencil" size={12} color={COLORS.textWhite} />
              </View>
            </TouchableOpacity>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{getDisplayName()}</Text>
              {profile?.last_name && (
                <Text style={styles.userLastName}>{profile.last_name}</Text>
              )}
              <View style={[styles.subscriptionBadge, { backgroundColor: subscriptionStatus.color }]}>
                <Text style={styles.subscriptionText}>{subscriptionStatus.text}</Text>
              </View>
            </View>
          </View>
          
          {/* Edit Profile Button */}
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.editProfileText}>Modifier le profil</Text>
          </TouchableOpacity>
        </Card>

        {/* Personal Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>{t('onboarding.age')}</Text>
            <Text style={styles.infoValue}>{profile?.age || '-'} {t('onboarding.ageUnit')}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="fitness-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>{t('onboarding.weight')}</Text>
            <Text style={styles.infoValue}>{profile?.weight || '-'} {t('onboarding.weightUnit')}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="resize-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>{t('onboarding.height')}</Text>
            <Text style={styles.infoValue}>{profile?.height || '-'} {t('onboarding.heightUnit')}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="trophy-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>{t('onboarding.goal')}</Text>
            <Text style={styles.infoValue}>{getGoalText(profile?.goal || '')}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="flame-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>{t('dashboard.calories')}</Text>
            <Text style={styles.infoValue}>{profile?.daily_calories || '-'} kcal/jour</Text>
          </View>
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/achievements')}>
            <View style={styles.settingLeft}>
              <Ionicons name="trophy-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.settingText}>Mes succès</Text>
            </View>
            <View style={styles.settingRight}>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/coach')}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubbles-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.settingText}>Coach IA</Text>
            </View>
            <View style={styles.settingRight}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={handleLanguageChange}>
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.settingText}>{t('settings.language')}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {i18n.locale === 'fr' ? 'Français' : i18n.locale === 'de' ? 'Deutsch' : 'Italiano'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/paywall-new')}>
            <View style={styles.settingLeft}>
              <Ionicons name="diamond-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.settingText}>{t('profile.subscription')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/notifications')}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.settingText}>{t('settings.notifications')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/help')}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.settingText}>{t('profile.help')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/about')}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.settingText}>{t('profile.about')}</Text>
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

        {/* App Version */}
        <Text style={styles.versionText}>NutriSnap v1.0.0</Text>
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
    backgroundColor: COLORS.border,
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
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  userLastName: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
    color: COLORS.textWhite,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
  },
  editProfileText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  infoCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
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
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  logoutButton: {
    marginTop: SPACING.md,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.lg,
  },
  newBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  premiumBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
});
