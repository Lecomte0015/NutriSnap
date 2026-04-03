import React from 'react';
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
import { useStore } from '../src/store/useStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile } = useStore();
  const [darkMode, setDarkMode] = React.useState(false);
  const [haptics, setHaptics] = React.useState(true);
  const [sounds, setSounds] = React.useState(true);
  const [analytics, setAnalytics] = React.useState(true);

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    Alert.alert(
      'Mode sombre',
      value ? 'Mode sombre active !' : 'Mode clair active !',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Parametres</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Appearance */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Mode sombre</Text>
                <Text style={styles.settingDescription}>Theme sombre pour vos yeux</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>
        </Card>

        {/* Feedback */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Retours</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Vibrations</Text>
                <Text style={styles.settingDescription}>Retour haptique lors des actions</Text>
              </View>
            </View>
            <Switch
              value={haptics}
              onValueChange={setHaptics}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Sons</Text>
                <Text style={styles.settingDescription}>Sons de celebration et feedback</Text>
              </View>
            </View>
            <Switch
              value={sounds}
              onValueChange={setSounds}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.textWhite}
            />
          </View>
        </Card>

        {/* Privacy */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Confidentialite</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="analytics-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Analytiques</Text>
                <Text style={styles.settingDescription}>Aider a ameliorer l'app</Text>
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

        {/* Data */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Donnees</Text>
          
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="download-outline" size={24} color={COLORS.secondary} />
              <Text style={styles.actionLabel}>Exporter mes donnees</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
              <Text style={[styles.actionLabel, { color: COLORS.error }]}>Supprimer mon compte</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.version}>NutriSnap v1.0.0</Text>
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  version: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: SPACING.lg,
  },
});
