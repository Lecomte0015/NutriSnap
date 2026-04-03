import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { Card, MascotAnimated } from '../src/components';

export default function NotificationsScreen() {
  const router = useRouter();
  const [mealReminders, setMealReminders] = React.useState(true);
  const [dailyMotivation, setDailyMotivation] = React.useState(true);
  const [streakAlerts, setStreakAlerts] = React.useState(true);
  const [weeklyReport, setWeeklyReport] = React.useState(false);

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

        {/* Notification Settings */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Rappels de repas</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="restaurant-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Rappels de repas</Text>
                <Text style={styles.settingDescription}>Petit-dejeuner, dejeuner et diner</Text>
              </View>
            </View>
            <Switch
              value={mealReminders}
              onValueChange={setMealReminders}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="sunny-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Motivation quotidienne</Text>
                <Text style={styles.settingDescription}>Un message chaque matin</Text>
              </View>
            </View>
            <Switch
              value={dailyMotivation}
              onValueChange={setDailyMotivation}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>
        </Card>

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
              value={streakAlerts}
              onValueChange={setStreakAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="bar-chart-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Rapport hebdomadaire</Text>
                <Text style={styles.settingDescription}>Resume de ta semaine</Text>
              </View>
            </View>
            <Switch
              value={weeklyReport}
              onValueChange={setWeeklyReport}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            Les notifications t'aident a rester sur la bonne voie. Tu peux les desactiver a tout moment.
          </Text>
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
    marginBottom: SPACING.lg,
  },
  mascotText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
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
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '10',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
});
