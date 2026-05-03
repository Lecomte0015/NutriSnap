import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { Card, MascotAnimated } from '../src/components';
import { useTranslation } from '../src/hooks/useTranslation';

export default function AboutScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const t = useTranslation();

  const showPrivacyPolicy = () => {
    Alert.alert(t('about.privacyTitle'), t('about.privacyText'), [{ text: t('about.close'), style: 'default' }]);
  };

  const showTermsOfService = () => {
    Alert.alert(t('about.termsTitle'), t('about.termsText'), [{ text: t('about.close'), style: 'default' }]);
  };

  const showWebsite = () => {
    Alert.alert(t('about.websiteTitle'), t('about.websiteText'), [{ text: t('about.close'), style: 'default' }]);
  };

  const features = [
    { icon: 'camera', title: t('about.feature1Title'), desc: t('about.feature1Desc') },
    { icon: 'trophy', title: t('about.feature2Title'), desc: t('about.feature2Desc') },
    { icon: 'chatbubbles', title: t('about.feature3Title'), desc: t('about.feature3Desc') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('about.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <MascotAnimated mood="happy" size={120} />
          <Text style={[styles.appName, { color: COLORS.secondary }]}>NutriSnap</Text>
          <Text style={[styles.appTagline, { color: COLORS.textSecondary }]}>{t('about.tagline')}</Text>
          <Text style={[styles.version, { color: COLORS.textLight }]}>Version 1.0.0</Text>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: COLORS.textPrimary }]}>{t('about.missionTitle')}</Text>
          <Text style={[styles.cardText, { color: COLORS.textSecondary }]}>{t('about.missionText')}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: COLORS.textPrimary }]}>{t('about.featuresTitle')}</Text>
          {features.map((feature, i) => (
            <View key={i} style={[styles.featureRow, { borderBottomColor: COLORS.border }]}>
              <Ionicons name={feature.icon as any} size={24} color={COLORS.secondary} />
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: COLORS.textPrimary }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: COLORS.textSecondary }]}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: COLORS.textPrimary }]}>{t('about.legalTitle')}</Text>

          <TouchableOpacity style={[styles.linkRow, { borderBottomColor: COLORS.border }]} onPress={showPrivacyPolicy}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
            <Text style={[styles.linkText, { color: COLORS.textPrimary }]}>{t('about.privacyPolicy')}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.linkRow, { borderBottomColor: COLORS.border }]} onPress={showTermsOfService}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
            <Text style={[styles.linkText, { color: COLORS.textPrimary }]}>{t('about.termsOfService')}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.linkRow, { borderBottomWidth: 0 }]} onPress={showWebsite}>
            <Ionicons name="globe-outline" size={20} color={COLORS.textSecondary} />
            <Text style={[styles.linkText, { color: COLORS.textPrimary }]}>{t('about.website')}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </Card>

        <Text style={[styles.footer, { color: COLORS.textSecondary }]}>{t('about.footer')}</Text>
        <Text style={[styles.copyright, { color: COLORS.textLight }]}>{t('about.copyright')}</Text>
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
  logoSection: { alignItems: 'center', marginBottom: SPACING.lg },
  appName: { fontSize: 28, fontWeight: 'bold', marginTop: SPACING.md },
  appTagline: { fontSize: 16, marginTop: SPACING.xs },
  version: { fontSize: 14, marginTop: SPACING.xs },
  card: { marginBottom: SPACING.md },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: SPACING.md },
  cardText: { fontSize: 15, lineHeight: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  featureText: { marginLeft: SPACING.md, flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '500' },
  featureDescription: { fontSize: 13, marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  linkText: { flex: 1, fontSize: 15, marginLeft: SPACING.sm },
  footer: { textAlign: 'center', fontSize: 14, marginTop: SPACING.lg },
  copyright: { textAlign: 'center', fontSize: 12, marginTop: SPACING.xs },
});
