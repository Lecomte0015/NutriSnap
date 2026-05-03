import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { MascotAnimated, Button, Card } from '../src/components';
import { Testimonials, SocialProof } from '../src/components';
import { useStore } from '../src/store/useStore';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  pricePerDay: string;
  period: string;
  features: PlanFeature[];
  popular?: boolean;
  savings?: string;
}


export default function PaywallScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const { user } = useStore();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const t = useTranslation();

  const PLANS: Plan[] = [
    {
      id: 'free',
      name: t('subscription.free'),
      price: '0 CHF',
      pricePerDay: '',
      period: '',
      features: [
        { text: t('subscription.feat3scans'), included: true },
        { text: t('subscription.featCalories'), included: true },
        { text: t('subscription.feat7days'), included: true },
        { text: t('subscription.featUnlimited'), included: false },
        { text: t('subscription.featCoach'), included: false },
        { text: t('subscription.featRecipes'), included: false },
        { text: t('subscription.featPdf'), included: false },
        { text: t('subscription.featOffline'), included: false },
      ],
    },
    {
      id: 'monthly',
      name: t('subscription.monthly'),
      price: '9.99 CHF',
      pricePerDay: `0.33 CHF${t('subscription.perDay')}`,
      period: t('subscription.perMonth'),
      features: [
        { text: t('subscription.featUnlimited'), included: true },
        { text: t('subscription.featCalories'), included: true },
        { text: t('subscription.featureHistory'), included: true },
        { text: t('subscription.featCoach'), included: true },
        { text: t('subscription.featRecipes'), included: true },
        { text: t('subscription.featPdf'), included: true },
        { text: t('subscription.featOffline'), included: true },
        { text: t('subscription.featSupport'), included: true },
      ],
      popular: true,
    },
    {
      id: 'yearly',
      name: t('subscription.yearly'),
      price: '59.99 CHF',
      pricePerDay: `0.16 CHF${t('subscription.perDay')}`,
      period: t('subscription.perYear'),
      savings: t('subscription.savePercent', { percent: '50%' }),
      features: [
        { text: t('subscription.featUnlimited'), included: true },
        { text: t('subscription.featCalories'), included: true },
        { text: t('subscription.featureHistory'), included: true },
        { text: t('subscription.featCoach'), included: true },
        { text: t('subscription.featRecipes'), included: true },
        { text: t('subscription.featPdf'), included: true },
        { text: t('subscription.featOffline'), included: true },
        { text: t('subscription.featSupport'), included: true },
      ],
    },
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubscribe = () => {
    console.log('Subscribe to:', selectedPlan);
    router.back();
  };

  const handleBundlePurchase = () => {
    // Lien Gumroad ou page de vente — à remplacer par la vraie URL
    const bundleUrl = 'https://lecomte0015.github.io/NutriSnap/bundle.html';
    if (Platform.OS === 'web') {
      window.open(bundleUrl, '_blank');
    } else {
      Linking.openURL(bundleUrl);
    }
  };

  const renderPlanCard = (plan: Plan) => {
    const isSelected = selectedPlan === plan.id;
    const isFree = plan.id === 'free';

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          { backgroundColor: COLORS.cardBackground, borderColor: COLORS.border },
          (isSelected || plan.popular) && { borderColor: COLORS.secondary },
        ]}
        onPress={() => handlePlanSelect(plan.id)}
        activeOpacity={0.8}
      >
        {plan.popular && (
          <View style={[styles.popularBadge, { backgroundColor: COLORS.secondary }]}>
            <Text style={styles.popularText}>{t('subscription.popular')}</Text>
          </View>
        )}

        {plan.savings && (
          <View style={[styles.savingsBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.savingsText}>{plan.savings}</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={[styles.planName, { color: COLORS.textSecondary }]}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.planPrice, { color: COLORS.textPrimary }]}>{plan.price}</Text>
            {plan.period && <Text style={[styles.planPeriod, { color: COLORS.textSecondary }]}>{plan.period}</Text>}
          </View>
          {plan.pricePerDay && (
            <Text style={[styles.pricePerDay, { color: COLORS.secondary }]}>{plan.pricePerDay}</Text>
          )}
        </View>

        {isSelected && !isFree && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <MascotAnimated mood="excited" size={120} />
          <Text style={[styles.heroTitle, { color: COLORS.textPrimary }]}>{t('subscription.heroTitle')}</Text>
          <Text style={[styles.heroSubtitle, { color: COLORS.textSecondary }]}>{t('subscription.heroSubtitle')}</Text>
        </View>

        {/* Social Proof */}
        <SocialProof />

        {/* Guarantee Badge */}
        <View style={[styles.guaranteeContainer, { backgroundColor: COLORS.success + '15' }]}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
          <Text style={[styles.guaranteeText, { color: COLORS.success }]}>{t('subscription.guarantee')}</Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          <Text style={[styles.plansTitle, { color: COLORS.textPrimary }]}>{t('subscription.choosePlan')}</Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View style={styles.plansRow}>
              {PLANS.map(renderPlanCard)}
            </View>
          </Animated.View>
        </View>

        {/* ── BUNDLE CARD ── */}
        <TouchableOpacity
          style={styles.bundleCard}
          onPress={handleBundlePurchase}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#1d7a7d', '#2fa4a7', '#3bbfc3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bundleGradient}
          >
            {/* Badge */}
            <View style={styles.bundleBestBadge}>
              <Text style={styles.bundleBestText}>🔥 MEILLEURE OFFRE</Text>
            </View>

            {/* Header */}
            <View style={styles.bundleHeader}>
              <Text style={styles.bundleEmoji}>📘</Text>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={styles.bundleTitle}>Offre Complète</Text>
                <Text style={styles.bundleSubtitle}>Ebook + Premium Annuel</Text>
              </View>
              <View style={styles.bundlePriceBlock}>
                <Text style={styles.bundleOldPrice}>87€</Text>
                <Text style={styles.bundlePrice}>39€</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.bundleDivider} />

            {/* Inclus */}
            <Text style={styles.bundleIncludedTitle}>Ce que tu reçois :</Text>
            {[
              { icon: '📘', text: 'Ebook "La Méthode NutriSnap" (PDF, 44 pages)' },
              { icon: '✅', text: 'Premium illimité pendant 1 an' },
              { icon: '🤖', text: 'Coach IA illimité + analyses sans limite' },
              { icon: '🎁', text: 'Code promo EBOOK30 inclus (-30% renouvellement)' },
            ].map((item, i) => (
              <View key={i} style={styles.bundleFeatureRow}>
                <Text style={styles.bundleFeatureIcon}>{item.icon}</Text>
                <Text style={styles.bundleFeatureText}>{item.text}</Text>
              </View>
            ))}

            {/* CTA */}
            <View style={styles.bundleCta}>
              <Text style={styles.bundleCtaText}>Obtenir l'offre complète →</Text>
            </View>

            <Text style={styles.bundleSavings}>Tu économises 48€ · Accès immédiat au PDF</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Features Comparison */}
        {selectedPlanData && selectedPlanData.id !== 'free' && (
          <Card style={styles.featuresCard}>
            <Text style={[styles.featuresTitle, { color: COLORS.textPrimary }]}>{t('subscription.includedFeatures')}</Text>
            {selectedPlanData.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons
                  name={feature.included ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={feature.included ? COLORS.success : COLORS.error}
                />
                <Text
                  style={[
                    styles.featureText,
                    { color: COLORS.textPrimary },
                    !feature.included && { color: COLORS.textLight, textDecorationLine: 'line-through' },
                  ]}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Testimonials */}
        <Testimonials />

        {/* CTA Button */}
        <View style={styles.ctaContainer}>
          {selectedPlan !== 'free' ? (
            <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe}>
              <LinearGradient
                colors={[COLORS.secondary, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>{t('subscription.startNow')}</Text>
                <Text style={styles.ctaSubtext}>{t('subscription.cancelAnytime')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.back()}
            >
              <Text style={[styles.continueText, { color: COLORS.textSecondary }]}>{t('subscription.continueWithFree')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Security Badges */}
        <View style={styles.securitySection}>
          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={16} color={COLORS.textLight} />
            <Text style={[styles.securityText, { color: COLORS.textLight }]}>{t('subscription.securePayment')}</Text>
          </View>
          <View style={styles.securityBadge}>
            <Ionicons name="card" size={16} color={COLORS.textLight} />
            <Text style={[styles.securityText, { color: COLORS.textLight }]}>Apple Pay / Google Pay</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  guaranteeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  guaranteeText: {
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  plansContainer: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  plansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: 4,
    borderWidth: 2,
    ...SHADOWS.small,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.xs,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  planPeriod: {
    fontSize: 12,
  },
  pricePerDay: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  featuresCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  featureText: {
    fontSize: 14,
    marginLeft: SPACING.sm,
  },
  ctaContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xl,
  },
  ctaButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  ctaGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  continueButton: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 14,
  },
  securitySection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.lg,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    marginLeft: 4,
  },

  // ── Bundle ──────────────────────────────────────────────────
  bundleCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 6px 24px rgba(47,164,167,0.35)' } as any,
      default: {
        shadowColor: '#2fa4a7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
  },
  bundleGradient: {
    padding: SPACING.lg,
  },
  bundleBestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginBottom: SPACING.md,
  },
  bundleBestText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bundleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bundleEmoji: {
    fontSize: 36,
  },
  bundleTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  bundleSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  bundlePriceBlock: {
    alignItems: 'flex-end',
  },
  bundleOldPrice: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  bundlePrice: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
  },
  bundleDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: SPACING.md,
  },
  bundleIncludedTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bundleFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  bundleFeatureIcon: {
    fontSize: 14,
    minWidth: 20,
  },
  bundleFeatureText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  bundleCta: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  bundleCtaText: {
    color: '#1d7a7d',
    fontSize: 15,
    fontWeight: '800',
  },
  bundleSavings: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'center',
  },
});
