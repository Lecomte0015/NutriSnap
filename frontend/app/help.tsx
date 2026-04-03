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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { Card, MascotAnimated } from '../src/components';

export default function HelpScreen() {
  const router = useRouter();

  const faqs = [
    {
      question: 'Comment scanner un repas ?',
      answer: 'Appuie sur le bouton camera au centre de la barre de navigation, prends une photo de ton repas, et notre IA analysera automatiquement les aliments et leurs valeurs nutritionnelles.',
    },
    {
      question: 'Comment fonctionne le score nutritionnel ?',
      answer: 'Le score va de 1 a 10 et est calcule en fonction de l\'equilibre nutritionnel de ton repas : variete des aliments, rapport proteines/glucides/lipides, et presence de legumes.',
    },
    {
      question: 'Comment modifier mon objectif calorique ?',
      answer: 'Va dans Profil puis Modifier le profil pour ajuster ton poids, ta taille ou ton objectif. Ton objectif calorique sera automatiquement recalcule.',
    },
    {
      question: 'Qu\'est-ce que la serie (streak) ?',
      answer: 'La serie represente le nombre de jours consecutifs ou tu as scanne au moins un repas. Plus ta serie est longue, plus tu gagnes de badges !',
    },
    {
      question: 'Comment fonctionne l\'abonnement Premium ?',
      answer: 'Premium te donne acces aux scans illimites, au coach IA, aux suggestions de recettes et bien plus. Tu peux t\'abonner depuis Profil puis Abonnement.',
    },
  ];

  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const handleContactSupport = () => {
    Alert.alert(
      'Contacter le support',
      'Envoyer un email a support@nutrisnap.app ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Envoyer', onPress: () => Alert.alert('Email', 'Fonctionnalite bientot disponible !') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Aide</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mascot */}
        <View style={styles.mascotSection}>
          <MascotAnimated mood="happy" size={100} />
          <Text style={styles.mascotText}>
            Besoin d'aide ? Je suis la !
          </Text>
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Questions frequentes</Text>
        
        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqCard}
            onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.textSecondary}
              />
            </View>
            {expandedIndex === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contact Section */}
        <Card style={styles.contactCard}>
          <Text style={styles.contactTitle}>Besoin d'aide supplementaire ?</Text>
          <Text style={styles.contactText}>
            Notre equipe est la pour t'aider du lundi au vendredi, de 9h a 18h.
          </Text>
          
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="mail-outline" size={20} color={COLORS.textWhite} />
            <Text style={styles.contactButtonText}>Contacter le support</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  faqCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    lineHeight: 22,
  },
  contactCard: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.md,
  },
  contactButtonText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});
