import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { MascotAnimated, Button, Card } from '../src/components';
import { Testimonials, SocialProof } from '../src/components';
import { useStore } from '../src/store/useStore';
import i18n from '../src/i18n';

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

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0\u20ac',
    pricePerDay: '',
    period: '',
    features: [
      { text: '3 scans par jour', included: true },
      { text: 'Suivi des calories', included: true },
      { text: 'Historique 7 jours', included: true },
      { text: 'Scans illimit\u00e9s', included: false },
      { text: 'Coach IA personnel', included: false },
      { text: 'Suggestions recettes', included: false },
      { text: 'Export PDF', included: false },
      { text: 'Mode hors-ligne', included: false },
    ],
  },
  {
    id: 'monthly',
    name: 'Mensuel',
    price: '9.99\u20ac',
    pricePerDay: '0.33\u20ac/jour',
    period: '/mois',
    features: [
      { text: 'Scans illimit\u00e9s', included: true },
      { text: 'Suivi des calories', included: true },
      { text: 'Historique complet', included: true },
      { text: 'Coach IA personnel', included: true },
      { text: 'Suggestions recettes', included: true },
      { text: 'Export PDF', included: true },
      { text: 'Mode hors-ligne', included: true },
      { text: 'Support prioritaire', included: true },
    ],
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Annuel',
    price: '59.99\u20ac',
    pricePerDay: '0.16\u20ac/jour',
    period: '/an',
    savings: '\u00c9conomisez 50%',
    features: [
      { text: 'Scans illimit\u00e9s', included: true },
      { text: 'Suivi des calories', included: true },
      { text: 'Historique complet', included: true },
      { text: 'Coach IA personnel', included: true },
      { text: 'Suggestions recettes', included: true },
      { text: 'Export PDF', included: true },
      { text: 'Mode hors-ligne', included: true },
      { text: 'Support prioritaire', included: true },
    ],
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { user } = useStore();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const t = i18n.t.bind(i18n);

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
    // Would integrate with RevenueCat here
    console.log('Subscribe to:', selectedPlan);
    router.back();
  };

  const renderPlanCard = (plan: Plan) => {
    const isSelected = selectedPlan === plan.id;
    const isFree = plan.id === 'free';

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
          plan.popular && styles.planCardPopular,
        ]}
        onPress={() => handlePlanSelect(plan.id)}
        activeOpacity={0.8}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>\u2b50 POPULAIRE</Text>
          </View>
        )}

        {plan.savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{plan.savings}</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.planPrice}>{plan.price}</Text>
            {plan.period && <Text style={styles.planPeriod}>{plan.period}</Text>}
          </View>
          {plan.pricePerDay && (
            <Text style={styles.pricePerDay}>{plan.pricePerDay}</Text>
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
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.heroTitle}>Passe au niveau sup\u00e9rieur !</Text>
          <Text style={styles.heroSubtitle}>
            D\u00e9bloque toutes les fonctionnalit\u00e9s et atteins tes objectifs plus rapidement
          </Text>
        </View>

        {/* Social Proof */}
        <SocialProof />

        {/* Guarantee Badge */}
        <View style={styles.guaranteeContainer}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
          <Text style={styles.guaranteeText}>
            Garantie satisfait ou rembours\u00e9 14 jours
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Choisis ton plan</Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View style={styles.plansRow}>
              {PLANS.map(renderPlanCard)}
            </View>
          </Animated.View>
        </View>

        {/* Features Comparison */}
        {selectedPlanData && selectedPlanData.id !== 'free' && (
          <Card style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>\u2705 Ce qui est inclus</Text>
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
                    !feature.included && styles.featureTextDisabled,
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
                <Text style={styles.ctaText}>Commencer maintenant</Text>
                <Text style={styles.ctaSubtext}>Annulation facile \u00e0 tout moment</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.back()}
            >
              <Text style={styles.continueText}>Continuer avec le plan gratuit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Security Badges */}
        <View style={styles.securitySection}>
          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={16} color={COLORS.textLight} />
            <Text style={styles.securityText}>Paiement s\u00e9curis\u00e9</Text>
          </View>
          <View style={styles.securityBadge}>
            <Ionicons name="card" size={16} color={COLORS.textLight} />
            <Text style={styles.securityText}>Apple Pay / Google Pay</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  guaranteeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '15',
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  guaranteeText: {
    marginLeft: SPACING.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  plansContainer: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  plansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  planCardSelected: {
    borderColor: COLORS.secondary,
  },
  planCardPopular: {
    borderColor: COLORS.secondary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  popularText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  savingsText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.xs,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  planPeriod: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  pricePerDay: {
    fontSize: 11,
    color: COLORS.secondary,
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
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  featureTextDisabled: {
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
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
    color: COLORS.textWhite,
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
    color: COLORS.textSecondary,
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
    color: COLORS.textLight,
    marginLeft: 4,
  },
});
