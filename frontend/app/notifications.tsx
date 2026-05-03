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
import { SPACING, BORDER_RADIUS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { Card, MascotAnimated } from '../src/components';
import { notificationService, NotificationSettings } from '../src/services/notifications';
import { useTranslation } from '../src/hooks/useTranslation';

export default function NotificationsScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const t = useTranslation();
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
    } catch (error) {
      Alert.alert(t('common.error'), t('notifications.errorSave'));
      setSettings(settings);
    }
  };

  const handleTestNotification = async () => {
    await notificationService.sendLocalNotification(
      t('notifications.testTitle'),
      t('notifications.testBody'),
      { type: 'test' }
    );
  };

  const settingRows = [
    {
      section: t('notifications.mealRemindersSection'),
      items: [
        { key: 'mealReminders' as const, icon: 'restaurant-outline', label: t('notifications.mealRemindersLabel'), desc: t('notifications.mealRemindersDesc') },
        { key: 'dailyMotivation' as const, icon: 'sunny-outline', label: t('notifications.dailyMotivationLabel'), desc: t('notifications.dailyMotivationDesc') },
      ],
    },
    {
      section: t('notifications.alertsSection'),
      items: [
        { key: 'streakAlerts' as const, icon: 'flame-outline', label: t('notifications.streakAlertsLabel'), desc: t('notifications.streakAlertsDesc') },
        { key: 'weeklyReport' as const, icon: 'bar-chart-outline', label: t('notifications.weeklyReportLabel'), desc: t('notifications.weeklyReportDesc') },
      ],
    },
  ];

  const scheduleItems = [
    { time: '08:00', meal: t('notifications.breakfast') },
    { time: '12:30', meal: t('notifications.lunch') },
    { time: '19:00', meal: t('notifications.dinner') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('notifications.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mascotSection}>
          <MascotAnimated mood="happy" size={100} />
          <Text style={[styles.mascotText, { color: COLORS.textSecondary }]}>
            {t('notifications.mascotText')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: COLORS.secondary + '15' }]}
          onPress={handleTestNotification}
        >
          <Ionicons name="notifications" size={20} color={COLORS.secondary} />
          <Text style={[styles.testButtonText, { color: COLORS.secondary }]}>{t('notifications.testButton')}</Text>
        </TouchableOpacity>

        {settingRows.map((group) => (
          <Card key={group.section} style={styles.card}>
            <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{group.section}</Text>
            {group.items.map((item) => (
              <View key={item.key} style={[styles.settingRow, { borderBottomColor: COLORS.border }]}>
                <View style={styles.settingInfo}>
                  <Ionicons name={item.icon as any} size={24} color={COLORS.secondary} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { color: COLORS.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.settingDescription, { color: COLORS.textSecondary }]}>{item.desc}</Text>
                  </View>
                </View>
                <Switch
                  value={settings[item.key]}
                  onValueChange={(value) => handleSettingChange(item.key, value)}
                  trackColor={{ false: COLORS.border, true: COLORS.secondary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </Card>
        ))}

        <Card style={[styles.infoCard, { backgroundColor: COLORS.secondary + '10' }]}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} />
          <Text style={[styles.infoText, { color: COLORS.textSecondary }]}>
            {t('notifications.infoText')}
          </Text>
        </Card>

        <Card style={styles.scheduleCard}>
          <Text style={[styles.scheduleTitle, { color: COLORS.textPrimary }]}>{t('notifications.scheduleTitle')}</Text>
          {scheduleItems.map((item) => (
            <View key={item.time} style={[styles.scheduleItem, { borderBottomColor: COLORS.border }]}>
              <Text style={[styles.scheduleTime, { color: COLORS.secondary }]}>{item.time}</Text>
              <Text style={[styles.scheduleMeal, { color: COLORS.textPrimary }]}>{item.meal}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  mascotSection: { alignItems: 'center', marginBottom: SPACING.md },
  mascotText: { fontSize: 15, marginTop: SPACING.sm, textAlign: 'center' },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  testButtonText: { marginLeft: SPACING.sm, fontSize: 15, fontWeight: '600' },
  card: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: SPACING.md },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingText: { marginLeft: SPACING.md, flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingDescription: { fontSize: 13, marginTop: 2 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 14, marginLeft: SPACING.sm, lineHeight: 20 },
  scheduleCard: { marginTop: SPACING.md },
  scheduleTitle: { fontSize: 16, fontWeight: '600', marginBottom: SPACING.md },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  scheduleTime: { fontSize: 16, fontWeight: 'bold', width: 60 },
  scheduleMeal: { fontSize: 15 },
});
