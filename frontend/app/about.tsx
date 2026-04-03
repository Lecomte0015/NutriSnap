import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { Card, MascotAnimated } from '../src/components';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>A propos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo & Mascot */}
        <View style={styles.logoSection}>
          <MascotAnimated mood="happy" size={120} />
          <Text style={styles.appName}>NutriSnap</Text>
          <Text style={styles.appTagline}>Ton coach nutrition intelligent</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* About Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Notre mission</Text>
          <Text style={styles.cardText}>
            NutriSnap a ete cree pour rendre le suivi nutritionnel simple et accessible a tous. 
            Grace a l'intelligence artificielle, nous analysons tes repas en un instant pour 
            t'aider a atteindre tes objectifs de sante.
          </Text>
        </Card>

        {/* Features */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Ce que nous offrons</Text>
          
          <View style={styles.featureRow}>
            <Ionicons name="camera" size={24} color={COLORS.secondary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Analyse IA instantanee</Text>
              <Text style={styles.featureDescription}>Scanne tes repas et obtiens une analyse complete</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="trophy" size={24} color={COLORS.secondary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Gamification</Text>
              <Text style={styles.featureDescription}>Gagne des badges et reste motive</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="chatbubbles" size={24} color={COLORS.secondary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Coach IA</Text>
              <Text style={styles.featureDescription}>Des conseils personnalises 24/7</Text>
            </View>
          </View>
        </Card>

        {/* Links */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Liens utiles</Text>
          
          <TouchableOpacity 
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://nutrisnap.app/privacy')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>Politique de confidentialite</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://nutrisnap.app/terms')}
          >
            <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>Conditions d'utilisation</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://nutrisnap.app')}
          >
            <Ionicons name="globe-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>Site web</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Footer */}
        <Text style={styles.footer}>
          Fait avec amour en Suisse
        </Text>
        <Text style={styles.copyright}>
          2025 NutriSnap. Tous droits reserves.
        </Text>
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
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: SPACING.md,
  },
  appTagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  version: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  cardText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  featureText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  footer: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});
