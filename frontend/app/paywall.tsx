import React, { useState } from 'react';
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
import { Button, Card, Mascot } from '../src/components';
import { useStore } from '../src/store/useStore';
import i18n from '../src/i18n';

type Plan = 'monthly' | 'yearly';

export default function PaywallScreen() {
  const router = useRouter();
  const { user, subscription, setSubscription, setIsPremium } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [loading, setLoading] = useState(false);
  const t = i18n.t.bind(i18n);

  const plans = {
    monthly: {
      price: '€9.99',
      period: t('subscription.perMonth'),
      savings: null,
    },
    yearly: {
      price: '€59.99',
      period: t('subscription.perYear'),
      savings: '50%',
    },
  };

  const handleSubscribe = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // In production, this would call RevenueCat
      // For now, we'll simulate a subscription
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/subscriptions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            plan: selectedPlan,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setIsPremium(true);
        Alert.alert(
          t('common.success'),
          `Vous êtes maintenant abonné à NutriSnap Premium !`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(t('common.error'), t('errors.generic'));
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert(t('common.error'), t('errors.network'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      t('subscription.restore'),
      'Cette fonctionnalité sera disponible avec RevenueCat en production.',
      [{ text: 'OK' }]
    );
  };

  const isCurrentlyTrial = subscription?.status === 'trial';
  const trialDaysLeft = subscription?.trial_end_date
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 14;

  return (
    <SafeAreaView style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Mascot mood="excited" size={100} />
          <Text style={styles.title}>{t('subscription.title')}</Text>
          {isCurrentlyTrial && (
            <View style={styles.trialBadge}>
              <Ionicons name="time-outline" size={16} color={COLORS.textWhite} />
              <Text style={styles.trialText}>
                {trialDaysLeft} jours restants
              </Text>
            </View>
          )}
        </View>

        {/* Features comparison */}
        <Card style={styles.featuresCard}>
          <View style={styles.featureRow}>
            <Text style={styles.featureLabel}>Analyses par jour</Text>
            <View style={styles.featureComparison}>
              <View style={styles.freeColumn}>
                <Text style={styles.columnHeader}>Gratuit</Text>
                <Text style={styles.featureValueFree}>3</Text>
              </View>
              <View style={styles.premiumColumn}>
                <Text style={styles.columnHeaderPremium}>Premium</Text>
                <Text style={styles.featureValuePremium}>Illimité</Text>
              </View>
            </View>
          </View>

          <View style={styles.featureDivider} />

          {[
            { label: 'Suivi complet', free: false, premium: true },
            { label: 'Coaching avancé', free: false, premium: true },
            { label: 'Historique complet', free: false, premium: true },
            { label: 'Sans publicité', free: false, premium: true },
          ].map((feature, index) => (
            <View key={index}>
              <View style={styles.featureRowSimple}>
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <View style={styles.featureIcons}>
                  <Ionicons
                    name={feature.free ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={feature.free ? COLORS.success : COLORS.error}
                  />
                  <Ionicons
                    name={feature.premium ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={feature.premium ? COLORS.success : COLORS.error}
                    style={styles.premiumIcon}
                  />
                </View>
              </View>
              {index < 3 && <View style={styles.featureDivider} />}
            </View>
          ))}
        </Card>

        {/* Plan selection */}
        <Text style={styles.selectPlanTitle}>Choisissez votre plan</Text>

        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'yearly' && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan('yearly')}
        >
          {plans.yearly.savings && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Économisez {plans.yearly.savings}</Text>
            </View>
          )}
          <View style={styles.planContent}>
            <View style={styles.planRadio}>
              <View style={[
                styles.radioOuter,
                selectedPlan === 'yearly' && styles.radioOuterSelected,
              ]}>
                {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{t('subscription.yearly')}</Text>
              <Text style={styles.planPrice}>
                {plans.yearly.price}
                <Text style={styles.planPeriod}>{plans.yearly.period}</Text>
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'monthly' && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan('monthly')}
        >
          <View style={styles.planContent}>
            <View style={styles.planRadio}>
              <View style={[
                styles.radioOuter,
                selectedPlan === 'monthly' && styles.radioOuterSelected,
              ]}>
                {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{t('subscription.monthly')}</Text>
              <Text style={styles.planPrice}>
                {plans.monthly.price}
                <Text style={styles.planPeriod}>{plans.monthly.period}</Text>
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Subscribe button */}
        <Button
          title={isCurrentlyTrial ? t('subscription.subscribe') : t('subscription.startTrial')}
          onPress={handleSubscribe}
          loading={loading}
          style={styles.subscribeButton}
        />

        {/* Restore purchases */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreText}>{t('subscription.restore')}</Text>
        </TouchableOpacity>

        {/* Legal links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity>
            <Text style={styles.legalText}>{t('subscription.terms')}</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>|</Text>
          <TouchableOpacity>
            <Text style={styles.legalText}>{t('subscription.privacy')}</Text>
          </TouchableOpacity>
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
  closeButton: {
    position: 'absolute',
    top: 60,
    right: SPACING.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...SHADOWS.small,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.sm,
  },
  trialText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  featuresCard: {
    marginBottom: SPACING.lg,
  },
  featureRow: {
    marginBottom: SPACING.sm,
  },
  featureRowSimple: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  featureLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  featureComparison: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  freeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  premiumColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnHeader: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  columnHeaderPremium: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  featureValueFree: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  featureValuePremium: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  featureIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIcon: {
    marginLeft: SPACING.xl,
  },
  featureDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  selectPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  planCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  planCardSelected: {
    borderColor: COLORS.secondary,
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  savingsText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planRadio: {
    marginRight: SPACING.md,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.secondary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 4,
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  subscribeButton: {
    marginTop: SPACING.lg,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  restoreText: {
    color: COLORS.secondary,
    fontSize: 14,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  legalText: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  legalDivider: {
    color: COLORS.textLight,
    marginHorizontal: SPACING.sm,
  },
});
