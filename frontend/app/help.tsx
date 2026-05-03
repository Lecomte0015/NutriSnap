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
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { Card, MascotAnimated } from '../src/components';
import { useTranslation } from '../src/hooks/useTranslation';

export default function HelpScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const t = useTranslation();
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const faqs = [
    { question: t('help.faq1Question'), answer: t('help.faq1Answer') },
    { question: t('help.faq2Question'), answer: t('help.faq2Answer') },
    { question: t('help.faq3Question'), answer: t('help.faq3Answer') },
    { question: t('help.faq4Question'), answer: t('help.faq4Answer') },
    { question: t('help.faq5Question'), answer: t('help.faq5Answer') },
  ];

  const handleContactSupport = () => {
    Alert.alert(
      t('help.supportTitle'),
      t('help.supportMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('help.supportSend'), onPress: () => Alert.alert(t('help.emailTitle'), t('help.emailBody')) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('help.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mascotSection}>
          <MascotAnimated mood="happy" size={100} />
          <Text style={[styles.mascotText, { color: COLORS.textSecondary }]}>
            {t('help.mascotText')}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{t('help.faqTitle')}</Text>

        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.faqCard, { backgroundColor: COLORS.cardBackground }]}
            onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQuestion, { color: COLORS.textPrimary }]}>{faq.question}</Text>
              <Ionicons
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.textSecondary}
              />
            </View>
            {expandedIndex === index && (
              <Text style={[styles.faqAnswer, { color: COLORS.textSecondary }]}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        <Card style={styles.contactCard}>
          <Text style={[styles.contactTitle, { color: COLORS.textPrimary }]}>{t('help.contactTitle')}</Text>
          <Text style={[styles.contactText, { color: COLORS.textSecondary }]}>
            {t('help.contactText')}
          </Text>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: COLORS.secondary }]}
            onPress={handleContactSupport}
          >
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>{t('help.contactButton')}</Text>
          </TouchableOpacity>
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
  mascotSection: { alignItems: 'center', marginBottom: SPACING.lg },
  mascotText: { fontSize: 15, marginTop: SPACING.sm, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: SPACING.md },
  faqCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQuestion: { fontSize: 15, fontWeight: '500', flex: 1, paddingRight: SPACING.sm },
  faqAnswer: { fontSize: 14, marginTop: SPACING.md, lineHeight: 22 },
  contactCard: { marginTop: SPACING.lg, alignItems: 'center' },
  contactTitle: { fontSize: 16, fontWeight: '600', marginBottom: SPACING.sm },
  contactText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.md,
  },
  contactButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginLeft: SPACING.sm },
});
