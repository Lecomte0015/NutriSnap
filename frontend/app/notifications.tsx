import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { Card, MascotAnimated } from '../src/components';
import { notificationService, NotificationSettings } from '../src/services/notifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>({
    mealReminders: true,
    dailyMotivation: true,
    streakAlerts: true,
    weeklyReport: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await notificationService.getSettings();
    setSettings(savedSettings);
    setLoading(false);
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await notificationService.saveSettings(newSettings);
      
      if (value) {
        Alert.alert('Active', 'Les notifications ont ete activees.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les parametres.');
      // Revert
      setSettings(settings);
    }
  };

  const handleTestNotification = async () => {
    await notificationService.sendLocalNotification(
      'Test de notification',
      'Super ! Les notifications fonctionnent correctement.',
      { type: 'test' }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mascot */}
        <View style={styles.mascotSection}>
          <MascotAnimated mood="happy" size={100} />
          <Text style={styles.mascotText}>
            Je serai la pour te rappeler de prendre soin de toi !
          </Text>
        </View>

        {/* Test Button */}
        <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
          <Ionicons name="notifications" size={20} color={COLORS.secondary} />
          <Text style={styles.testButtonText}>Tester les notifications</Text>
        </TouchableOpacity>

        {/* Meal Reminders */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Rappels de repas</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="restaurant-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Rappels de repas</Text>
                <Text style={styles.settingDescription}>8h, 12h30 et 19h</Text>
              </View>
            </View>
            <Switch
              value={settings.mealReminders}
              onValueChange={(value) => handleSettingChange('mealReminders', value)}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="sunny-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Motivation quotidienne</Text>
                <Text style={styles.settingDescription}>Un message chaque matin a 9h</Text>
              </View>
            </View>
            <Switch
              value={settings.dailyMotivation}
              onValueChange={(value) => handleSettingChange('dailyMotivation', value)}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>
        </Card>

        {/* Alerts */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Alertes</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="flame-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Alertes de serie</Text>
                <Text style={styles.settingDescription}>Ne perds pas ta serie !</Text>
              </View>
            </View>
            <Switch
              value={settings.streakAlerts}
              onValueChange={(value) => handleSettingChange('streakAlerts', value)}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="bar-chart-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Rapport hebdomadaire</Text>
                <Text style={styles.settingDescription}>Resume de ta semaine le dimanche</Text>
              </View>
            </View>
            <Switch
              value={settings.weeklyReport}
              onValueChange={(value) => handleSettingChange('weeklyReport', value)}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            Les notifications t'aident a rester sur la bonne voie. Tu peux les desactiver a tout moment dans les parametres de ton telephone.
          </Text>
        </Card>

        {/* Schedule Info */}
        <Card style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>Horaires des rappels</Text>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>08:00</Text>
            <Text style={styles.scheduleMeal}>Petit-dejeuner</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>12:30</Text>
            <Text style={styles.scheduleMeal}>Dejeuner</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>19:00</Text>
            <Text style={styles.scheduleMeal}>Diner</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  mascotSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mascotText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  testButtonText: {
    marginLeft: SPACING.sm,
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    color: COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.secondary + '10',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  scheduleCard: {
    marginTop: SPACING.md,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    width: 60,
  },
  scheduleMeal: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
});
