import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { Card } from '../src/components';
import { useStore } from '../src/store/useStore';
import { useTheme } from '../src/contexts/ThemeContext';
import { useColors } from '../src/hooks/useColors';
import { useTranslation } from '../src/hooks/useTranslation';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, user, meals, dailyStats, streak, hapticsEnabled, soundsEnabled, setHapticsEnabled, setSoundsEnabled } = useStore();
  const { isDark, toggleTheme } = useTheme();
  const COLORS = useColors();
  const t = useTranslation();
  const [analytics, setAnalytics] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);

    try {
      // Fetch all meals from API
      const mealsRes = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/meals/${user.id}?limit=500`
      );
      const mealsData = mealsRes.ok ? await mealsRes.json() : { meals: [] };

      // Fetch weekly report
      const reportRes = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/stats/${user.id}/weekly-report`
      );
      const reportData = reportRes.ok ? await reportRes.json() : {};

      // Fetch weight history
      const weightRes = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/weight/${user.id}?days=365`
      );
      const weightData = weightRes.ok ? await weightRes.json() : { entries: [] };

      const exportData = {
        exportDate: new Date().toISOString(),
        profile: {
          firstName: profile?.first_name,
          age: profile?.age,
          weight: profile?.weight,
          height: profile?.height,
          goal: profile?.goal,
          dailyCaloriesTarget: profile?.daily_calories,
          language: profile?.language,
        },
        streak: {
          current: streak?.current_streak || 0,
          longest: streak?.longest_streak || 0,
        },
        weeklyReport: reportData,
        meals: (mealsData.meals || []).map((m: any) => ({
          date: m.created_at,
          foods: m.foods,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
          score: m.score,
          feedback: m.feedback,
        })),
        weightHistory: weightData.entries || [],
      };

      const json = JSON.stringify(exportData, null, 2);

      await Share.share({
        title: 'Mes données NutriSnap',
        message: `📊 Export NutriSnap — ${new Date().toLocaleDateString('fr-FR')}\n\n${json}`,
      });
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'exporter les données. Vérifie ta connexion.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('dialogs.deleteAccountTitle'),
      t('dialogs.deleteAccountMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAccount'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('dialogs.deleteConfirmTitle'),
              t('dialogs.deleteConfirmMsg'),
              [
                { text: t('dialogs.deleteConfirmNo'), style: 'cancel' },
                {
                  text: t('dialogs.deleteConfirmYes'),
                  style: 'destructive',
                  onPress: async () => {
                    setDeletingAccount(true);
                    Alert.alert(t('dialogs.comingSoon'), t('dialogs.comingSoonMsg'));
                    setDeletingAccount(false);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('settings.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Apparence */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('settings.appearance')}</Text>

          <View style={[styles.settingRow, { borderBottomColor: COLORS.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name={isDark ? 'moon' : 'moon-outline'} size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: COLORS.textPrimary }]}>{t('settings.darkMode')}</Text>
                <Text style={[styles.settingDescription, { color: COLORS.textSecondary }]}>
                  {isDark ? t('settings.darkModeActive') : t('settings.lightModeActive')}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>
        </Card>

        {/* Retours */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('settings.feedback')}</Text>

          <View style={[styles.settingRow, { borderBottomColor: COLORS.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: COLORS.textPrimary }]}>{t('settings.vibrations')}</Text>
                <Text style={[styles.settingDescription, { color: COLORS.textSecondary }]}>
                  {t('settings.vibrationsDesc')}
                </Text>
              </View>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: COLORS.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: COLORS.textPrimary }]}>{t('settings.sounds')}</Text>
                <Text style={[styles.settingDescription, { color: COLORS.textSecondary }]}>
                  {t('settings.soundsDesc')}
                </Text>
              </View>
            </View>
            <Switch
              value={soundsEnabled}
              onValueChange={setSoundsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>
        </Card>

        {/* Confidentialité */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('settings.privacy')}</Text>

          <View style={[styles.settingRow, { borderBottomColor: COLORS.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="analytics-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: COLORS.textPrimary }]}>{t('settings.analytics')}</Text>
                <Text style={[styles.settingDescription, { color: COLORS.textSecondary }]}>
                  {t('settings.analyticsDesc')}
                </Text>
              </View>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>
        </Card>

        {/* Données */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('settings.data')}</Text>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: COLORS.border }]}
            onPress={handleExportData}
            disabled={exporting}
          >
            <View style={styles.settingInfo}>
              {exporting ? (
                <ActivityIndicator size="small" color={COLORS.secondary} />
              ) : (
                <Ionicons name="download-outline" size={24} color={COLORS.secondary} />
              )}
              <Text style={[styles.actionLabel, { color: COLORS.textPrimary }]}>
                {exporting ? t('settings.exportingData') : t('settings.exportData')}
              </Text>
            </View>
            {!exporting && <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: 'transparent' }]}
            onPress={handleDeleteAccount}
            disabled={deletingAccount}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
              <Text style={[styles.actionLabel, { color: COLORS.error }]}>
                {t('settings.deleteAccount')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </Card>

        {/* À propos */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('settings.about')}</Text>

          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: COLORS.textSecondary }]}>{t('settings.version')}</Text>
            <Text style={[styles.aboutValue, { color: COLORS.textPrimary }]}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: COLORS.textSecondary }]}>{t('settings.account')}</Text>
            <Text style={[styles.aboutValue, { color: COLORS.textPrimary }]} numberOfLines={1}>
              {user?.email || '-'}
            </Text>
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  actionLabel: {
    fontSize: 15,
    marginLeft: SPACING.md,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
